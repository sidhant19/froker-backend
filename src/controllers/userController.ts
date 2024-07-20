import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const signupSchema = z.object({
  phoneNumber: z.string(),
  email: z.string().email(),
  name: z.string(),
  dateOfRegistration: z.string(),
  dob: z.string(),
  monthlySalary: z.number().min(25000),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const borrowSchema = z.object({
  amount: z.number().min(100)
});

export const approveSignup = async (req: Request, res: Response) => {
  try {
    const parsedData = signupSchema.parse(req.body);
    const { email, dob, monthlySalary, password } = parsedData;

    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age <= 20) {
      return res.status(400).json({ message: 'User must be above 20 years old' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        ...parsedData,
        password: hashedPassword,
        status: monthlySalary >= 25000 ? 'approved' : 'rejected',
        purchasePower: monthlySalary*3
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const showUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      purchasePower: user.purchasePower,
      phoneNumber: user.phoneNumber,
      email: user.email,
      dateOfRegistration: user.dateOfRegistration,
      dob: user.dob,
      monthlySalary: user.monthlySalary
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const borrowMoney = async (req: Request, res: Response) => {
  try {
    const { amount } = borrowSchema.parse(req.body);
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if(user.purchasePower < amount) {
        return res.status(400).json({ message: 'Exceeding purchase power' });
    }

    user.purchasePower -= amount;
    await prisma.user.update({
      where: { id: userId },
      data: { purchasePower: user.purchasePower }
    });

    const interestRate = 0.08;
    const tenure = 12;
    const monthlyRepayment = (amount + (amount * interestRate)) / tenure;

    res.json({
      updatedPurchasePower: user.purchasePower,
      monthlyRepayment
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};
