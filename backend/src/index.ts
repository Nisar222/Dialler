import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import client from 'prom-client';

const app = express();

// Metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
	origin: (origin, cb) => {
		if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
		return cb(new Error('CORS not allowed'), false);
	},
	credentials: true
}));

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.get('/metrics', async (_req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(await register.metrics());
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
	console.log(`Backend listening on :${port}`);
});