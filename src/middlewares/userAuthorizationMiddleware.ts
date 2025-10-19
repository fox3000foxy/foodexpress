import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export default function userAuthorizationMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.params.id;
    const requestingUserId = req.user?.userId;
    const userRole = req.user?.role;

    
    if (userRole === 'admin') {
        return next();
    }

    
    if (requestingUserId === userId) {
        return next();
    }

    return res.status(403).json({ error: 'Access denied. You can only access your own resources.' });
}

