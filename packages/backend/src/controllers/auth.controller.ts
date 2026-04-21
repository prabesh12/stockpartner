import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest } from 'shared';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

const generateToken = (userId: string, shopId: string, role: string): string => {
  return jwt.sign(
    { userId, shopId, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { shopName, userName, email, phone, password, categories, latitude, longitude, address } = req.body as RegisterRequest;

    if (!shopName || !userName || !password || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields (Email, Phone, Shop Name, Owner Name, and Password are all required)' });
    }

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const disposableDomains = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com'];
      const domain = email.split('@')[1].toLowerCase();
      if (disposableDomains.includes(domain)) {
        return res.status(400).json({ error: 'Disposable email addresses are not allowed' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { 
          name: shopName,
          categories: categories || [],
          contactNumber: phone,
          address: address || null,
          latitude: latitude ? parseFloat(latitude as any) : null,
          longitude: longitude ? parseFloat(longitude as any) : null,
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
          isVerified: false,
          verificationToken,
        },
      });

      return { shop, user };
    });

    if (email) {
      try {
        await sendVerificationEmail(email, verificationToken, shopName);
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr);
        // We still created the user, they'll just need to request a resend later (impl to be added)
      }
    }

    const response: AuthResponse = {
      message: 'Shop registered! Please check your email to verify your account.',
      user: {
        id: result.user.id,
        shopId: result.shop.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role as any,
        shopCategories: result.shop.categories,
        isVerified: result.user.isVerified,
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

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        shop: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email address before logging in.' });
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
        isVerified: user.isVerified,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const user = await prisma.user.findUnique({
      where: { verificationToken: token as string }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired verification token' });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      }
    });

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordRequest;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    
    // For security, don't reveal if email exists
    if (!user) {
      return res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as ResetPasswordRequest;
    if (!token || !newPassword) return res.status(400).json({ error: 'Missing token or password' });

    const user = await prisma.user.findUnique({
      where: { resetToken: token }
    });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      }
    });

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
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
    isVerified: user.isVerified,
  };

  res.status(200).json(response);
}
