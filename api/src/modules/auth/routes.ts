import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from './model.js';
import { signToken, verifyToken } from '../../shared/auth.js';

const router = Router();

const credSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });

router.post('/register', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password, name } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });
  const token = signToken({ userId: user.id, email });
  res.json({ token, user: { id: user.id, email, name: user.name } });
});

router.post('/login', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ userId: user.id, email });
  res.json({ token, user: { id: user.id, email, name: user.name } });
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'Missing token' });
  try {
    const p = verifyToken(auth);
    const user = await User.findById(p.userId).select('email name');
    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;