import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/auth/register', requireAuth(['ADMIN']), async (req, res) => {
	const { name, email, password, role } = req.body as { name: string; email: string; password: string; role: 'ADMIN'|'SUPERVISOR'|'AGENT'|'AUDITOR' };
	if (!name || !email || !password || !role) return res.status(400).json({ error: 'missing_fields' });
	const passHash = await bcrypt.hash(password, 12);
	try {
		const user = await prisma.user.create({ data: { name, email, passHash, role: role as any, status: 'ACTIVE' } });
		return res.json({ id: user.id, email: user.email });
	} catch (e) {
		return res.status(400).json({ error: 'create_failed' });
	}
});

router.post('/auth/login', async (req, res) => {
	const { email, password } = req.body as { email: string; password: string };
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ error: 'invalid_credentials' });
	const ok = await bcrypt.compare(password, user.passHash);
	if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
	const access = jwt.sign({ uid: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
	res.cookie('access_token', access, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 60 * 60 * 1000 });
	return res.json({ ok: true });
});

router.post('/auth/logout', requireAuth(), async (_req, res) => {
	res.clearCookie('access_token');
	return res.json({ ok: true });
});

router.get('/me', requireAuth(), async (req, res) => {
	const uid = (req as any).user.uid as string;
	const user = await prisma.user.findUnique({ where: { id: uid }, select: { id: true, name: true, email: true, role: true, status: true } });
	return res.json(user);
});

export default router;