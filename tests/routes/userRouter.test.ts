import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import User from '../../src/models/userModel';
import userRouter from '../../src/routes/userRouter';

const app = express();
app.use(express.json());
app.use('/users', userRouter);

describe('User Router', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = new User({
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    const regularUser = new User({
      email: 'user@example.com',
      username: 'user',
      password: hashedPassword,
      role: 'user'
    });
    const savedUser = await regularUser.save();
    userId = savedUser._id.toString();

    adminToken = jwt.sign({ userId: adminUser._id.toString(), role: 'admin' }, 'test_secret');
    userToken = jwt.sign({ userId: userId, role: 'user' }, 'test_secret');
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.username).toBe(userData.username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        username: '',
        password: '123'
      };

      await request(app)
        .post('/users')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /users/login', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const invalidLogin = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/users/login')
        .send(invalidLogin)
        .expect(401);
    });
  });
});
