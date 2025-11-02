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
  const schema = z.object({
    docId: z.string(),
    type: z.enum(['open', 'page_focus', 'page_blur', 'heartbeat']),
    page: z.number().optional(),
    sessionId: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { docId, type, page, sessionId } = parsed.data;
  await Event.create({ userId: req.user.userId, docId, type, page, sessionId });
  res.json({ ok: true });
});

router.get('/summary/:docId', requireAuth, async (req, res) => {
  const { docId } = req.params as any;
  const ObjectId = require('mongoose').Types.ObjectId;
  const [counts, heartbeats] = await Promise.all([
    Event.aggregate([
      { $match: { docId: new ObjectId(docId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Event.countDocuments({ docId: new ObjectId(docId), type: 'heartbeat' }),
  ]);
  const byType: Record<string, number> = Object.fromEntries(counts.map((c: any) => [c._id, c.count]));
  const dwellSeconds = heartbeats * 10; // assuming 10s heartbeat
  res.json({ opens: byType['open'] || 0, heartbeats, dwellSeconds });
});

export default router;