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
	S3_AUDIT_BUCKET: z.string().optional(),
	S3_REGION: z.string().optional(),
	KMS_KEY_ALIAS: z.string().optional(),
	S3_BACKUP_BUCKET: z.string().optional(),
	BUSINESS_HOURS_TZ: z.string().default('Asia/Dubai'),
	// Email
	MAIL_DRIVER: z.enum(['gmail','smtp']).default('gmail'),
	MAIL_HOST: z.string().default('smtp.gmail.com'),
	MAIL_PORT: z.string().default('587'),
	MAIL_USER: z.string().optional(),
	MAIL_PASS: z.string().optional(),
	MAIL_FROM: z.string().optional(),
	MAIL_NAME: z.string().default('AYN Digital'),
	// PII
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse(process.env);

export const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);