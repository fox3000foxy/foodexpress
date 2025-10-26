import swaggerAutogen from 'swagger-autogen';
import {fileURLToPath} from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFile = path.join(process.cwd(), 'swagger_output.json');
const endpointsFiles = [
    path.join(__dirname, 'routes/userRouter.js'),
    path.join(__dirname, 'routes/restaurantRouter.js'),
    path.join(__dirname, 'routes/menuRouter.js'),
    path.join(__dirname, 'middlewares/adminMiddleware.js'),
    path.join(__dirname, 'middlewares/authMiddleware.js'),
    path.join(__dirname, 'middlewares/userAuthorizationMiddleware.js'),
    path.join(__dirname, 'middlewares/validationMiddleware.js'),
    path.join(__dirname, 'index.js'),
    path.join(__dirname, 'validation/menuValidation.js'),
    path.join(__dirname, 'validation/restaurantValidation.js'),
    path.join(__dirname, 'validation/userValidation.js')
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
