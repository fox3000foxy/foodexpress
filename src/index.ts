import express from 'express';
const app = express();
const port = 3000;

import userRouter from './routes/userRouter';

app.use(express.json());
app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

