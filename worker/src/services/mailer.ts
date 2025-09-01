import nodemailer from 'nodemailer';

const host = process.env.MAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.MAIL_PORT || 587);
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
const from = process.env.MAIL_FROM || user || '';
const name = process.env.MAIL_NAME || 'AYN Digital';

const transporter = nodemailer.createTransport({
	host,
	port,
	secure: port === 465,
	auth: user && pass ? { user, pass } : undefined
});

export async function sendMail(opts: { to: string; subject: string; text?: string; html?: string }) {
	if (!user || !pass) {
		console.warn('Email disabled: MAIL_USER or MAIL_PASS not set.');
		return { disabled: true } as const;
	}
	const info = await transporter.sendMail({
		from: `${name} <${from}>`,
		to: opts.to,
		subject: opts.subject,
		text: opts.text,
		html: opts.html
	});
	return { messageId: info.messageId };
}