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