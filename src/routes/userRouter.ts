
import bcrypt from 'bcrypt';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import adminMiddleware, { AuthenticatedRequest } from 'middlewares/adminMiddleware';
import authMiddleware from 'middlewares/authMiddleware';
import userAuthorizationMiddleware from 'middlewares/userAuthorizationMiddleware';
import mongoose, { connect, Schema } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

const userRouter = Router();

userRouter.post('/', async (req, res) => {
    const { email, username, password, role } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');

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
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');

    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        
        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        
        const { password: _, ...userResponse } = user.toObject();
        res.json({ user: userResponse, token });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.get('/', adminMiddleware, async (req, res) => {
    await connect('mongodb://127.0.0.1:27017/foodexpress');

    try {
        const users = await User.find().select('-password'); 
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.get('/:id', authMiddleware, userAuthorizationMiddleware, async (req, res) => {
    const userId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');

    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.put('/:id', authMiddleware, userAuthorizationMiddleware, async (req, res) => {
    const userId = req.params.id;
    const { email, username, password, role } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');

    try {
        const updateData: any = { email, username };
        
        
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        
        
        const requestingUser = req as AuthenticatedRequest;
        if (requestingUser.user?.role === 'admin' && role !== undefined) {
            updateData.role = role;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

userRouter.delete('/:id', authMiddleware, userAuthorizationMiddleware, async (req, res) => {
    const userId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default userRouter;


