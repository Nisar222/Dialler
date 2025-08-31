import axios from 'axios';
import { getRedis } from '../lib/redis';

export type DncrResponse = {
	number: string;
	allow: boolean;
	reason_code: string;
	checked_at: string;
};

const TTL_SECONDS = 24 * 60 * 60;

export async function dncrCheck(numberE164: string): Promise<DncrResponse> {
	const redis = getRedis();
	const key = `dncr:${numberE164}`;
	const cached = await redis.get(key);
	if (cached) return JSON.parse(cached);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 2000);
	try {
		const headers: Record<string, string> = {};
		if (process.env.DNCR_BEARER) headers['Authorization'] = `Bearer ${process.env.DNCR_BEARER}`;
		let resp;
		try {
			resp = await axios.post(process.env.DNCR_BASE_URL as string, { number: numberE164 }, { headers, signal: controller.signal });
		} catch (e) {
			// one quick retry ~100ms
			await new Promise(r => setTimeout(r, 100));
			resp = await axios.post(process.env.DNCR_BASE_URL as string, { number: numberE164 }, { headers, signal: controller.signal });
		}
		const data = resp.data as DncrResponse;
		await redis.setex(key, TTL_SECONDS, JSON.stringify(data));
		return data;
	} catch {
		const deny: DncrResponse = { number: numberE164, allow: false, reason_code: 'SERVICE_DOWN', checked_at: new Date().toISOString() };
		await redis.setex(key, 60, JSON.stringify(deny));
		return deny;
	} finally {
		clearTimeout(timeout);
	}
}

export async function dncrPurgeCache(pattern = 'dncr:*') {
	const redis = getRedis();
	const stream = redis.scanStream({ match: pattern, count: 200 }) as any;
	const keys: string[] = [];
	return new Promise<void>((resolve, reject) => {
		stream.on('data', (k: string[]) => keys.push(...k));
		stream.on('end', async () => {
			if (keys.length) await redis.del(...keys);
			resolve();
		});
		stream.on('error', reject);
	});
}