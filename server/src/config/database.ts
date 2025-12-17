import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schedule-manager';

    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB连接成功');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB连接错误:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB断开连接');
    });
  } catch (error) {
    console.error('❌ MongoDB初始化连接失败:', error);
    process.exit(1);
  }
};

export default connectDB;
