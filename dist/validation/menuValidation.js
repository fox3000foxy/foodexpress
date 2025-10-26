import Joi from 'joi';
export const menuItemCreationSchema = Joi.object({
    restaurant_id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'Invalid restaurant ID format',
        'any.required': 'Restaurant ID is required'
    }),
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Menu item name must be at least 2 characters long',
        'string.max': 'Menu item name cannot exceed 100 characters',
        'any.required': 'Menu item name is required'
    }),
    description: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Description is required'
    }),
    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be a positive number',
        'number.precision': 'Price cannot have more than 2 decimal places',
        'any.required': 'Price is required'
    }),
    category: Joi.string()
        .valid('appetizer', 'main course', 'dessert', 'beverage', 'snack', 'salad', 'soup', 'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian', 'vegan', 'other')
        .required()
        .messages({
        'any.only': 'Category must be one of: appetizer, main course, dessert, beverage, snack, salad, soup, pasta, pizza, burger, sandwich, seafood, vegetarian, vegan, other',
        'any.required': 'Category is required'
    })
});
export const menuItemUpdateSchema = Joi.object({
    restaurant_id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Invalid restaurant ID format'
    }),
    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Menu item name must be at least 2 characters long',
        'string.max': 'Menu item name cannot exceed 100 characters'
    }),
    description: Joi.string()
        .min(10)
        .max(500)
        .optional()
        .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters'
    }),
    price: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be a positive number',
        'number.precision': 'Price cannot have more than 2 decimal places'
    }),
    category: Joi.string()
        .valid('appetizer', 'main course', 'dessert', 'beverage', 'snack', 'salad', 'soup', 'pasta', 'pizza', 'burger', 'sandwich', 'seafood', 'vegetarian', 'vegan', 'other')
        .optional()
        .messages({
        'any.only': 'Category must be one of: appetizer, main course, dessert, beverage, snack, salad, soup, pasta, pizza, burger, sandwich, seafood, vegetarian, vegan, other'
    })
});
export const menuItemIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'Invalid menu item ID format',
        'any.required': 'Menu item ID is required'
    })
});
export const menuRestaurantIdSchema = Joi.object({
    restaurantId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'Invalid restaurant ID format',
        'any.required': 'Restaurant ID is required'
    })
});
export const menuQuerySchema = Joi.object({
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
        .valid('name', 'price', 'category', 'address', 'createdAt', 'updatedAt')
        .optional()
        .messages({
        'any.only': 'Sort by must be one of: name, price, category, address, createdAt, updatedAt'
    }),
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .optional()
        .messages({
        'any.only': 'Sort order must be either "asc" or "desc"'
    })
});
