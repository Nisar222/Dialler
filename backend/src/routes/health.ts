import { Router } from 'express';
import client from 'prom-client';

const router = Router();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

router.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

router.get('/metrics', async (_req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(await register.metrics());
});

export default router;