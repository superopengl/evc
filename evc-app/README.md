# Maintainence scripts

## Check current database connections
```sql
SELECT numbackends
FROM pg_stat_database
where datname = 'evcprod'
```

## Reset database stat
```sql
# Reset current database stat
SELECT pg_stat_reset(); 
```

## Check connections
```sql
select max_conn,used,res_for_super,max_conn-used-res_for_super res_for_normal 
from 
  (select count(*) used from pg_stat_activity) t1,
  (select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) t2,
  (select setting::int max_conn from pg_settings where name=$$max_connections$$) t3
```

## Check current running queries
```sql
SELECT * FROM pg_stat_activity
where datname = 'evcprod'
```

Make sure not to configure too high number in env var `TYPEORM_DRIVER_EXTRA={"max": 100, "connectionTimeoutMillis": 3000}`.