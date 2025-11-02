import jwt from 'jsonwebtoken';
import { config } from './config.js';

export type JwtPayload = { userId: string; email: string };

export const signToken = (p: JwtPayload) =>
  jwt.sign(p, config.JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
  jwt.verify(token, config.JWT_SECRET) as JwtPayload;