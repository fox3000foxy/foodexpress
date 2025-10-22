/* #swagger.tags = ['Middlewares'] */
/* #swagger.parameters['Authorization'] = {
     in: 'header',
     description: "Bearer token",
     required: true,
     type: 'string'
} */
/* #swagger.responses[401] = { description: 'Token required or invalid' } */
import jwt from 'jsonwebtoken';
export default async function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
