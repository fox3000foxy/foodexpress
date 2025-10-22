import { Router } from 'express';
import mongoose, { connect, Schema } from 'mongoose';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { restaurantCreationSchema, restaurantIdSchema, restaurantQuerySchema, restaurantUpdateSchema } from '../validation/restaurantValidation.js';
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
/* #swagger.tags = ['Restaurants'] */
/* #swagger.description = 'CRUD restaurants' */
restaurantRouter.post('/', adminMiddleware, validate({ body: restaurantCreationSchema }), async (req, res) => {
    /* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
    /* #swagger.parameters['body'] = { in: 'body', description: 'Restaurant payload' } */
    /* #swagger.responses[201] = { description: 'Restaurant created' } */
    const { name, address, phone, opening_hours } = req.body;
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const newRestaurant = new Restaurant({ name, address, phone, opening_hours });
    newRestaurant.save()
        .then(restaurant => res.status(201).json(restaurant))
        .catch(err => res.status(400).json({ error: err.message }));
});
restaurantRouter.get('/', validate({ query: restaurantQuerySchema }), async (req, res) => {
    /* #swagger.responses[200] = { description: 'Paged restaurants' } */
    await connect('mongodb://127.0.0.1:27017/foodexpress');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder || 'asc';
    const skip = (page - 1) * limit;
    try {
        let query = Restaurant.find();
        if (sortBy === 'name') {
            query = query.sort({ name: sortOrder === 'desc' ? -1 : 1 });
        }
        else if (sortBy === 'address') {
            query = query.sort({ address: sortOrder === 'desc' ? -1 : 1 });
        }
        query = query.skip(skip).limit(limit);
        const restaurants = await query.exec();
        const total = await Restaurant.countDocuments();
        const totalPages = Math.ceil(total / limit);
        res.json({
            restaurants,
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
restaurantRouter.get('/:id', validate({ params: restaurantIdSchema }), async (req, res) => {
    /* #swagger.responses[200] = { description: 'Restaurant object' } */
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
restaurantRouter.put('/:id', adminMiddleware, validate({ params: restaurantIdSchema, body: restaurantUpdateSchema }), async (req, res) => {
    /* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
    /* #swagger.parameters['body'] = { in: 'body', description: 'Restaurant update payload' } */
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
restaurantRouter.delete('/:id', adminMiddleware, validate({ params: restaurantIdSchema }), async (req, res) => {
    /* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
    /* #swagger.responses[200] = { description: 'Restaurant deleted' } */
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
