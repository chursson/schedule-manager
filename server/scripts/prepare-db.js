// 确保数据库目录存在
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ 数据库目录已创建:', dataDir);
} else {
  console.log('✅ 数据库目录已存在:', dataDir);
}
