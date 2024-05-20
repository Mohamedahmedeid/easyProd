/* eslint-disable no-undef */
const express = require('express');
const path = require('path');
const connectDB = require('./src/config/db');
const app = express();
require('dotenv').config();
const port = process.env.PORT;
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const cors = require('cors');
const authenticateUser = require('./src/middleware/authMiddleware');

app.use( express.static(path.join(__dirname, 'src/public')));
app.use( express.static(path.join(__dirname, 'src/uploads')));

// Apply middleware
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed
// app.use(cors());
const corsOptions = {
  origin: 'https://instq8.art/', // Allow requests from this specific origin
  methods: ['GET'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these request headers
};

app.use(cors(corsOptions)); 
// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets', 'login.html'));
});

app.get('/adminDashboard', authenticateUser.authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets', 'adminDashboard.html'));
});

app.get('/admin', authenticateUser.authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets', 'admin.html'));
});

app.get('/home', authenticateUser.authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets', 'home.html'));
});

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Start the server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });
