import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doc', index: true },
    type: { type: String, enum: ['open', 'page_focus', 'page_blur'], index: true },
    page: { type: Number },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);