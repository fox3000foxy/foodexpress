
import { Router } from 'express';

const restaurantRouter = Router();

restaurantRouter.get('/', (req, res) => {
  res.send('User list');
});

restaurantRouter.post('/', (req, res) => {
  res.send('Create user');
});

export default restaurantRouter;

