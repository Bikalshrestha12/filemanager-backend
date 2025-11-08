// const express = require('express');
// const { register, login, getMe } = require('../controllers/authController');
// const auth = require('../middleware/auth');

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// router.get('/me', auth, getMe);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', auth, getMe);

module.exports = router;
