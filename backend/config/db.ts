import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    
    mongoose.connection.on('error', (err) => {
      console.warn('[AI Studio] MongoDB connection error:', err?.message || err);
    });

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('[AI Studio] MONGO_URI not provided. App running in offline database mode.');
      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('[AI Studio] DB connected successfully!');
  } catch (error: any) {
    console.warn('[AI Studio] MongoDB connection failed (running in offline mode):', error?.message || error);
  }
};
