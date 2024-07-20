import express from 'express';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/user', userRoutes);

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};

startServer();
