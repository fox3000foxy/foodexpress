import Joi from 'joi';
export const restaurantCreationSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name cannot exceed 100 characters',
        'any.required': 'Restaurant name is required'
    }),
    address: Joi.string()
        .min(10)
        .max(200)
        .required()
        .messages({
        'string.min': 'Address must be at least 10 characters long',
        'string.max': 'Address cannot exceed 200 characters',
        'any.required': 'Address is required'
    }),
    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .required()
        .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
    }),
    opening_hours: Joi.string()
        .min(5)
        .max(50)
        .required()
        .messages({
        'string.min': 'Opening hours must be at least 5 characters long',
        'string.max': 'Opening hours cannot exceed 50 characters',
        'any.required': 'Opening hours are required'
    })
});
export const restaurantUpdateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name cannot exceed 100 characters'
    }),
    address: Joi.string()
        .min(10)
        .max(200)
        .optional()
        .messages({
        'string.min': 'Address must be at least 10 characters long',
        'string.max': 'Address cannot exceed 200 characters'
    }),
    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Please provide a valid phone number'
    }),
    opening_hours: Joi.string()
        .min(5)
        .max(50)
        .optional()
        .messages({
        'string.min': 'Opening hours must be at least 5 characters long',
        'string.max': 'Opening hours cannot exceed 50 characters'
    })
});
export const restaurantIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'Invalid restaurant ID format',
        'any.required': 'Restaurant ID is required'
    })
});
export const restaurantQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
    }),
    sortBy: Joi.string()
        .valid('name', 'address', 'createdAt', 'updatedAt')
        .optional()
        .messages({
        'any.only': 'Sort by must be one of: name, address, createdAt, updatedAt'
    }),
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .messages({
        'any.only': 'Sort order must be either "asc" or "desc"'
    })
});
