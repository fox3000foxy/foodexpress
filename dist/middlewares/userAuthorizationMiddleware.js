export default function userAuthorizationMiddleware(req, res, next) {
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
