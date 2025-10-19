import { Router } from 'express';
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
    const newUser = new User({ email, username, password, role });
    newUser.save()
        .then(user => res.status(201).json(user))
        .catch(err => res.status(400).json({ error: err.message }));
});
userRouter.get('/', async (req, res) => {
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ error: err.message }));
});
userRouter.get('/:id', async (req, res) => {
    const userId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    User.findById(userId)
        .then(user => {
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
userRouter.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const { email, username, password, role } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    User.findByIdAndUpdate(userId, { email, username, password, role }, { new: true })
        .then(user => {
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    })
        .catch(err => res.status(400).json({ error: err.message }));
});
userRouter.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    User.findByIdAndDelete(userId)
        .then(user => {
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
export default userRouter;
