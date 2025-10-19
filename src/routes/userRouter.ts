
import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';

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

userRouter.post('/', (req, res) => {
    
    const { email, username, password, role } = req.body;

    const newUser = new User({ email, username, password, role });
    newUser.save()
        .then(user => res.status(201).json(user))
        .catch(err => res.status(400).json({ error: err.message }));
});

userRouter.get('/', (req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(500).json({ error: err.message }));
});

userRouter.get('/:id', (req, res) => {
    const userId = req.params.id;

    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

userRouter.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { email, username, password, role } = req.body;

    User.findByIdAndUpdate(userId, { email, username, password, role }, { new: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

userRouter.delete('/:id', (req, res) => {
    const userId = req.params.id;

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


