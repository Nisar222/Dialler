import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { dncrPurgeCache } from '../services/dncr';

const router = Router();

router.post('/admin/dncr/purge-cache', requireAuth(['ADMIN']), async (_req, res) => {
	await dncrPurgeCache();
	res.json({ ok: true });
});

router.get('/admin/health', requireAuth(['ADMIN']), async (_req, res) => {
	res.json({ ok: true });
});

export default router;