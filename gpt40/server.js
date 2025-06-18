require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
const authRoutes = require('./routes/auth');
const explorerRoutes = require('./routes/explorer');
const editorRoutes = require('./routes/editor');
const dashboardRoutes = require('./routes/dashboard');

app.use('/', authRoutes);
app.use('/explorer', explorerRoutes);
app.use('/editor', editorRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/js/vendor.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/js/vendor.js'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
