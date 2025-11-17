import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const generateToken = (id: number, email: string, role: string) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
};

export const register = async (req: express.Request, res: express.Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // First registered user can be an admin, or set it manually
        // role: (await prisma.user.count()) === 0 ? 'admin' : 'user',
      },
    });

    const token = generateToken(user.id, user.email, user.role);
    
    // Omit password from the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    // If login is successful, check if it's the designated admin email
    if (user.email === 'ubaidi075@gmail.com' && user.role !== 'admin') {
        const updatedAdmin = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });
        user.role = updatedAdmin.role;
    }

    const token = generateToken(user.id, user.email, user.role);

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};