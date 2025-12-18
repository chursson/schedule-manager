import { Sequelize } from 'sequelize';
import path from 'path';

// 创建SQLite数据库实例
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/schedule-manager.db'),
  logging: false, // 设为true可查看SQL日志
});

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite数据库连接成功');

    // 同步数据库表结构
    // 生产环境也需要同步以确保表存在
    await sequelize.sync({ alter: false });
    console.log('✅ 数据库表结构已同步');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default connectDB;
