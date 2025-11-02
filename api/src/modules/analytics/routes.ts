import { Router } from 'express';
import { z } from 'zod';
import { verifyToken } from '../../shared/auth.js';
import { Event } from './model.js';

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/track', requireAuth, async (req: any, res) => {
  const schema = z.object({ docId: z.string(), type: z.enum(['open', 'page_focus', 'page_blur']), page: z.number().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { docId, type, page } = parsed.data;
  await Event.create({ userId: req.user.userId, docId, type, page });
  res.json({ ok: true });
});

router.get('/summary/:docId', requireAuth, async (req, res) => {
  const { docId } = req.params as any;
  const agg = await Event.aggregate([
    { $match: { docId: new (require('mongoose').Types.ObjectId)(docId) } },
    { $group: { _id: { type: '$type', page: '$page' }, count: { $sum: 1 } } },
  ]);
  res.json({ agg });
});

export default router;