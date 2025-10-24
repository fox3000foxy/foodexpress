import { Router } from 'express';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { restaurantCreationSchema, restaurantIdSchema, restaurantQuerySchema, restaurantUpdateSchema } from '../validation/restaurantValidation.js';
import Restaurant from '../models/restaurantModel.js';

/* #swagger.tags = ['Restaurants'] */
/* #swagger.description = 'CRUD restaurants' */

const router = Router();

router.post('/', adminMiddleware, validate({ body: restaurantCreationSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const { name, address, phone, opening_hours } = req.body;
		const newRestaurant = new Restaurant({ name, address, phone, opening_hours });
		const saved = await newRestaurant.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.get('/', validate({ query: restaurantQuerySchema }), async (req, res) => {
	/* #swagger.responses[200] = { description: 'Paged restaurants' } */
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const sortBy = req.query.sortBy;
		const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
		const skip = (page - 1) * limit;
		let query = Restaurant.find();
		if (sortBy === 'name') query = query.sort({ name: sortOrder });
		if (sortBy === 'address') query = query.sort({ address: sortOrder });
		query = query.skip(skip).limit(limit);
		const restaurants = await query.exec();
		const total = await Restaurant.countDocuments();
		const totalPages = Math.ceil(total / limit);
		res.json({ restaurants, pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit } });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/:id', validate({ params: restaurantIdSchema }), async (req, res) => {
	/* #swagger.responses[200] = { description: 'Restaurant object' } */
	try {
		const restaurant = await Restaurant.findById(req.params.id);
		if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
		res.json(restaurant);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put('/:id', adminMiddleware, validate({ params: restaurantIdSchema, body: restaurantUpdateSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ error: 'Restaurant not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.delete('/:id', adminMiddleware, validate({ params: restaurantIdSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const deleted = await Restaurant.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Restaurant not found' });
		res.json({ message: 'Restaurant deleted successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
