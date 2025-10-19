
import { Router } from 'express';

const menuRouter = Router();

menuRouter.get('/', (req, res) => {
  res.send('User list');
});

menuRouter.post('/', (req, res) => {
  res.send('Create user');
});

export default menuRouter;


