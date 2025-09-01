import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

function verifySignature(rawBody: string, signature: string | undefined, secret: string) {
	if (!signature) return false;
	const hmac = crypto.createHmac('sha256', secret);
	hmac.update(rawBody, 'utf8');
	const digest = hmac.digest('hex');
	return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

router.post('/webhooks/3cx', expressRawBody(), (req, res) => {
	const secret = process.env.THREECX_WEBHOOK_SECRET as string;
	const sig = req.header('X-3CX-Signature') || '';
	const eventType = req.header('X-3CX-Event') || 'unknown';
	const raw = (req as any).rawBody as string;
	const ok = verifySignature(raw, sig, secret);
	// TODO: store to webhooks_3cx and enqueue processing
	return res.status(ok ? 200 : 401).json({ ok });
});

function expressRawBody() {
	return (req: any, _res: any, next: any) => {
		let data = '';
		req.setEncoding('utf8');
		req.on('data', (chunk: string) => { data += chunk; });
		req.on('end', () => { req.rawBody = data; next(); });
	};
}

export default router;