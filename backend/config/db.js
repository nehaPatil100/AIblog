import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI .env file mein set karo');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET .env file mein set karo');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}
