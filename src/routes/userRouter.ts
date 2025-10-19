
import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.send('User list');
});

userRouter.post('/', (req, res) => {
  res.send('Create user');
});

export default userRouter;
