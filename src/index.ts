import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { generateSwagger } from './swagger';
import { initializeDatabase } from './database';

dotenv.config();
const app = express();
const port = 3000;

import menuRouter from './routes/menuRouter';
import restaurantRouter from './routes/restaurantRouter';
import userRouter from './routes/userRouter';

app.use(express.json());
app.use('/users', userRouter);
app.use('/restaurants', restaurantRouter);
app.use('/menus', menuRouter);

// Connect to MongoDB and initialize database
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodexpress';

mongoose.connect(mongoUri)
    .then(async () => {
        console.log('Connected to MongoDB:', mongoUri);
        await initializeDatabase();

        // Generate Swagger documentation
        await generateSwagger();

        // Serve Swagger UI
        const swaggerDocument = await import('../dist/swagger_output.json', { assert: { type: 'json' } });
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument.default));

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
            console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


