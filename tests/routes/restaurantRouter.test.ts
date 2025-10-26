import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Restaurant from '../../src/models/restaurantModel';
import restaurantRouter from '../../src/routes/restaurantRouter';

const app = express();
app.use(express.json());
app.use('/restaurants', restaurantRouter);

describe('Restaurant Router', () => {
  let adminToken: string;
  let restaurantId: string;

  beforeEach(async () => {
    // Create admin user for token
    adminToken = jwt.sign({ userId: 'admin123', role: 'admin' }, 'test_secret');

    // Create test restaurant
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      address: '123 Test Street, Test City',
      phone: '1234567890',
      opening_hours: '9 AM - 9 PM'
    });
    const savedRestaurant = await restaurant.save();
    restaurantId = savedRestaurant._id.toString();
  });

  describe('POST /restaurants', () => {
    it('should create a new restaurant for admin', async () => {
      const restaurantData = {
        name: 'New Restaurant',
        address: '456 New Street, New City',
        phone: '1987654321',
        opening_hours: '10 AM - 10 PM'
      };

      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(restaurantData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(restaurantData.name);
      expect(response.body.address).toBe(restaurantData.address);
    });

    it('should return 401 without admin token', async () => {
      const restaurantData = {
        name: 'New Restaurant',
        address: '456 New Street, New City',
        phone: '0987654321',
        opening_hours: '10 AM - 10 PM'
      };

      await request(app)
        .post('/restaurants')
        .send(restaurantData)
        .expect(401);
    });
  });

  describe('GET /restaurants', () => {
    it('should return all restaurants with pagination', async () => {
      const response = await request(app)
        .get('/restaurants')
        .expect(200);

      expect(response.body).toHaveProperty('restaurants');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.restaurants)).toBe(true);
      expect(response.body.restaurants.length).toBeGreaterThan(0);
    });
  });
});
