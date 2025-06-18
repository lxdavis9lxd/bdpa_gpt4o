const axios = require('axios');
const crypto = require('crypto');

// Placeholder for authentication controller
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render('login', { error: 'Missing credentials', user: null });
  try {
    // 1. Get user salt
    const userRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/users/${username}`, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` }
    });
    const salt = userRes.data.user.salt;
    // 2. Derive key using PBKDF2 (Node.js crypto)
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512').toString('hex');
    // 3. Authenticate
    await axios.post(`https://drive.api.hscc.bdpa.org/v1/users/${username}/auth`, { key }, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}`, 'content-type': 'application/json' }
    });
    // 4. Store user in session
    req.session.user = { username };
    res.redirect('/explorer');
  } catch (err) {
    res.render('login', { error: 'Login failed', user: null });
  }
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.render('register', { error: 'Missing registration data' });
  try {
    // Generate salt and key using PBKDF2
    const salt = crypto.randomBytes(16).toString('hex');
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512').toString('hex');
    // Register user with API
    await axios.post('https://drive.api.hscc.bdpa.org/v1/users', {
      username,
      email,
      salt,
      key
    }, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}`, 'content-type': 'application/json' }
    });
    // Auto-login after registration
    req.session.user = { username };
    res.redirect('/explorer');
  } catch (err) {
    res.render('register', { error: 'Registration failed' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
