import { Router } from 'express';
import mongoose, { connect, Schema } from 'mongoose';
const restaurantSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    opening_hours: { type: String, required: true }
}, {
    timestamps: true
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const restaurantRouter = Router();
restaurantRouter.post('/', async (req, res) => {
    const { name, address, phone, opening_hours } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const newRestaurant = new Restaurant({ name, address, phone, opening_hours });
    newRestaurant.save()
        .then(restaurant => res.status(201).json(restaurant))
        .catch(err => res.status(400).json({ error: err.message }));
});
restaurantRouter.get('/', async (req, res) => {
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    Restaurant.find()
        .then(restaurants => res.json(restaurants))
        .catch(err => res.status(500).json({ error: err.message }));
});
restaurantRouter.get('/:id', async (req, res) => {
    const restaurantId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    Restaurant.findById(restaurantId)
        .then(restaurant => {
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
restaurantRouter.put('/:id', async (req, res) => {
    const restaurantId = req.params.id;
    const { name, address, phone, opening_hours } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    Restaurant.findByIdAndUpdate(restaurantId, { name, address, phone, opening_hours }, { new: true })
        .then(restaurant => {
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    })
        .catch(err => res.status(400).json({ error: err.message }));
});
restaurantRouter.delete('/:id', async (req, res) => {
    const restaurantId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    Restaurant.findByIdAndDelete(restaurantId)
        .then(restaurant => {
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json({ message: 'Restaurant deleted successfully' });
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
export default restaurantRouter;
