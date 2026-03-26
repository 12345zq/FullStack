const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3000;

// 配置CORS
app.use(cors());

// 静态文件服务，用于文件下载
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// 确保downloads目录存在
const fs = require('fs');
if (!fs.existsSync('./downloads')) {
  fs.mkdirSync('./downloads');
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './downloads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// /getList API
app.get('/getList', (req, res) => {
  const type = req.query.type || 'default';
  
  // 生成不同类型的列表数据
  const list = [];
  
  // 根据type参数生成不同的列表
  for (let i = 1; i <= 5; i++) {
    list.push({
      id: i,
      name: `Item ${i}`,
      type: type,
      value: Math.random() * 100,
      isActive: i % 2 === 0,
      imageUrl: `https://picsum.photos/200/300?random=${i}`, // 在线图片URL
      description: `This is item ${i} of type ${type}`,
      createdAt: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    type: type,
    data: list
  });
});

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      downloadUrl: `http://localhost:3000/downloads/${req.file.filename}`
    }
  });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});