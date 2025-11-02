import { Router } from 'express';
import { z } from 'zod';
import { s3 } from '../../shared/s3.js';
import { config } from '../../shared/config.js';
import { verifyToken } from '../../shared/auth.js';
import { Doc } from './model.js';

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

router.get('/', requireAuth, async (req: any, res) => {
  const docs = await Doc.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ docs });
});

const presignSchema = z.object({
  name: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive().max(50 * 1024 * 1024),
});

router.post('/presign', requireAuth, async (req: any, res) => {
  const parsed = presignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { name, contentType } = parsed.data;
  const key = `${req.user.userId}/${Date.now()}_${name}`;
  const url = await s3.getSignedUrlPromise('putObject', {
    Bucket: config.S3_BUCKET!,
    Key: key,
    Expires: 300,
    ContentType: contentType,
  });
  res.json({ url, key });
});

const finalizeSchema = z.object({ key: z.string(), name: z.string(), size: z.number(), contentType: z.string() });
router.post('/finalize', requireAuth, async (req: any, res) => {
  const parsed = finalizeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { key, name, size, contentType } = parsed.data;
  const doc = await Doc.create({ ownerId: req.user.userId, key, name, size, contentType });
  res.json({ doc });
});

// Signed GET for viewing
router.get('/view-url/:key', requireAuth, async (req: any, res) => {
  const key = req.params.key as string;
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: config.S3_BUCKET!,
    Key: key,
    Expires: 300,
  });
  res.json({ url });
});

export default router;
