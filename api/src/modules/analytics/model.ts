import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doc', index: true },
    type: { type: String, enum: ['open', 'page_focus', 'page_blur', 'heartbeat'], index: true },
    page: { type: Number },
    sessionId: { type: String, index: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
