import { Router } from 'express';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { menuItemCreationSchema, menuItemUpdateSchema, menuItemIdSchema, menuRestaurantIdSchema, menuQuerySchema } from '../validation/menuValidation.js';
import MenuItem from '../models/menuItemModel.js';

const router = Router();
/* #swagger.tags = ['Menus'] */
/* #swagger.description = 'API pour les items de menu' */

router.post('/', adminMiddleware, validate({ body: menuItemCreationSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const item = new MenuItem(req.body);
		const saved = await item.save();
		res.status(201).json(saved);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.get('/', validate({ query: menuQuerySchema }), async (req, res) => {
	/* #swagger.responses[200] = { description: 'Paged menu items' } */
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		let query = MenuItem.find().populate('restaurant_id', 'name address');
		// basic sort handling
		if (req.query.sortBy) {
			const dir = req.query.sortOrder === 'desc' ? -1 : 1;
			query = query.sort({ [req.query.sortBy]: dir });
		}
		const items = await query.skip(skip).limit(limit).exec();
		const total = await MenuItem.countDocuments();
		const totalPages = Math.ceil(total / limit);
		res.json({ menuItems: items, pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit } });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/:id', validate({ params: menuItemIdSchema }), async (req, res) => {
	/* #swagger.responses[200] = { description: 'Menu item object' } */
	try {
		const item = await MenuItem.findById(req.params.id).populate('restaurant_id', 'name');
		if (!item) return res.status(404).json({ error: 'Menu item not found' });
		res.json(item);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/restaurant/:restaurantId', validate({ params: menuRestaurantIdSchema, query: menuQuerySchema }), async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const items = await MenuItem.find({ restaurant_id: req.params.restaurantId })
			.populate('restaurant_id', 'name address')
			.skip(skip)
			.limit(limit)
			.exec();
		const total = await MenuItem.countDocuments({ restaurant_id: req.params.restaurantId });
		const totalPages = Math.ceil(total / limit);
		res.json({ menuItems: items, pagination: { currentPage: page, totalPages, totalItems: total, itemsPerPage: limit } });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.put('/:id', adminMiddleware, validate({ params: menuItemIdSchema, body: menuItemUpdateSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('restaurant_id', 'name');
		if (!updated) return res.status(404).json({ error: 'Menu item not found' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

router.delete('/:id', adminMiddleware, validate({ params: menuItemIdSchema }), async (req, res) => {
	/* #swagger.parameters['Authorization'] = { in: 'header', description: 'Bearer admin token', required: true } */
	try {
		const deleted = await MenuItem.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
		res.json({ message: 'Menu item deleted successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
