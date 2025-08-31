import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
	if (!redis) {
		const url = process.env.REDIS_URL as string;
		redis = new Redis(url, { maxRetriesPerRequest: null });
	}
	return redis;
}