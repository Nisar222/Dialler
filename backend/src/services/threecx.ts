import axios from 'axios';

const base = process.env.THREECX_BASE_URL as string;
const id = process.env.THREECX_API_ID as string;
const key = process.env.THREECX_API_KEY as string;

function authHeader() {
	const token = Buffer.from(`${id}:${key}`).toString('base64');
	return { Authorization: `Basic ${token}` };
}

export async function initiateOutboundCall(msisdn: string, cli: string) {
	// Placeholder: implement per 3CX v20 CallControl API spec
	// Example endpoint is illustrative; adjust to actual API paths
	const resp = await axios.post(`${base}/calls`, { to: msisdn, from: cli }, { headers: authHeader() });
	return resp.data as { call_id: string };
}

export async function bridgeCallToQueue(callId: string, queueId: number) {
	const resp = await axios.post(`${base}/calls/${callId}/bridge-queue`, { queueId }, { headers: authHeader() });
	return resp.data;
}