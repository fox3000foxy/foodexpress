import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
		email: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// troisième param = nom exact de la collection (force 'user' si Compass l'utilise)
const User = mongoose.models.User || mongoose.model('User', userSchema, 'user');

export default User;
