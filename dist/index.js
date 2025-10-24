import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import swaggerAutogenDefault from 'swagger-autogen';
import swaggerUi from 'swagger-ui-express';
config();
const app = express();
const port = 3000;
import menuRouter from './routes/menuRouter.js';
import restaurantRouter from './routes/restaurantRouter.js';
import userRouter from './routes/userRouter.js';

app.use(express.json());

// ajouter une route courte pour supporter /user (redirection vers /users)
app.get('/user', (req, res) => {
	// redirige vers la route normale /users
	res.redirect(301, '/users');
});

// --- Nouveau : connexion simple via MONGO_URI (dotenv) ---
// Utilisez export MONGO_URI="mongodb://<HOST>:27017/foodexpress" si nécessaire
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodexpress';

mongoose.connect(mongoUri)
	.then(async () => {
		console.log('Connected to MongoDB:', mongoUri);

		// --- nouveau : génération swagger ---
		try {
			const swaggerAutogen = (swaggerAutogenDefault && typeof swaggerAutogenDefault === 'function')
				? swaggerAutogenDefault()
				: (swaggerAutogenDefault.default ? swaggerAutogenDefault.default() : null);

			const output = path.resolve(process.cwd(), 'swagger_output.json');
			const endpointsFiles = [
				path.resolve(process.cwd(), 'index.js'),
				path.resolve(process.cwd(), 'routes', 'userRouter.js'),
				path.resolve(process.cwd(), 'routes', 'restaurantRouter.js'),
				path.resolve(process.cwd(), 'routes', 'menuRouter.js'),
				path.resolve(process.cwd(), 'middlewares', 'authMiddleware.js'),
				path.resolve(process.cwd(), 'middlewares', 'adminMiddleware.js'),
				path.resolve(process.cwd(), 'middlewares', 'validationMiddleware.js')
			];

			const doc = {
				info: { title: 'API FoodExpress', description: 'Documentation auto-générée' },
				host: `localhost:${process.env.PORT || 3000}`,
				schemes: ['http'],
				// sécurité : header Authorization Bearer
				securityDefinitions: {
					bearerAuth: {
						type: 'apiKey',
						name: 'Authorization',
						in: 'header',
						description: "Utilisez 'Bearer <token>'"
					}
				},
				// appliquer la sécurité par défaut (peut être surchargée dans les routes)
				security: [{ bearerAuth: [] }]
			};

			// Générer si le fichier n'existe pas ou générer à chaque démarrage (ici on regen à chaque démarrage)
			if (swaggerAutogen) {
				await swaggerAutogen(output, endpointsFiles, doc);
				console.log('Swagger généré →', output);
			} else {
				console.warn('swagger-autogen non initialisé correctement.');
			}

			// Monter swagger-ui
			try {
				const swaggerDocument = JSON.parse(fs.readFileSync(output, 'utf8'));
				app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
				console.log('Swagger UI disponible sur /api-doc');
			} catch (e) {
				console.warn('Impossible de charger swagger_output.json pour swagger-ui:', e.message);
			}
		} catch (e) {
			console.warn('Erreur lors de la génération Swagger (non bloquant) :', e.message);
		}

		// Monter les routes (si pas déjà montées plus haut) — les imports existent en haut
		app.use('/users', userRouter);
		app.use('/restaurants', restaurantRouter);
		app.use('/menus', menuRouter);

		app.listen(port, () => console.log(`Serveur sur http://localhost:${port}`));
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err);
		process.exit(1);
	});
