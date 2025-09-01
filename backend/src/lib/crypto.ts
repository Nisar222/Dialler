import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
	const base64 = process.env.PII_ENC_KEY || '';
	if (!base64) throw new Error('PII_ENC_KEY missing');
	const key = Buffer.from(base64, 'base64');
	if (key.length !== 32) throw new Error('PII_ENC_KEY must be 32 bytes base64');
	return key;
}

export function encryptString(plain: string): Buffer {
	const key = getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGO, key, iv);
	const enc = Buffer.concat([cipher.update(Buffer.from(plain, 'utf8')), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, enc]);
}

export function decryptToString(blob: Buffer): string {
	const key = getKey();
	const iv = blob.subarray(0, 12);
	const tag = blob.subarray(12, 28);
	const data = blob.subarray(28);
	const decipher = crypto.createDecipheriv(ALGO, key, iv);
	decipher.setAuthTag(tag);
	const dec = Buffer.concat([decipher.update(data), decipher.final()]);
	return dec.toString('utf8');
}

export function hashNumberE164(number: string): string {
	const salt = process.env.HASH_SALT || 'dev-salt';
	return crypto.createHmac('sha256', salt).update(number).digest('hex');
}