import { Queue } from 'bullmq';
import { getRedis } from '../lib/redis';

const connection = () => ({ connection: (getRedis() as any).options }) as any;

export const dncrScreenQueue = new Queue('dncr-screen', connection());
export const callOrchestratorQueue = new Queue('call-orchestrator', connection());
export const recordingsMirrorDailyQueue = new Queue('recordings-mirror-daily', connection());
export const reportsExportQueue = new Queue('reports-export', connection());