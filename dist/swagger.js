import swaggerAutogen from 'swagger-autogen';
const outputFile = './dist/swagger_output.json';
const endpointsFiles = [
    './src/routes/userRouter.ts',
    './src/routes/restaurantRouter.ts',
    './src/routes/menuRouter.ts',
    './src/middlewares/adminMiddleware.ts',
    './src/middlewares/authMiddleware.ts',
    './src/middlewares/userAuthorizationMiddleware.ts',
    './src/middlewares/validationMiddleware.ts',
    './src/index.ts',
    './src/validation/menuValidation.ts',
    './src/validation/restaurantValidation.ts',
    './src/validation/userValidation.ts'
];
const doc = {
    info: {
        title: 'API FoodExpress',
        description: 'Documentation auto-générée',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: "Utilisez 'Bearer <token>'"
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ],
    components: {
        schemas: {
            User: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    username: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] }
                }
            },
            Restaurant: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    opening_hours: { type: 'string' }
                }
            },
            MenuItem: {
                type: 'object',
                properties: {
                    restaurant_id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    category: { type: 'string' }
                }
            }
        }
    }
};
export const generateSwagger = async () => {
    await swaggerAutogen(outputFile, endpointsFiles, doc);
};
