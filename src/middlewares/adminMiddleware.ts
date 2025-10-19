import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export default async function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        
        if (decoded.role === 'admin') {
            req.user = decoded;
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Admins only.' });
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}


