import { serializeError } from 'serialize-error';

/**
 * Runs a promise that is deliberately not awaited.
 *
 * Without a rejection handler a floating promise becomes an unhandled
 * rejection, which terminates the process on Node 15+. Use this instead of a
 * bare call so background work can fail without taking the process down.
 */
export function fireAndForget(promise: Promise<any>, label: string): void {
  promise.catch(err => console.error(`Background task "${label}" failed`, serializeError(err)));
}
