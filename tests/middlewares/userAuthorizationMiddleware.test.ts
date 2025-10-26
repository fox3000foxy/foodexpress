import { Response } from 'express';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';
import userAuthorizationMiddleware from '../../src/middlewares/userAuthorizationMiddleware';

describe('User Authorization Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      params: {},
      user: { userId: '', role: '' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() for admin user', () => {
    mockReq.params = { id: '123' };
    mockReq.user = { userId: '456', role: 'admin' };

    userAuthorizationMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next() for user accessing their own resource', () => {
    const userId = '123';
    mockReq.params = { id: userId };
    mockReq.user = { userId, role: 'user' };

    userAuthorizationMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 403 for user accessing another user\'s resource', () => {
    mockReq.params = { id: '123' };
    mockReq.user = { userId: '456', role: 'user' };

    userAuthorizationMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Access denied. You can only access your own resources.' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
