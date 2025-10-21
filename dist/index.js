import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
config();
const app = express();
const port = 3000;
import menuRouter from './routes/menuRouter.js';
import restaurantRouter from './routes/restaurantRouter.js';
import userRouter from './routes/userRouter.js';

app.use(express.json());
app.use('/users', userRouter);
app.use('/restaurants', restaurantRouter);
app.use('/menus', menuRouter);

// Remplacement : connecter une seule fois avant de démarrer le serveur
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost/foodexpress';
mongoose.connect(mongoUri)
	.then(() => {
		console.log('Connected to MongoDB:', mongoUri);
		app.listen(port, () => {
			console.log(`Server is running at http://localhost:${port}`);
		});
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	});
