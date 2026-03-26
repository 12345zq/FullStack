FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建生产版本
RUN npm run build

# 使用Nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物到Nginx的默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]