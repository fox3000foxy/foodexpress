
import { Router } from 'express';

const menuRouter = Router();

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

menuRouter.get('/', (req, res) => {
  res.send('User list');
});

menuRouter.post('/', (req, res) => {
  res.send('Create user');
});

export default menuRouter;


