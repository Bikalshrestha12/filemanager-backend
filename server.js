// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // CORS
// const allowedOrigins = process.env.frontend_URL
//   ? process.env.frontend_URL.split(',')
//   : [];

// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log(`❌ CORS blocked request from: ${origin}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   credentials: true,
// }));

// // Middleware
// app.use(express.json());
// app.use(express.static('uploads'));

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/filemanager', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => console.log('✅ Connected to MongoDB'));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/files', require('./routes/files'));
// app.use('/api/folders', require('./routes/folders'));

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


// Load environment variables first
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// -------------------------------
// 🌐 CORS Configuration
// -------------------------------

// Support multiple frontend URLs (comma-separated in .env)
app.use(
  cors({
    origin: "https://officefilemanagement.netlify.app",
    credentials: true,
  })
);



// -------------------------------
// ⚙️ Middleware
// -------------------------------
app.use(express.json());
app.use(express.static('uploads'));

// -------------------------------
// 🧠 MongoDB Connection
// -------------------------------
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/filemanager';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// -------------------------------
// 🚏 Routes
// -------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/folders', require('./routes/folders'));

// -------------------------------
// 🚀 Start Server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));