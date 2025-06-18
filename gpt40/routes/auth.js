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

// GET /forgot (Password recovery view)
router.get('/forgot', (req, res) => {
  res.render('forgot', { user: req.session.user });
});
// POST /forgot (Send recovery email)
router.post('/forgot', require('../controllers/authController').forgot);
// GET /reset (Password reset form)
router.get('/reset', require('../controllers/authController').resetForm);
// POST /reset (Handle password reset)
router.post('/reset', require('../controllers/authController').reset);

module.exports = router;
