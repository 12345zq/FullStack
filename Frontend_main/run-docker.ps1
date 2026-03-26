# 构建Docker镜像
docker build -t frontend-main .

# 运行Docker容器，映射80端口到主机的8080端口
docker run -d -p 8080:80 --name frontend-main frontend-main

# 查看容器状态
docker ps