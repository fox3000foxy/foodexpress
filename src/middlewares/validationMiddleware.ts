import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

interface ValidationOptions {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export function validate(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    
    if (options.body) {
      const { error } = options.body.validate(req.body);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    
    if (options.query) {
      const { error } = options.query.validate(req.query);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    
    if (options.params) {
      const { error } = options.params.validate(req.params);
      if (error) {
        errors.push(...error.details.map(detail => detail.message));
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
}

