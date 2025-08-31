import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { allowedOrigins, env } from './config/env';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import webhooksRouter from './routes/webhooks';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

app.use(cors({
	origin: (origin, cb) => {
		if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
		return cb(new Error('CORS not allowed'), false);
	},
	credentials: true
}));

app.use(healthRouter);
app.use(authRouter);
app.use(adminRouter);
app.use(webhooksRouter);

const port = Number(env.PORT);
app.listen(port, () => {
	console.log(`Backend listening on :${port}`);
});