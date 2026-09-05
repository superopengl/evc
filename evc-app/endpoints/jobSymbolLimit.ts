/**
 * Caps a job's symbol list when EVC_JOB_SYMBOL_LIMIT is set.
 *
 * The full lists are 1k-6k symbols and the data providers answer in seconds,
 * so a whole-list run takes hours - too slow to use as a smoke test after a
 * Node or dependency upgrade. Setting the env var to e.g. 100 exercises the
 * same loop, the same upsert and the same tail (matview refresh, notification
 * emails) against a slice small enough to finish in a couple of minutes.
 *
 * Unset in production, where it is a no-op.
 */
export function applyJobSymbolLimit<T>(symbols: T[], jobName: string): T[] {
  const raw = process.env.EVC_JOB_SYMBOL_LIMIT;
  if (!raw) {
    return symbols;
  }

  const limit = +raw;
  if (!Number.isInteger(limit) || limit <= 0) {
    console.warn(`Ignoring EVC_JOB_SYMBOL_LIMIT=${raw}: not a positive integer`);
    return symbols;
  }

  if (symbols.length <= limit) {
    return symbols;
  }

  console.warn(`${jobName}: EVC_JOB_SYMBOL_LIMIT=${limit} is set, truncating ${symbols.length} symbols to ${limit}`);
  return symbols.slice(0, limit);
}
