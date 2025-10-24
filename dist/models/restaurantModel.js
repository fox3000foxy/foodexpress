import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
		name: { type: String, required: true },
		address: { type: String, required: true },
		phone: { type: String, required: true },
		opening_hours: { type: String, required: true }
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema, 'restaurants');

export default Restaurant;
