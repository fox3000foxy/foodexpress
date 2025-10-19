import { Router } from 'express';
import mongoose, { connect, Schema } from 'mongoose';
const menuItemSchema = new Schema({
    restaurant_id: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }
}, {
    timestamps: true
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const menuRouter = Router();
menuRouter.post('/', async (req, res) => {
    const { restaurant_id, name, description, price, category } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const newMenuItem = new MenuItem({ restaurant_id, name, description, price, category });
    newMenuItem.save()
        .then(menuItem => res.status(201).json(menuItem))
        .catch(err => res.status(400).json({ error: err.message }));
});
menuRouter.get('/', async (req, res) => {
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    MenuItem.find()
        .populate('restaurant_id', 'name')
        .then(menuItems => res.json(menuItems))
        .catch(err => res.status(500).json({ error: err.message }));
});
menuRouter.get('/:id', async (req, res) => {
    const menuItemId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    MenuItem.findById(menuItemId)
        .populate('restaurant_id', 'name')
        .then(menuItem => {
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(menuItem);
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
menuRouter.get('/restaurant/:restaurantId', async (req, res) => {
    const restaurantId = req.params.restaurantId;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    MenuItem.find({ restaurant_id: restaurantId })
        .populate('restaurant_id', 'name')
        .then(menuItems => res.json(menuItems))
        .catch(err => res.status(500).json({ error: err.message }));
});
menuRouter.put('/:id', async (req, res) => {
    const menuItemId = req.params.id;
    const { restaurant_id, name, description, price, category } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    MenuItem.findByIdAndUpdate(menuItemId, { restaurant_id, name, description, price, category }, { new: true })
        .populate('restaurant_id', 'name')
        .then(menuItem => {
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json(menuItem);
    })
        .catch(err => res.status(400).json({ error: err.message }));
});
menuRouter.delete('/:id', async (req, res) => {
    const menuItemId = req.params.id;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    MenuItem.findByIdAndDelete(menuItemId)
        .then(menuItem => {
        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    })
        .catch(err => res.status(500).json({ error: err.message }));
});
export default menuRouter;
