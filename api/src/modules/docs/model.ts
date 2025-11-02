import mongoose from 'mongoose';

const docSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    size: { type: Number },
    contentType: { type: String },
    pages: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Doc = mongoose.model('Doc', docSchema);

const accessSchema = new mongoose.Schema(
  {
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doc', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
accessSchema.index({ docId: 1, userId: 1 }, { unique: true });
export const Access = mongoose.model('Access', accessSchema);
