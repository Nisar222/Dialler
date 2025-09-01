import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { dncrCheck } from '../services/dncr';
import { encryptString, hashNumberE164, decryptToString } from '../lib/crypto';
import { initiateOutboundCall, bridgeCallToQueue } from '../services/threecx';
import { withinBusinessHours } from '../utils/businessHours';

const router = Router();

router.post('/dialer/call', requireAuth(['AGENT', 'SUPERVISOR', 'ADMIN']), async (req, res) => {
	const { contact_id, msisdn, campaign_id, queue_id, cli } = req.body as { contact_id?: string; msisdn?: string; campaign_id: string; queue_id?: number; cli: string };
	const queueId = queue_id ?? Number(process.env.THREECX_QUEUE_DEFAULT || 800);
	const number = msisdn || (await getContactNumber(contact_id!));
	if (!number) return res.status(400).json({ error: 'missing_number' });
	if (!withinBusinessHours()) return res.status(403).json({ error: 'after_hours' });
	// DNCR check
	const dncr = await dncrCheck(number);
	await writeDncrAudit(number, dncr, req);
	if (!dncr.allow) return res.status(403).json({ error: 'dncr_blocked', reason: dncr.reason_code });
	// Initiate call and bridge
	const call = await initiateOutboundCall(number, cli);
	await bridgeCallToQueue(call.call_id, queueId);
	// persist call record
	const created = await prisma.call.create({ data: {
		contactId: contact_id || undefined,
		campaignId: campaign_id,
		agentId: (req as any).user.role === 'AGENT' ? (req as any).user.uid : undefined,
		queueId,
		cli,
		callId3cx: call.call_id,
		status: 'INITIATED'
	}});
	return res.json({ call_id: call.call_id, id: created.id });
});

router.get('/dialer/status/:call_id', requireAuth(), async (req, res) => {
	const { call_id } = req.params;
	const call = await prisma.call.findFirst({ where: { callId3cx: call_id } });
	if (!call) return res.status(404).json({ error: 'not_found' });
	return res.json({ status: call.status, connected_at: call.connectedAt, ended_at: call.endedAt, duration_sec: call.durationSec });
});

async function getContactNumber(contactId: string) {
	const c = await prisma.contact.findUnique({ where: { id: contactId } });
	if (!c) return null;
	return decryptToString(Buffer.from(c.numberE164Enc));
}

async function writeDncrAudit(number: string, dncr: any, req: any) {
	const hash = hashNumberE164(number);
	const enc = encryptString(number);
	await prisma.dncrAudit.create({ data: {
		numberHash: hash,
		numberE164Enc: enc,
		allow: dncr.allow,
		reasonCode: dncr.reason_code,
		policyVersion: 'v1',
		ctxJson: { user_id: (req as any).user?.uid, campaign_id: req.body?.campaign_id, ip: req.ip, ua: req.headers['user-agent'] },
		dncrResponseJson: dncr,
		latencyMs: 0
	}});
}

export default router;