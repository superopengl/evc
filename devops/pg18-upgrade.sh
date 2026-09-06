#!/usr/bin/env bash
# Aggressive in-place RDS PostgreSQL 14.22 -> 18.6 upgrade for `evc`.
# Companion to RUNBOOK-pg14-to-pg18.md. Run steps individually; each is idempotent
# except `upgrade`. Nothing here is destructive without an explicit confirm.
#
#   ./pg18-upgrade.sh prep-gp3        # >=1 day before  (no downtime)
#   ./pg18-upgrade.sh prep-prune      # >=1 day before  (no downtime)
#   ./pg18-upgrade.sh freeze          # window starts
#   ./pg18-upgrade.sh upgrade
#   ./pg18-upgrade.sh maint-params
#   ./pg18-upgrade.sh reindex
#   ./pg18-upgrade.sh matviews        # branches on whether pg_upgrade kept the data
#   ./pg18-upgrade.sh stats
#   ./pg18-upgrade.sh revert-params
#   ./pg18-upgrade.sh thaw
#   ./pg18-upgrade.sh verify
#
#   ./pg18-upgrade.sh unlock          # any time: clear leaked JOBKEY_* Redis locks
#                                     # (Redis is VPC-only, so this runs as a Fargate task)
set -euo pipefail

export AWS_PROFILE=${AWS_PROFILE:-evc}
export AWS_REGION=${AWS_REGION:-us-east-1}
INSTANCE=evc
DBNAME=evcprod
DBUSER=postgres
TARGET_VERSION=18.6
PG18_GROUP=evc-utc-timezone18
CLUSTER=evc
CA=/tmp/rds-global-bundle.pem
JOBS=4

SERVICES=(evc-portal evc-daemon)

# Only evc-portal has an Application Auto Scaling target (min 2 / max 8, CPU target
# tracking). It is NOT suspended by default, so `freeze`'s desired-count 0 would be
# clamped back to MinCapacity by the next scaling activity. freeze suspends, thaw resumes.
AAS_TARGETS=(service/evc/evc-portal)

# Redis lives in the VPC with no public endpoint, so `redis-cli` from a laptop cannot
# reach it. `unlock` borrows this task definition (it carries REDIS_URL and is the
# cheapest) and overrides its command to clear the locks from inside the VPC.
ONEOFF_TD=evc-cron-adjust
# run-task needs subnets/SG; take them from what the scheduled rules already use.
NETCFG_RULE=daily-insider
RULES=(adjust-cron-march adjust-cron-november daily-close daily-earnings-calendar
       daily-insider daily-opc daily-opc-history daily-putcall daily-subscription
       daily-uoa feed-eps)

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$*"; }
confirm() { read -r -p "    $1 [type yes]: " a; [ "$a" = yes ] || { echo "aborted"; exit 1; }; }

host() { aws rds describe-db-instances --db-instance-identifier "$INSTANCE" \
         --query 'DBInstances[0].Endpoint.Address' --output text; }

pw() { aws ecs describe-task-definition --task-definition evc-portal \
       --query "taskDefinition.containerDefinitions[0].environment[?name=='TYPEORM_PASSWORD'].value | [0]" \
       --output text; }

psql_ro() { PGPASSWORD=$(pw) PGOPTIONS='-c default_transaction_read_only=on' \
  psql "host=$(host) port=5432 dbname=$DBNAME user=$DBUSER sslmode=verify-full sslrootcert=$CA" "$@"; }

psql_rw() { PGPASSWORD=$(pw) \
  psql "host=$(host) port=5432 dbname=$DBNAME user=$DBUSER sslmode=verify-full sslrootcert=$CA" \
  -v ON_ERROR_STOP=1 "$@"; }

db_status() { aws rds describe-db-instances --db-instance-identifier "$INSTANCE" \
               --query 'DBInstances[0].DBInstanceStatus' --output text; }

db_version() { aws rds describe-db-instances --db-instance-identifier "$INSTANCE" \
                --query 'DBInstances[0].EngineVersion' --output text; }

wait_available() {
  say "waiting for $INSTANCE to become available"
  while :; do
    s=$(db_status)
    printf '    status=%s\n' "$s"
    [ "$s" = available ] && break
    sleep 30
  done
}

