import { redisCache } from "../services/redisCache";

export async function getCachedOrFetch(keyFactory: () => string, dataFactory: () => Promise<any>, expireInSeconds: number) {
    if (!(expireInSeconds > 0)) {
        throw new Error('expiredInSeconds must be greater than 0');
    }
    const cacheKey = keyFactory();
    if (!cacheKey) {
        throw new Error(`Cache key cannot be empty`);
    }
    let data = await redisCache.get(cacheKey);
    if (!data) {
        data = await dataFactory();
        await redisCache.setex(cacheKey, data, expireInSeconds);
    }
    return data;
}
