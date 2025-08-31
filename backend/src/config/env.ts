import { z } from 'zod';

const EnvSchema = z.object({
	PORT: z.string().default('4000'),
	CORS_ALLOWED_ORIGINS: z.string().default(''),
	POSTGRES_URL: z.string(),
	REDIS_URL: z.string(),
	JWT_SECRET: z.string().min(16),
	REFRESH_SECRET: z.string().min(16),
	DNCR_BASE_URL: z.string().url(),
	DNCR_BEARER: z.string().optional(),
	THREECX_BASE_URL: z.string().url(),
	THREECX_API_ID: z.string(),
	THREECX_API_KEY: z.string(),
	THREECX_QUEUE_DEFAULT: z.string().default('800'),
	DEFAULT_ALLOWED_CLIS: z.string().default(''),
	THREECX_WEBHOOK_SECRET: z.string().min(8),
	S3_AUDIT_BUCKET: z.string(),
	S3_REGION: z.string(),
	KMS_KEY_ALIAS: z.string(),
	S3_BACKUP_BUCKET: z.string(),
	SES_REGION: z.string(),
	SES_FROM: z.string(),
	BUSINESS_HOURS_TZ: z.string().default('Asia/Dubai')
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse(process.env);

export const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);