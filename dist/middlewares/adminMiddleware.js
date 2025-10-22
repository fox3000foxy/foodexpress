/* #swagger.tags = ['Middlewares'] */
/* #swagger.parameters['Authorization'] = {
     in: 'header',
     description: "Bearer token with admin role",
     required: true,
     type: 'string'
} */
/* #swagger.responses[401] = { description: 'Token required or invalid' } */
/* #swagger.responses[403] = { description: 'Access denied. Admins only.' } */
import jwt from 'jsonwebtoken';
export default async function adminMiddleware(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
            req.user = decoded;
            next();
        }
        else {
            res.status(403).json({ error: 'Access denied. Admins only.' });
        }
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
