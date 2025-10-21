import { Router } from 'express';
import mongoose, { connect, Schema } from 'mongoose';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { menuItemCreationSchema, menuItemUpdateSchema, menuItemIdSchema, menuRestaurantIdSchema, menuQuerySchema } from '../validation/menuValidation.js';
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
menuRouter.post('/', adminMiddleware, validate({ body: menuItemCreationSchema }), async (req, res) => {
    const { restaurant_id, name, description, price, category } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const newMenuItem = new MenuItem({ restaurant_id, name, description, price, category });
    newMenuItem.save()
        .then(menuItem => res.status(201).json(menuItem))
        .catch(err => res.status(400).json({ error: err.message }));
});
menuRouter.get('/', validate({ query: menuQuerySchema }), async (req, res) => {
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder || 'asc';
    const skip = (page - 1) * limit;
    try {
        let query = MenuItem.find().populate('restaurant_id', 'name address');
        if (sortBy === 'name') {
            query = query.sort({ name: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'price') {
            query = query.sort({ price: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'category') {
            query = query.sort({ category: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'address') {
            const sortDirection = sortOrder === 'desc' ? -1 : 1;
            const menuItems = await MenuItem.aggregate([
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurant_id',
                        foreignField: '_id',
                        as: 'restaurant_id'
                    }
                },
                {
                    $unwind: '$restaurant_id'
                },
                {
                    $sort: { 'restaurant_id.address': sortDirection }
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                }
            ]);
            const total = await MenuItem.countDocuments();
            const totalPages = Math.ceil(total / limit);
            return res.json({
                menuItems,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        }
        query = query.skip(skip).limit(limit);
        const menuItems = await query.exec();
        const total = await MenuItem.countDocuments();
        const totalPages = Math.ceil(total / limit);
        res.json({
            menuItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
menuRouter.get('/:id', validate({ params: menuItemIdSchema }), async (req, res) => {
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
menuRouter.get('/restaurant/:restaurantId', validate({ params: menuRestaurantIdSchema, query: menuQuerySchema }), async (req, res) => {
    const restaurantId = req.params.restaurantId;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder || 'asc';
    const skip = (page - 1) * limit;
    try {
        let query = MenuItem.find({ restaurant_id: restaurantId }).populate('restaurant_id', 'name address');
        if (sortBy === 'name') {
            query = query.sort({ name: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'price') {
            query = query.sort({ price: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'category') {
            query = query.sort({ category: sortOrder === 'desc' ? -1 : 1 });
        }
        query = query.skip(skip).limit(limit);
        const menuItems = await query.exec();
        const total = await MenuItem.countDocuments({ restaurant_id: restaurantId });
        const totalPages = Math.ceil(total / limit);
        res.json({
            menuItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
menuRouter.put('/:id', adminMiddleware, validate({ params: menuItemIdSchema, body: menuItemUpdateSchema }), async (req, res) => {
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
menuRouter.delete('/:id', adminMiddleware, validate({ params: menuItemIdSchema }), async (req, res) => {
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
