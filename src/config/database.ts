import mongoose from 'mongoose';
import { env, isTest } from './env.js';

export async function connectDatabase(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  if (!isTest) {
    console.info(`[db] Connected to MongoDB`);
  }
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
