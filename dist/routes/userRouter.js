import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import userAuthorizationMiddleware from '../middlewares/userAuthorizationMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { mongoIdSchema, paginationSchema, userLoginSchema, userRegistrationSchema, userUpdateSchema } from '../validation/userValidation.js';
import User from '../models/userModel.js';

/* #swagger.tags = ['Users'] */
/* #swagger.description = 'Gestion des utilisateurs (inscription, login, CRUD)' */

const router = Router();

router.post('/', validate({ body: userRegistrationSchema }), async (req, res) => {
	/* #swagger.parameters['body'] = { in: 'body', description: 'User registration payload' } */
	try {
		const { email, username, password, role } = req.body;
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const newUser = new User({ email, username, password: hashedPassword, role: role || 'user' });
		const savedUser = await newUser.save();
		const { password: _, ...userResponse } = savedUser.toObject();
		res.status(201).json(userResponse);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.post('/login', validate({ body: userLoginSchema }), async (req, res) => {
	/* #swagger.parameters['body'] = { in: 'body', description: 'Login payload' } */
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
		const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'change_me', { expiresIn: '24h' });
		const { password: _, ...userResponse } = user.toObject();
		res.json({ user: userResponse, token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/', validate({ query: paginationSchema }), async (req, res) => {
	/* #swagger.responses[200] = { description: 'List of users (password excluded)' } */
	try {
		const users = await User.find().select('-password');
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer token', required: true } */
	try {
		const user = await User.findById(req.params.id).select('-password');
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema, body: userUpdateSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer token', required: true } */
	try {
		const { email, username, password, role } = req.body;
		const updateData = { email, username };
		if (password) updateData.password = await bcrypt.hash(password, 10);
		// only admin can change role
		if (req.user?.role === 'admin' && role !== undefined) updateData.role = role;
		const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
		if (!updated) return res.status(404).json({ error: 'User not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.delete('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer token', required: true } */
	try {
		const deleted = await User.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'User not found' });
		res.json({ message: 'User deleted successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
