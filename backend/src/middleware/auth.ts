import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type JwtPayload = {
	uid: string;
	role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'AUDITOR';
};

export function requireAuth(roles?: Array<JwtPayload['role']>) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.cookies?.access_token as string | undefined;
			if (!token) return res.status(401).json({ error: 'unauthorized' });
			const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
			(req as any).user = decoded;
			if (roles && !roles.includes(decoded.role)) {
				return res.status(403).json({ error: 'forbidden' });
			}
			next();
		} catch (e) {
			return res.status(401).json({ error: 'unauthorized' });
		}
	};
}