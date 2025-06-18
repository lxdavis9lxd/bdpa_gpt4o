const express = require('express');
const router = express.Router();

// GET / (redirect to login)
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/explorer');
  }
  res.redirect('/login');
});

// GET /login (Login view)
router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/explorer');
  }
  res.render('login', { user: req.session.user });
});

// GET /register (Register view)
router.get('/register', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/explorer');
  }
  res.render('register', { user: req.session.user });
});

// POST /login
router.post('/login', require('../controllers/authController').login);

// POST /register
router.post('/register', require('../controllers/authController').register);

// GET /logout
router.get('/logout', require('../controllers/authController').logout);

module.exports = router;