# modify-db-instance returns before RDS flips the status, so polling straight for
# `available` can match the state we started in and make a not-yet-started upgrade
# look finished. Wait for the status to LEAVE available first.
wait_modifying() {
  say "waiting for the upgrade to actually start (status must leave 'available')"
  for _ in $(seq 1 60); do
    s=$(db_status)
    printf '    status=%s\n' "$s"
    [ "$s" != available ] && return 0
    sleep 15
  done
  warn "still 'available' after 15 min - RDS may have rejected the modification."
  warn "check: aws rds describe-events --source-identifier $INSTANCE --source-type db-instance"
  return 1
}

# `aws --output text` returns a list TAB-separated on one line, so pipe through this to
# get one item per line and read it into a real array. Do not rely on IFS word-splitting.
arns() { tr '\t' '\n' | grep -v '^$' || true; }

netcfg() {
  aws events list-targets-by-rule --rule "$NETCFG_RULE" \
    --query 'Targets[0].EcsParameters.NetworkConfiguration' --output json \
    | jq -c '{awsvpcConfiguration:{subnets:.awsvpcConfiguration.Subnets,
               securityGroups:.awsvpcConfiguration.SecurityGroups,
               assignPublicIp:.awsvpcConfiguration.AssignPublicIp}}'
}

# Wait for a task to stop, then dump its CloudWatch log stream. Fargate awslogs streams
# are <prefix>/<containerName>/<taskId>.
watch_task() {
  local td=$1 arn=$2 id=${2##*/} name group prefix st tries=0
  # A blank/None ARN means run-task failed; without this the poll below spins forever.
  if [ -z "${arn:-}" ] || [ "$arn" = None ]; then
    warn "no task ARN - run-task did not start anything"; return 1
  fi
  while :; do
    if ! st=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$arn" \
              --query 'tasks[0].[lastStatus,containers[0].exitCode]' --output text); then
      warn "describe-tasks failed for $arn"; return 1
    fi
    printf '    %s\n' "$st"
    case "$st" in STOPPED*) break;; esac
    # 4h ceiling: the matview rebuild is the long pole, but it is not unbounded.
    tries=$((tries + 1))
    if [ "$tries" -gt 960 ]; then warn "still running after 4h - check it by hand"; return 1; fi
    sleep 15
  done
  # `|| true`: read returns non-zero on an empty/unterminated line, which under `set -e`
  # would abort the whole step just because a task definition has no log config.
  read -r name group prefix < <(aws ecs describe-task-definition --task-definition "$td" \
    --query 'taskDefinition.containerDefinitions[0].[name,
              logConfiguration.options."awslogs-group",
              logConfiguration.options."awslogs-stream-prefix"]' --output text) || true
  if [ -n "${group:-}" ] && [ "$group" != None ]; then
    say "logs ($group)"
    aws logs get-log-events --log-group-name "$group" \
      --log-stream-name "$prefix/$name/$id" --limit 100 \
      --query 'events[].message' --output text 2>/dev/null | sed 's/^/    /' || \
      warn "could not read $prefix/$name/$id"
  fi
  aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$arn" \
    --query 'tasks[0].containers[0].[exitCode,reason]' --output text
}

# Nothing in the app handles SIGTERM (verified: no process.on in evc-app/endpoints or
# src), so the lock release in `finally` never runs when ECS stops a task - a killed job
# leaves JOBKEY_<name> set for its 2h TTL, after which later runs log "Other process is
# still running, skip this run" and exit 0. Only feed-eps and daily-close take a lock.
clear_job_locks() {
  local js arn
  js=$(cat <<'JSEOF'
const { createClient } = require('redis');
(async () => {
  const c = createClient({ url: process.env.REDIS_URL });
  c.on('error', e => console.error('redis error:', e.message));
  await c.connect();
  const keys = [];
  for await (const k of c.scanIterator({ MATCH: 'JOBKEY*', COUNT: 100 })) {
    Array.isArray(k) ? keys.push(...k) : keys.push(k);
  }
  console.log('JOBKEY keys found:', JSON.stringify(keys));
  if (keys.length) { await c.del(keys); console.log('deleted', keys.length); }
  else { console.log('nothing to clear'); }
  await c.quit();
})().catch(e => { console.error(e); process.exit(1); });
JSEOF
)
  say "clearing leaked JOBKEY_* locks from inside the VPC (via $ONEOFF_TD)"
  local name
  name=$(aws ecs describe-task-definition --task-definition "$ONEOFF_TD" \
         --query 'taskDefinition.containerDefinitions[0].name' --output text)
  # An override naming a container the task definition does not have is rejected, so
  # fail here rather than sending a request that cannot work.
  if [ -z "${name:-}" ] || [ "$name" = None ]; then
    warn "could not resolve the container name in $ONEOFF_TD"; return 1
  fi
  arn=$(aws ecs run-task --cluster "$CLUSTER" --task-definition "$ONEOFF_TD" \
        --launch-type FARGATE --network-configuration "$(netcfg)" \
        --overrides "$(jq -cn --arg n "$name" --arg js "$js" \
            '{containerOverrides:[{name:$n,command:["node","-e",$js]}]}')" \
        --query 'tasks[0].taskArn' --output text)
  echo "    task: $arn"
  watch_task "$ONEOFF_TD" "$arn"
}

