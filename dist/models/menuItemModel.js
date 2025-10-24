import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
		restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		price: { type: Number, required: true },
		category: { type: String, required: true }
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuSchema, 'menus');

export default MenuItem;
