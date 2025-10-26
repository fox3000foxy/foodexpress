import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import userAuthorizationMiddleware from '../middlewares/userAuthorizationMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { mongoIdSchema, paginationSchema, userLoginSchema, userRegistrationSchema, userUpdateSchema } from '../validation/userValidation.js';
import User from '../models/userModel.js';
const userRouter = Router();
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request
 */
userRouter.post('/', validate({ body: userRegistrationSchema }), async (req, res) => {
    const { email, username, password, role } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            role: role || 'user'
        });
        const savedUser = await newUser.save();
        const { password: _, ...userResponse } = savedUser.toObject();
        res.status(201).json(userResponse);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 */
userRouter.post('/login', validate({ body: userLoginSchema }), async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const { password: _, ...userResponse } = user.toObject();
        res.json({ user: userResponse, token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
userRouter.get('/', adminMiddleware, validate({ query: paginationSchema }), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
userRouter.get('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema }), async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 */
userRouter.put('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema, body: userUpdateSchema }), async (req, res) => {
    const userId = req.params.id;
    const { email, username, password, role } = req.body;
    try {
        const updateData = { email, username };
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        const requestingUser = req;
        if (requestingUser.user?.role === 'admin' && role !== undefined) {
            updateData.role = role;
        }
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
userRouter.delete('/:id', authMiddleware, userAuthorizationMiddleware, validate({ params: mongoIdSchema }), async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default userRouter;
