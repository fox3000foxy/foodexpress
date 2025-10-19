
import { Router } from 'express';

interface User {
    id: number;
    email: string; 
    username: string; 
    password: string; 
    role: "user" | "admin";
}

const userRouter = Router();

userRouter.post('/', (req, res) => {
    
    res.send('Create user');
});

userRouter.get('/', (req, res) => {
    
    res.send('User list');
});

userRouter.get('/:id', (req, res) => {
    const userId = req.params.id;
    
    res.send(`Get user with ID: ${userId}`);
});

userRouter.put('/:id', (req, res) => {
    const userId = req.params.id;
    
    res.send(`Update user with ID: ${userId}`);
});

userRouter.delete('/:id', (req, res) => {
    const userId = req.params.id;
    
    res.send(`Delete user with ID: ${userId}`);
});

export default userRouter;


