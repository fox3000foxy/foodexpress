import { Router } from 'express';
import adminMiddleware from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import MenuItem from '../models/menuItemModel';
import { menuItemCreationSchema, menuItemIdSchema, menuItemUpdateSchema, menuQuerySchema, menuRestaurantIdSchema } from '../validation/menuValidation';
const menuRouter = Router();
/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Create a new menu item (admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Bad Request
 */
menuRouter.post('/', adminMiddleware, validate({ body: menuItemCreationSchema }), async (req, res) => {
    const { restaurant_id, name, description, price, category } = req.body;
    const newMenuItem = new MenuItem({ restaurant_id, name, description, price, category });
    newMenuItem.save()
        .then((menuItem) => res.status(201).json(menuItem))
        .catch((err) => res.status(400).json({ error: err.message }));
});
/**
 * @swagger
 * /menus:
 *   get:
 *     summary: Get all menu items with pagination
 *     tags: [Menus]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paged menu items
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
menuRouter.get('/', validate({ query: menuQuerySchema }), async (req, res) => {
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
/**
 * @swagger
 * /menus/{id}:
 *   get:
 *     summary: Get a menu item by ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item object
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
menuRouter.get('/:id', validate({ params: menuItemIdSchema }), async (req, res) => {
    const menuItemId = req.params.id;
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
/**
 * @swagger
 * /menus/restaurant/{restaurantId}:
 *   get:
 *     summary: Get menu items by restaurant ID
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu items for the restaurant
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
menuRouter.get('/restaurant/:restaurantId', validate({ params: menuRestaurantIdSchema, query: menuQuerySchema }), async (req, res) => {
    const restaurantId = req.params.restaurantId;
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
/**
 * @swagger
 * /menus/{id}:
 *   put:
 *     summary: Update a menu item by ID (admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 */
menuRouter.put('/:id', adminMiddleware, validate({ params: menuItemIdSchema, body: menuItemUpdateSchema }), async (req, res) => {
    const menuItemId = req.params.id;
    const { restaurant_id, name, description, price, category } = req.body;
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
/**
 * @swagger
 * /menus/{id}:
 *   delete:
 *     summary: Delete a menu item by ID (admin only)
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
menuRouter.delete('/:id', adminMiddleware, validate({ params: menuItemIdSchema }), async (req, res) => {
    const menuItemId = req.params.id;
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
