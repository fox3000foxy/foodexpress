import { Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../src/middlewares/validationMiddleware';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should call next() for valid body', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().integer().min(0).required()
    });

    const middleware = validate({ body: schema });

    mockReq.body = { name: 'John', age: 25 };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 400 for invalid body', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().integer().min(0).required()
    });

    const middleware = validate({ body: schema });

    mockReq.body = { name: '', age: -5 };

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: expect.any(Array)
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
