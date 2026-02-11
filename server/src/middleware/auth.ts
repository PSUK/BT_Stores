import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Simple token-based auth for MVP (Bearer <token>)
    // In a real app, verify JWT here.
    // For this MVP, we issue a simple token 'admin-session-token' on login.
    const token = authHeader.split(' ')[1];

    if (token !== 'admin-session-token') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
};
