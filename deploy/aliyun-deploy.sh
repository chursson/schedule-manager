#!/bin/bash

# 阿里云一键部署脚本 - Schedule Manager
# 使用方法: bash deploy/aliyun-deploy.sh

echo "======================================"
echo "🚀 开始部署 Schedule Manager"
echo "======================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 root 用户运行此脚本${NC}"
  exit 1
fi

# 1. 更新系统
echo -e "${GREEN}[1/8] 更新系统...${NC}"
apt update && apt upgrade -y

# 2. 安装必要软件
echo -e "${GREEN}[2/8] 安装必要软件...${NC}"
apt install -y curl git vim ufw

# 3. 安装Docker
echo -e "${GREEN}[3/8] 安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker 安装成功${NC}"
else
    echo -e "${GREEN}✅ Docker 已安装${NC}"
fi

# 4. 安装Docker Compose
echo -e "${GREEN}[4/8] 安装 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose 安装成功${NC}"
else
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
fi

# 5. 克隆代码
echo -e "${GREEN}[5/8] 克隆代码...${NC}"
if [ ! -d "/opt/schedule-manager" ]; then
    cd /opt
    git clone https://github.com/chursson/schedule-manager.git
    cd schedule-manager
else
    echo -e "${GREEN}代码已存在，拉取最新版本...${NC}"
    cd /opt/schedule-manager
    git pull
fi

# 6. 配置环境变量
echo -e "${GREEN}[6/8] 配置环境变量...${NC}"
if [ ! -f "server/.env" ]; then
    cat > server/.env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -hex 32)
CLIENT_URL=http://$(curl -s ifconfig.me)
DATABASE_URL=./data/schedule-manager.db
EOF
    echo -e "${GREEN}✅ 环境变量已生成${NC}"
else
    echo -e "${GREEN}✅ 环境变量已存在${NC}"
fi

# 7. 构建并启动服务
echo -e "${GREEN}[7/8] 构建并启动服务...${NC}"
docker-compose -f deploy/docker-compose.yml up -d --build

# 8. 配置防火墙
echo -e "${GREEN}[8/8] 配置防火墙...${NC}"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
echo "y" | ufw enable

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "======================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "======================================"
echo ""
echo "📱 访问地址："
echo "   http://$SERVER_IP"
echo ""
echo "🔧 管理命令："
echo "   查看日志: docker-compose -f /opt/schedule-manager/deploy/docker-compose.yml logs -f"
echo "   重启服务: docker-compose -f /opt/schedule-manager/deploy/docker-compose.yml restart"
echo "   停止服务: docker-compose -f /opt/schedule-manager/deploy/docker-compose.yml down"
echo ""
echo "📝 下一步："
echo "   1. 绑定域名并配置DNS解析"
echo "   2. 配置HTTPS证书（使用 Let's Encrypt）"
echo ""
