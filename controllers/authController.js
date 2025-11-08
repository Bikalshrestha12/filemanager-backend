// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET || '2a12f339242c4daf1ddba4a54a1bb25b', {
//     expiresIn: '30d',
//   });
// };

// exports.register = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ username });
//     if (userExists) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({
//       username,
//       password,
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         username: user.username,
//         token: generateToken(user._id),
//       });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Check for user
//     const user = await User.findOne({ username });

//     if (user && (await user.correctPassword(password, user.password))) {
//       res.json({
//         _id: user._id,
//         username: user.username,
//         token: generateToken(user._id),
//       });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };



const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ---------------------------------------------
// Helper to generate JWT token
// ---------------------------------------------
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined');
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// ---------------------------------------------
// @route   POST /api/auth/register
// @desc    Register new user
// ---------------------------------------------
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: 'user',
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ---------------------------------------------
// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// ---------------------------------------------
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ---------------------------------------------
// @route   GET /api/auth/me
// @desc    Get current logged-in user
// ---------------------------------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
};
