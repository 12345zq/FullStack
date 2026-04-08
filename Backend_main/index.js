const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

// 解析JSON请求体
app.use(express.json());

// MySQL连接配置（暂时不指定数据库）
const db = mysql.createConnection({
  host: 'host.docker.internal', 
  user: 'root',
  password: 'Jackie12345'
});



// JWT密钥
const jwtSecret = 'your-secret-key';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1h' });
};

// 验证JWT令牌
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

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

// /getModelList API
app.get('/getModelList', (req, res) => {
  const modelList = [
    { label: '海狸', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-beaver.glb' },
    { label: '蜜蜂', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-bee.glb' },
    { label: '兔子', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-bunny.glb' },
    { label: '猫', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-cat.glb' },
    { label: '狗', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-dog.glb' },
    { label: '熊猫', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-panda.glb' },
    { label: '老虎', value: '/models/kenney_cube-pets_1.0/Models/GLB format/animal-tiger.glb' }
  ];
  
  res.json({
    success: true,
    data: modelList
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

// 检查MySQL连接状态
let mysqlConnected = false;

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.log('Continuing without MySQL connection. User authentication features will be disabled.');
    mysqlConnected = false;
  } else {
    console.log('Connected to MySQL');
    mysqlConnected = true;
    
    // 创建数据库
    db.query('CREATE DATABASE IF NOT EXISTS test', (err) => {
      if (err) {
        console.error('Error creating database:', err);
        console.log('Continuing without MySQL database. User authentication features will be disabled.');
        mysqlConnected = false;
      } else {
        console.log('Database created or already exists');
        
        // 切换到test数据库
        db.changeUser({ database: 'test' }, (err) => {
          if (err) {
            console.error('Error changing database:', err);
            console.log('Continuing without MySQL database. User authentication features will be disabled.');
            mysqlConnected = false;
          } else {
            console.log('Switched to test database');
            
            // 创建用户表
            const createUserTable = `
              CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `;
            
            db.query(createUserTable, (err) => {
              if (err) {
                console.error('Error creating user table:', err);
                console.log('Continuing without user table. User authentication features will be disabled.');
                mysqlConnected = false;
              } else {
                console.log('User table created or already exists');
              }
            });
          }
        });
      }
    });
  }
});

// 用户注册接口
app.post('/register', async (req, res) => {
  if (!mysqlConnected) {
    return res.status(503).json({ success: false, message: 'MySQL connection is not available. User authentication features are disabled.' });
  }
  
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  try {
    // 检查用户名是否已存在
    const checkUsername = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUsername, [username], async (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
      
      // 检查邮箱是否已存在
      const checkEmail = 'SELECT * FROM users WHERE email = ?';
      db.query(checkEmail, [email], async (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (results.length > 0) {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 插入新用户
        const insertUser = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(insertUser, [username, email, hashedPassword], (err, results) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          
          // 生成JWT令牌
          const token = generateToken(results.insertId);
          
          res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
              id: results.insertId,
              username,
              email
            }
          });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 用户登录接口
app.post('/login', async (req, res) => {
  if (!mysqlConnected) {
    return res.status(503).json({ success: false, message: 'MySQL connection is not available. User authentication features are disabled.' });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  try {
    // 查找用户
    const findUser = 'SELECT * FROM users WHERE email = ?';
    db.query(findUser, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      const user = results[0];
      
      // 验证密码
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      
      // 生成JWT令牌
      const token = generateToken(user.id);
      
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取用户信息接口
app.get('/user', verifyToken, (req, res) => {
  if (!mysqlConnected) {
    return res.status(503).json({ success: false, message: 'MySQL connection is not available. User authentication features are disabled.' });
  }
  
  const userId = req.userId;
  
  try {
    // 查找用户
    const findUser = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    db.query(findUser, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({
        success: true,
        user: results[0]
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket 服务
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // 定期发送服务器时间
  const interval = setInterval(() => {
    const now = new Date().toISOString();
    ws.send(JSON.stringify({ time: now }));
  }, 1000);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clearInterval(interval);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}`);
});