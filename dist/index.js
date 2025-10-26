import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { generateSwagger } from './swagger.js';
import { initializeDatabase } from './database.js';
import menuRouter from './routes/menuRouter.js';
import restaurantRouter from './routes/restaurantRouter.js';
import userRouter from './routes/userRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path: path.resolve(__dirname, '../.env')});
console.log('JWT_SECRET =', process.env.JWT_SECRET);


const app = express();
const port = 3000;

const swaggerPath = "./swagger_output.json";


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
    const swaggerDocument = JSON.parse(fs.readFileSync('./swagger_output.json', 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
    });
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
