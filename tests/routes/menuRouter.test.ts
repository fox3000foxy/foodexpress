import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import MenuItem from '../../src/models/menuItemModel';
import Restaurant from '../../src/models/restaurantModel';
import menuRouter from '../../src/routes/menuRouter';

const app = express();
app.use(express.json());
app.use('/menus', menuRouter);

describe('Menu Router', () => {
  let adminToken: string;
  let restaurantId: string;
  let menuItemId: string;

  beforeEach(async () => {
    adminToken = jwt.sign({ userId: 'admin123', role: 'admin' }, 'test_secret');

    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      address: '123 Test Street, Test City',
      phone: '1234567890',
      opening_hours: '9 AM - 9 PM'
    });
    const savedRestaurant = await restaurant.save();
    restaurantId = savedRestaurant._id.toString();

    const menuItem = new MenuItem({
      restaurant_id: restaurantId,
      name: 'Test Dish',
      description: 'A delicious test dish',
      price: 15.99,
      category: 'main course'
    });
    const savedMenuItem = await menuItem.save();
    menuItemId = savedMenuItem._id.toString();
  });

  describe('POST /menus', () => {
    it('should create a new menu item for admin', async () => {
      const menuData = {
        restaurant_id: restaurantId,
        name: 'New Dish',
        description: 'A new delicious dish',
        price: 12.99,
        category: 'appetizer'
      };

      const response = await request(app)
        .post('/menus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(menuData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(menuData.name);
      expect(response.body.price).toBe(menuData.price);
    });

    it('should return 401 without admin token', async () => {
      const menuData = {
        restaurant_id: restaurantId,
        name: 'New Dish',
        description: 'A new delicious dish',
        price: 12.99,
        category: 'appetizer'
      };

      await request(app)
        .post('/menus')
        .send(menuData)
        .expect(401);
    });
  });

  describe('GET /menus', () => {
    it('should return all menu items with pagination', async () => {
      const response = await request(app)
        .get('/menus')
        .expect(200);

      expect(response.body).toHaveProperty('menuItems');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.menuItems)).toBe(true);
      expect(response.body.menuItems.length).toBeGreaterThan(0);
    });
  });
});