aas_suspend() {
  local state=$1 t
  for t in "${AAS_TARGETS[@]}"; do
    aws application-autoscaling register-scalable-target --service-namespace ecs \
      --resource-id "$t" --scalable-dimension ecs:service:DesiredCount \
      --suspended-state "DynamicScalingInSuspended=$state,DynamicScalingOutSuspended=$state,ScheduledScalingSuspended=$state" \
      && echo "    $t suspended=$state"
  done
}

ensure_ca() { [ -s "$CA" ] || curl -sS -o "$CA" https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem; }

# ---------------------------------------------------------------- pre-window

prep_gp3() {
  say "gp2 -> gp3 (546 baseline IOPS -> 3000). Online, but the volume sits in
      'optimizing' for a while and blocks further storage changes for 6h.
      Run this at least a day before the window."
  aws rds describe-db-instances --db-instance-identifier "$INSTANCE" \
    --query 'DBInstances[0].{StorageType:StorageType,Allocated:AllocatedStorage,Iops:Iops}' --output json
  confirm "convert to gp3?"
  aws rds modify-db-instance --db-instance-identifier "$INSTANCE" \
    --storage-type gp3 --apply-immediately \
    --query 'DBInstance.PendingModifiedValues' --output json
  warn "watch for StorageOptimization to finish before the window:"
  echo "    aws rds describe-db-instances --db-instance-identifier $INSTANCE \\"
  echo "      --query 'DBInstances[0].[StorageType,Iops,StorageThroughput,DBInstanceStatus]'"
}

