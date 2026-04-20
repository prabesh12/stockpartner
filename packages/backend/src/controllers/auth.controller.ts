import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { RegisterRequest, LoginRequest, AuthResponse } from 'shared';

const generateToken = (userId: string, shopId: string, role: string): string => {
  return jwt.sign(
    { userId, shopId, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { shopName, userName, email, phone, password, categories } = req.body as RegisterRequest;

    if (!shopName || !userName || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { 
          name: shopName,
          categories: categories || [],
        },
      });

      const user = await tx.user.create({
        data: {
          shopId: shop.id,
          name: userName,
          email,
          phone,
          passwordHash: hashedPassword,
          role: 'OWNER',
        },
      });

      return { shop, user };
    });

    const token = generateToken(result.user.id, result.shop.id, result.user.role);

    const response: AuthResponse = {
      token,
      user: {
        id: result.user.id,
        shopId: result.shop.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role as any,
        shopCategories: result.shop.categories,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, phone, password } = req.body as LoginRequest;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined },
        ].filter(condition => Object.values(condition)[0] !== undefined),
      },
      include: {
        shop: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.shopId, user.role);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        shopId: user.shopId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as any,
        shopCategories: user.shop.categories,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { shop: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const response: AuthResponse['user'] = {
    id: user.id,
    shopId: user.shopId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as any,
    shopCategories: user.shop.categories,
  };

  res.status(200).json(response);
}
