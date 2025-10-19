import express from 'express';
const app = express();
const port = 3000;

import menuRouter from './routes/menuRouter';
import restaurantRouter from './routes/restaurantRouter';
import userRouter from './routes/userRouter';

app.use(express.json());
app.use('/users', userRouter);
app.use('/restaurants', restaurantRouter);
app.use('/menus', menuRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
