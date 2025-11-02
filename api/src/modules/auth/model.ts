import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['owner', 'admin', 'viewer'], default: 'owner' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);