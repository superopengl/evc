import * as NodeCache from 'node-cache';
const cache = new NodeCache();

export const setCache = (key: string, value: any, ttl?: number) => {
  cache.set(key, value, ttl);
};

export const getCache = (key: string) => {
  return cache.get(key);
};