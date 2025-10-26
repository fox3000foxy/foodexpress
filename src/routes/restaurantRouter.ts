
import { Router } from 'express';
import mongoose, { connect } from 'mongoose';
import adminMiddleware from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { restaurantCreationSchema, restaurantIdSchema, restaurantQuerySchema, restaurantUpdateSchema } from '../validation/restaurantValidation';
import Restaurant from '../models/restaurantModel';

const restaurantRouter = Router();

/**
 * @swagger
 * /restaurants:
 *   post:
 *     summary: Create a new restaurant (admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *       400:
 *         description: Bad Request
 */

restaurantRouter.post('/', adminMiddleware, validate({ body: restaurantCreationSchema }), async (req, res) => {
  const { name, address, phone, opening_hours } = req.body;

  const newRestaurant = new Restaurant({ name, address, phone, opening_hours });
  newRestaurant.save()
    .then((restaurant: any) => res.status(201).json(restaurant))
    .catch((err: any) => res.status(400).json({ error: err.message }));
});

/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get all restaurants with pagination
 *     tags: [Restaurants]
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
 *         description: Paged restaurants
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

restaurantRouter.get('/', validate({ query: restaurantQuerySchema }), async (req, res) => {

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = req.query.sortBy as string;
  const sortOrder = req.query.sortOrder as string || 'asc';

  const skip = (page - 1) * limit;

  try {
    let query = Restaurant.find();

    if (sortBy === 'name') {
      query = query.sort({ name: sortOrder === 'desc' ? -1 : 1 });
    } else if (sortBy === 'address') {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /restaurants/{id}:
 *   get:
 *     summary: Get a restaurant by ID
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant object
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */

restaurantRouter.get('/:id', validate({ params: restaurantIdSchema }), async (req, res) => {
  const restaurantId = req.params.id;

  Restaurant.findById(restaurantId)
    .then(restaurant => {
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

/**
 * @swagger
 * /restaurants/{id}:
 *   put:
 *     summary: Update a restaurant by ID (admin only)
 *     tags: [Restaurants]
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
 *             $ref: '#/components/schemas/Restaurant'
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 */

restaurantRouter.put('/:id', adminMiddleware, validate({ params: restaurantIdSchema, body: restaurantUpdateSchema }), async (req, res) => {
  const restaurantId = req.params.id;
  const { name, address, phone, opening_hours } = req.body;

  Restaurant.findByIdAndUpdate(restaurantId, { name, address, phone, opening_hours }, { new: true })
    .then(restaurant => {
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    })
    .catch(err => res.status(400).json({ error: err.message }));
});

/**
 * @swagger
 * /restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant by ID (admin only)
 *     tags: [Restaurants]
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
 *         description: Restaurant deleted successfully
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */

restaurantRouter.delete('/:id', adminMiddleware, validate({ params: restaurantIdSchema }), async (req, res) => {
  const restaurantId = req.params.id;

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


