import mongoose from 'mongoose';
import { config } from '../shared/config.js';
import { User } from '../modules/auth/model.js';
import bcrypt from 'bcrypt';

async function main() {
  await mongoose.connect(config.MONGO_URI);
  const email = 'demo@docroom.app';
  const exists = await User.findOne({ email });
  if (!exists) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const u = await User.create({ email, passwordHash, name: 'Demo User' });
    console.log('Created demo user:', email, 'password: password123', 'id:', u.id);
  } else {
    console.log('Demo user exists:', email);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});