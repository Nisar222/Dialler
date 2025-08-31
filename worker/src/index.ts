import { Worker, JobsOptions, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { DateTime } from 'luxon';

const connection = new Redis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });

function backoffOpts(): JobsOptions {
	return { attempts: 5, backoff: { type: 'exponential', delay: 1000 } } as any;
}

new Worker('dncr-screen', async job => {
	// TODO: parse contacts, normalize to E.164, call DNCR API (concurrency=10 fan-out), cache 24h, write Contact rows and DncrAudit
	return { processed: (job.data.contacts || []).length };
}, { connection });

new Worker('call-orchestrator', async job => {
	// TODO: enforce business hours, select next allowed contact, initiate 3CX call, schedule retries per outcome
	return { ok: true, at: DateTime.now().toISO() };
}, { connection });

new Worker('recordings-mirror-daily', async job => {
	// TODO: list yesterday recordings on 3CX, mirror to S3, attach URLs to calls
	return { mirrored: 0 };
}, { connection });

new Worker('reports-export', async job => {
	// TODO: generate CSV, upload to S3, email link (SES later)
	return { key: 's3://...' };
}, { connection });

const events = ['dncr-screen', 'call-orchestrator', 'recordings-mirror-daily', 'reports-export'].map(name => new QueueEvents(name, { connection }));
for (const e of events) {
	e.on('completed', ({ jobId }) => console.log(`[${e.eventBusName}] completed`, jobId));
	e.on('failed', ({ jobId, failedReason }) => console.error(`[${e.eventBusName}] failed`, jobId, failedReason));
}