import { Response } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware, { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

describe('Auth Middleware', () => {
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

  it('should call next() with valid token', () => {
    const payload = { userId: '123', role: 'user' };
    const token = jwt.sign(payload, 'test_secret');

    mockReq.headers = { authorization: `Bearer ${token}` };

    jest.spyOn(jwt, 'verify').mockImplementation(() => payload);

    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', () => {
    authMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token required' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
