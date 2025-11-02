import { Router } from 'express';
import { z } from 'zod';
import { s3 } from '../../shared/s3.js';
import { config } from '../../shared/config.js';
import { verifyToken } from '../../shared/auth.js';
import { Doc, Access } from './model.js';

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

async function canRead(userId: string, docId: string) {
  const doc = await Doc.findById(docId).select('_id ownerId');
  if (!doc) return false;
  if (String(doc.ownerId) === String(userId)) return true;
  const acc = await Access.findOne({ docId: docId, userId });
  return !!acc;
}

router.get('/', requireAuth, async (req: any, res) => {
  const userId = req.user.userId;
  const accessDocs = await Access.find({ userId }).select('docId');
  const ids = accessDocs.map((a) => a.docId);
  const docs = await Doc.find({ $or: [{ ownerId: userId }, { _id: { $in: ids } }] }).sort({ createdAt: -1 });
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

// Signed GET for viewing by docId (enforces access)
router.get('/view-url/:docId', requireAuth, async (req: any, res) => {
  const docId = req.params.docId as string;
  if (!(await canRead(req.user.userId, docId))) return res.status(403).json({ message: 'Forbidden' });
  const doc = await Doc.findById(docId);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const url = await s3.getSignedUrlPromise('getObject', {
    Bucket: config.S3_BUCKET!,
    Key: doc.key,
    Expires: 300,
  });
  res.json({ url });
});

// Access management (owner only)
const accessSchemaZ = z.object({ email: z.string().email(), role: z.enum(['viewer', 'editor']).default('viewer') });
router.post('/:docId/access', requireAuth, async (req: any, res) => {
  const { docId } = req.params as any;
  const doc = await Doc.findById(docId);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (String(doc.ownerId) !== String(req.user.userId)) return res.status(403).json({ message: 'Only owner can share' });
  const parsed = accessSchemaZ.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, role } = parsed.data;
  const { User } = await import('../auth/model.js');
  const u = await User.findOne({ email });
  if (!u) return res.status(404).json({ message: 'User not found' });
  await Access.updateOne({ docId, userId: u.id }, { $set: { role, createdBy: req.user.userId } }, { upsert: true });
  res.json({ ok: true });
});

router.get('/:docId/access', requireAuth, async (req: any, res) => {
  const { docId } = req.params as any;
  const doc = await Doc.findById(docId);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (String(doc.ownerId) !== String(req.user.userId)) return res.status(403).json({ message: 'Only owner can view access' });
  const access = await Access.find({ docId }).populate('userId', 'email name');
  res.json({ access });
});

export default router;