prep_prune() {
  ensure_ca
  say "Prune UOA to the app's OWN 1-year retention policy (cleanUpOldUoaData in
      src/api/dataController.ts:183, which only ever runs on the admin CSV path).
      ~74% of rows are past it. The post-upgrade REINDEX then rebuilds small indexes."
  psql_ro -c "
    SELECT 'uoa_stock' t, count(*) total,
           count(*) FILTER (WHERE \"tradeDate\" < current_date - interval '1 year') deletable
      FROM evc.unusual_option_activity_stock
    UNION ALL SELECT 'uoa_etfs', count(*),
           count(*) FILTER (WHERE \"tradeDate\" < current_date - interval '1 year')
      FROM evc.unusual_option_activity_etfs
    UNION ALL SELECT 'uoa_index', count(*),
           count(*) FILTER (WHERE \"tradeDate\" < current_date - interval '1 year')
      FROM evc.unusual_option_activity_index;"
  confirm "DELETE those rows? (this is a write to prod)"
  for t in unusual_option_activity_stock unusual_option_activity_etfs unusual_option_activity_index; do
    say "pruning evc.$t"
    psql_rw -c "DELETE FROM evc.$t WHERE \"tradeDate\" < current_date - interval '1 year';"
  done
  say "VACUUM to release the dead tuples (indexes get compacted by the reindex later)"
  for t in unusual_option_activity_stock unusual_option_activity_etfs unusual_option_activity_index; do
    psql_rw -c "VACUUM (ANALYZE) evc.$t;"
  done
}

# ------------------------------------------------------------------- window

freeze() {
  say "suspending Application Auto Scaling before touching desired counts.
      evc-portal has a live CPU target-tracking policy with MinCapacity 2; without
      this, desired-count 0 gets clamped back up and tasks reconnect mid-upgrade."
  aas_suspend true

  say "scaling services to 0 and disabling schedules so nothing crash-loops
      against a closed database during the upgrade"
  for s in "${SERVICES[@]}"; do
    aws ecs update-service --cluster "$CLUSTER" --service "$s" --desired-count 0 \
      --query 'service.[serviceName,desiredCount]' --output text
  done
  for r in "${RULES[@]}"; do
    aws events disable-rule --name "$r" && echo "    disabled $r"
  done

  # disable-rule only stops FUTURE firings. feed-eps fires every 30 min and runs for
  # minutes, so a scheduled task is very likely already in flight right now; left alone
  # it keeps writing to the database while pg_upgrade runs.
  say "stopping any scheduled task already in flight"
  RUNNING=(); INFLIGHT=()
  while IFS= read -r t; do RUNNING+=("$t"); done < <(
    aws ecs list-tasks --cluster "$CLUSTER" --desired-status RUNNING \
      --query 'taskArns[]' --output text | arns)
  if [ ${#RUNNING[@]} -gt 0 ]; then
    # group is `service:<name>` for the two services and `family:<name>` for anything
    # launched by run-task, i.e. exactly the scheduled jobs.
    while IFS= read -r t; do INFLIGHT+=("$t"); done < <(
      aws ecs describe-tasks --cluster "$CLUSTER" --tasks "${RUNNING[@]}" \
        --query 'tasks[?starts_with(group, `family:`)].taskArn[]' --output text | arns)
  fi
  if [ ${#INFLIGHT[@]} -gt 0 ]; then
    for t in "${INFLIGHT[@]}"; do
      aws ecs stop-task --cluster "$CLUSTER" --task "$t" \
        --reason "pg18 upgrade window" --query 'task.[group,lastStatus]' --output text
    done
    say "waiting for them to stop"
    aws ecs wait tasks-stopped --cluster "$CLUSTER" --tasks "${INFLIGHT[@]}"
    warn "a stopped job does NOT release its JOBKEY_* lock (no SIGTERM handler),"
    warn "so those locks are now stale. thaw clears them; or run 'unlock' now."
  else
    echo "    none in flight"
  fi

  say "manual snapshot (RDS also takes its own pre/post upgrade snapshots)"
  SNAP="evc-pre-pg18-$(date -u +%Y%m%d-%H%M)"
  aws rds create-db-snapshot --db-instance-identifier "$INSTANCE" \
    --db-snapshot-identifier "$SNAP" --query 'DBSnapshot.DBSnapshotIdentifier' --output text
  echo "$SNAP" > /tmp/evc-pre-pg18-snapshot.txt
  aws rds wait db-snapshot-available --db-snapshot-identifier "$SNAP"
  say "snapshot $SNAP available - this is your rollback"
}

upgrade() {
  say "IN-PLACE major upgrade to $TARGET_VERSION. Not reversible: rollback means
      restoring $(cat /tmp/evc-pre-pg18-snapshot.txt 2>/dev/null || echo '<snapshot>') to a NEW instance."
  aws rds describe-db-parameter-groups --db-parameter-group-name "$PG18_GROUP" \
    --query 'DBParameterGroups[0].DBParameterGroupFamily' --output text
  confirm "start the upgrade?"
  aws rds modify-db-instance --db-instance-identifier "$INSTANCE" \
    --engine-version "$TARGET_VERSION" --db-parameter-group-name "$PG18_GROUP" \
    --allow-major-version-upgrade --apply-immediately \
    --query 'DBInstance.PendingModifiedValues' --output json
  wait_modifying
  wait_available
  ensure_ca

  # Assert, do not assume: a status of `available` alone cannot distinguish "upgrade
  # finished" from "upgrade never started".
  say "confirming the engine actually moved"
  RDS_VER=$(db_version)
  SQL_VER=$(psql_ro -Atc "SELECT version();")
  echo "    RDS reports: $RDS_VER"
  echo "    server says: $SQL_VER"
  case "$RDS_VER" in
    "$TARGET_VERSION") : ;;
    *) warn "expected $TARGET_VERSION, got $RDS_VER - do NOT continue"; exit 1 ;;
  esac
  case "$SQL_VER" in
    "PostgreSQL 18."*) : ;;
    *) warn "server is not PostgreSQL 18 - do NOT continue"; exit 1 ;;
  esac
  say "on $TARGET_VERSION"
}

maint_params() {
  say "temporary maintenance settings (all dynamic - no reboot)"
  # maintenance_work_mem is per concurrent maintenance op, and reindexdb runs $JOBS of
  # them, so the peak is JOBS x this value. db.t3.xlarge has 16 GB and shared_buffers is
  # already ~3.8 GB, so 2 GB x 4 = 8 GB was uncomfortably close. 1 GB x 4 = 4 GB leaves
  # room, and buys nothing back: after the UOA prune the largest single index rebuild
  # sorts ~350 MB of heap, so it never spills at 1 GB either.
  aws rds modify-db-parameter-group --db-parameter-group-name "$PG18_GROUP" --parameters \
    "ParameterName=maintenance_work_mem,ParameterValue=1048576,ApplyMethod=immediate" \
    "ParameterName=max_parallel_maintenance_workers,ParameterValue=4,ApplyMethod=immediate" \
    "ParameterName=work_mem,ParameterValue=262144,ApplyMethod=immediate" \
    "ParameterName=synchronous_commit,ParameterValue=off,ApplyMethod=immediate" \
    "ParameterName=max_wal_size,ParameterValue=8192,ApplyMethod=immediate" \
    "ParameterName=checkpoint_timeout,ParameterValue=1800,ApplyMethod=immediate" \
    --query 'DBParameterGroupName' --output text
  sleep 20
  psql_ro -c "SELECT name, setting, unit FROM pg_settings
              WHERE name IN ('maintenance_work_mem','max_parallel_maintenance_workers',
                             'work_mem','synchronous_commit','max_wal_size');"
}

reindex() {
  ensure_ca
  say "REINDEX schema evc with $JOBS parallel jobs, NOT --concurrently.
      The collation provider changed (glibc 2.26-amzn2 -> AL2023), and the database
      is en_US.UTF-8, so every text index is invalid until rebuilt.
      Exclusive locks are free here because the app is scaled to 0."
  psql_ro -c "SELECT collname, collversion FROM pg_collation WHERE collname='en_US.utf8';" || true
  time PGPASSWORD=$(pw) reindexdb --jobs "$JOBS" --schema=evc --echo \
    --host="$(host)" --port=5432 --dbname="$DBNAME" --username="$DBUSER"
  say "clearing the recorded collation version"
  psql_rw -c "ALTER DATABASE $DBNAME REFRESH COLLATION VERSION;"
  psql_ro -c "SELECT datname, datcollversion FROM pg_database WHERE datname='$DBNAME';"
  say "no invalid indexes should remain"
  psql_ro -c "SELECT c.relname FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid
              WHERE NOT i.indisvalid;"
}

matviews() {
  ensure_ca
  say "did pg_upgrade keep the materialized view data?"
  psql_ro -c "SELECT matviewname, ispopulated,
              pg_size_pretty(pg_total_relation_size(format('evc.%I',matviewname)::regclass)) sz
              FROM pg_matviews WHERE schemaname='evc' ORDER BY 1;"
  UNPOP=$(psql_ro -Atc "SELECT count(*) FROM pg_matviews WHERE schemaname='evc' AND NOT ispopulated;")
  COUNT=$(psql_ro -Atc "SELECT count(*) FROM pg_matviews WHERE schemaname='evc';")
  if [ "$COUNT" = 7 ] && [ "$UNPOP" = 0 ]; then
    say "all 7 populated and already reindexed above -> SKIPPING the rebuild.
        This is the big win: no recomputation of stock_computed_pe90/365."
    warn "If you are deploying commit 847387ea (referree->referee view rename),
         you still need sync:schema for the column rename. Run it explicitly."
  else
    say "$UNPOP of $COUNT unpopulated -> running evc-sync-schema to drop and rebuild
        all views/matviews (TypeORM emits CREATE MATERIALIZED VIEW ... AS, no WITH NO DATA,
        so they repopulate on creation). This is the long pole."
    confirm "run evc-sync-schema now?"
    TASK=$(aws ecs run-task --cluster "$CLUSTER" --task-definition evc-sync-schema \
           --launch-type FARGATE --network-configuration "$(netcfg)" \
           --query 'tasks[0].taskArn' --output text)
    echo "    task: $TASK"
    say "watching (this can run long - matview rebuild reads ~10GB of base tables)"
    watch_task evc-sync-schema "$TASK"
  fi
}

unlock() { clear_job_locks; }

stats() {
  ensure_ca
  say "PG18's pg_upgrade transfers most optimizer statistics. Check whether RDS kept them."
  psql_ro -c "
    SELECT count(*) AS relations_with_stats FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='evc' AND c.relkind IN ('r','m')
      AND EXISTS (SELECT 1 FROM pg_statistic s WHERE s.starelid=c.oid);"
  say "cheap top-up for anything missing (NOT a full ANALYZE).
      --missing-stats-only is a PG18 client flag; verified present in psql 18.6."
  if ! time PGPASSWORD=$(pw) vacuumdb --analyze-in-stages --missing-stats-only \
       --host="$(host)" --port=5432 --dbname="$DBNAME" --username="$DBUSER" --echo; then
    warn "top-up failed (old client?). Falling back to a full analyze-only pass."
    time PGPASSWORD=$(pw) vacuumdb --analyze-only --jobs "$JOBS" \
      --host="$(host)" --port=5432 --dbname="$DBNAME" --username="$DBUSER"
  fi
}

revert_params() {
  say "reverting the maintenance settings to engine defaults"
  aws rds reset-db-parameter-group --db-parameter-group-name "$PG18_GROUP" --parameters \
    "ParameterName=maintenance_work_mem,ApplyMethod=immediate" \
    "ParameterName=max_parallel_maintenance_workers,ApplyMethod=immediate" \
    "ParameterName=work_mem,ApplyMethod=immediate" \
    "ParameterName=synchronous_commit,ApplyMethod=immediate" \
    "ParameterName=max_wal_size,ApplyMethod=immediate" \
    "ParameterName=checkpoint_timeout,ApplyMethod=immediate" \
    --query 'DBParameterGroupName' --output text
  aws rds describe-db-parameters --db-parameter-group-name "$PG18_GROUP" --source user \
    --query 'Parameters[].[ParameterName,ParameterValue]' --output table
}

thaw() {
  say "restoring service counts and schedules"
  aws ecs update-service --cluster "$CLUSTER" --service evc-portal --desired-count 2 \
    --query 'service.[serviceName,desiredCount]' --output text
  aws ecs update-service --cluster "$CLUSTER" --service evc-daemon --desired-count 1 \
    --query 'service.[serviceName,desiredCount]' --output text

  say "releasing the Application Auto Scaling suspension"
  aas_suspend false

  # Do this BEFORE re-enabling the rules: any lock left by a job the window killed would
  # otherwise make the next feed-eps / daily-close firing skip and exit 0, which reads
  # as a pass. Safe unconditionally - nothing is running yet.
  clear_job_locks

  for r in "${RULES[@]}"; do
    [ "$r" = daily-opc-history ] && { echo "    skipping $r (orphan rule, no targets)"; continue; }
    aws events enable-rule --name "$r" && echo "    enabled $r"
  done
}

verify() {
  ensure_ca
  say "version"; psql_ro -Atc "SELECT version();"
  say "object counts (expect r=66 v=28 m=7 S=9; index count changes after the prune)"
  psql_ro -c "SELECT c.relkind, count(*) FROM pg_class c
              JOIN pg_namespace n ON n.oid=c.relnamespace
              WHERE n.nspname='evc' GROUP BY 1 ORDER BY 1;"
  say "matviews populated"
  psql_ro -c "SELECT matviewname, ispopulated FROM pg_matviews WHERE schemaname='evc' ORDER BY 1;"
  say "fair value pipeline produces rows"
  psql_ro -c "SELECT count(*) rows, count(DISTINCT symbol) symbols FROM evc.stock_latest_fair_value;"
  say "no invalid indexes"
  psql_ro -c "SELECT c.relname FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE NOT i.indisvalid;"
  say "every app connection encrypted (zero rows = good)"
  psql_ro -c "SELECT a.client_addr, count(*) FROM pg_stat_ssl s JOIN pg_stat_activity a USING (pid)
              WHERE a.client_addr IS NOT NULL AND s.ssl = false GROUP BY 1;"
  say "services"
  aws ecs describe-services --cluster "$CLUSTER" --services evc-portal evc-daemon \
    --query 'services[].[serviceName,taskDefinition,runningCount,desiredCount]' --output text \
    | sed 's|arn:aws:ecs:[0-9a-z:-]*task-definition/||'
  say "site"; curl -s -o /dev/null -w '    https://easyvaluecheck.com/ -> %{http_code}\n' https://easyvaluecheck.com/
}

case "${1:-}" in
  prep-gp3) prep_gp3 ;;
  prep-prune) prep_prune ;;
  freeze) freeze ;;
  upgrade) upgrade ;;
  maint-params) maint_params ;;
  reindex) reindex ;;
  matviews) matviews ;;
  stats) stats ;;
  revert-params) revert_params ;;
  thaw) thaw ;;
  verify) verify ;;
  unlock) unlock ;;
  *) sed -n '2,19p' "$0"; exit 1 ;;
esac
