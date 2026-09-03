import { sleep } from './sleep';

export type RateLimitOptions = {
  /** Most calls allowed to start within any one minute. */
  maxPerMinute: number;
  /** Most calls allowed to be in flight at once. */
  concurrency: number;
};

/**
 * Runs fn over every item with bounded concurrency, spacing the starts so that
 * no more than maxPerMinute are issued.
 *
 * Awaiting one call at a time lets network latency decide the request rate:
 * slow responses quietly stretch a job out for hours, and fast ones can outrun
 * the provider's quota and trip its rate limiter. Pacing the starts makes the
 * rate explicit and independent of latency, and the concurrency covers the gap
 * when a single call takes longer than the interval between starts.
 *
 * Results keep the order of items, not the order they completed in.
 */
export async function mapWithRateLimit<T, R>(
  items: T[],
  options: RateLimitOptions,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const { maxPerMinute, concurrency } = options;
  const minIntervalMs = 60 * 1000 / maxPerMinute;
  const results: R[] = new Array(items.length);

  let cursor = 0;
  let nextStartAt = Date.now();

  // Hands out the next start time, so the workers together never exceed the
  // budget no matter how fast any one of them comes back.
  const waitForSlot = async () => {
    const now = Date.now();
    const startAt = Math.max(now, nextStartAt);
    nextStartAt = startAt + minIntervalMs;
    if (startAt > now) {
      await sleep(startAt - now);
    }
  };

  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) {
        return;
      }
      await waitForSlot();
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));

  return results;
}
