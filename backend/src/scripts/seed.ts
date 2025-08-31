import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
	const email = process.env.ADMIN_EMAIL as string;
	const name = process.env.ADMIN_NAME as string;
	const role = (process.env.ADMIN_ROLE as 'ADMIN'|'SUPERVISOR'|'AGENT'|'AUDITOR') || 'ADMIN';
	const password = process.env.ADMIN_PASSWORD || 'TempPass#2025!';
	if (!email || !name) {
		console.error('ADMIN_EMAIL and ADMIN_NAME are required');
		process.exit(1);
	}
	const passHash = await bcrypt.hash(password, 12);
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		await prisma.user.update({ where: { id: existing.id }, data: { name, role, status: 'ACTIVE', passHash } });
		console.log('Updated admin user:', email);
	} else {
		await prisma.user.create({ data: { email, name, role, passHash, status: 'ACTIVE' } });
		console.log('Created admin user:', email);
	}
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });