FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 创建downloads目录
RUN mkdir -p downloads

# 暴露3000端口
EXPOSE 3000

# 启动应用
CMD ["node", "index.js"]