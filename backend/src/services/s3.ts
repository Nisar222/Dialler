import { S3Client, PutObjectCommand, PutObjectRetentionCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.S3_REGION });

export async function putImmutableJson(bucket: string, key: string, body: any) {
	const json = JSON.stringify(body);
	await s3.send(new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		Body: json,
		ContentType: 'application/json',
		ServerSideEncryption: 'aws:kms',
		SSEKMSKeyId: process.env.KMS_KEY_ALIAS,
		ObjectLockMode: 'COMPLIANCE',
		ObjectLockRetainUntilDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
	}));
	// Explicit retention command (some SDKs require separate call)
	await s3.send(new PutObjectRetentionCommand({
		Bucket: bucket,
		Key: key,
		Retention: { Mode: 'COMPLIANCE', RetainUntilDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000) }
	}));
}

export function auditKey(parts: { campaignId: string; date: string; id: string }) {
	return `year=${parts.date.slice(0,4)}/month=${parts.date.slice(5,7)}/campaign=${parts.campaignId}/date=${parts.date}/${parts.id}.json`;
}