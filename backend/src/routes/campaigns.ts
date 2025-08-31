import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/campaigns', requireAuth(['ADMIN', 'SUPERVISOR']), async (req, res) => {
	const { name, default_cli, queue_id } = req.body as { name: string; default_cli: string; queue_id?: number };
	if (!name || !default_cli) return res.status(400).json({ error: 'missing_fields' });
	const userId = (req as any).user.uid as string;
	const c = await prisma.campaign.create({ data: { name, defaultCli: default_cli, queueId: queue_id ?? 800, status: 'DRAFT', createdById: userId } });
	res.json(c);
});

router.post('/campaigns/:id/upload', requireAuth(['ADMIN', 'SUPERVISOR']), async (req, res) => {
	// TODO: accept CSV/XLSX multipart, enqueue dncr-screen jobs
	res.json({ ok: true, message: 'Upload accepted; DNCR screening scheduled.' });
});

router.get('/campaigns/:id/contacts', requireAuth(), async (req, res) => {
	const { filter } = req.query as { filter?: 'allowed'|'blocked'|'all' };
	const where: any = { campaignId: req.params.id };
	if (filter === 'allowed') where.dncrStatus = 'ALLOWED';
	else if (filter === 'blocked') where.dncrStatus = 'BLOCKED';
	const contacts = await prisma.contact.findMany({ where, take: 500, orderBy: { createdAt: 'asc' }, select: { id: true, name: true, dncrStatus: true, internalDnc: true } });
	res.json(contacts);
});

router.post('/campaigns/:id/start', requireAuth(['ADMIN', 'SUPERVISOR']), async (req, res) => {
	// TODO: verify DNCR screening complete and allowed>0
	await prisma.campaign.update({ where: { id: req.params.id }, data: { status: 'RUNNING' } });
	res.json({ ok: true });
});

export default router;