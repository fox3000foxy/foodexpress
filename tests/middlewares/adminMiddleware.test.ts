import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import adminMiddleware, { AuthenticatedRequest } from '../../src/middlewares/adminMiddleware';

describe('Admin Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() for admin user', () => {
    const payload = { userId: '123', role: 'admin' };
    const token = jwt.sign(payload, 'test_secret');

    mockReq.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwt, 'verify').mockImplementation(() => payload);

    adminMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 403 for non-admin user', () => {
    const payload = { userId: '123', role: 'user' };
    const token = jwt.sign(payload, 'test_secret');

    mockReq.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwt, 'verify').mockImplementation(() => payload);

    adminMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. Admins only.' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
