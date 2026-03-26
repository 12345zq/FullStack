# 构建Docker镜像
docker build -t backend-main .

# 运行Docker容器，映射3000端口到主机的3000端口
docker run -d -p 3000:3000 --name backend-main backend-main

# 查看容器状态
docker ps