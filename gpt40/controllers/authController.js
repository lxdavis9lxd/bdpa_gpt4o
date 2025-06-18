const axios = require('axios');
const crypto = require('crypto');

// In-memory failed login tracking: { username: { count, lastFail } }
const failedLogins = {};
const LOCKOUT_TIME = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 3;

function getAttemptsLeft(username) {
  if (!failedLogins[username]) return MAX_ATTEMPTS;
  if (failedLogins[username].count >= MAX_ATTEMPTS) {
    const since = Date.now() - failedLogins[username].lastFail;
    if (since > LOCKOUT_TIME) {
      failedLogins[username] = { count: 0, lastFail: 0 };
      return MAX_ATTEMPTS;
    }
    return 0;
  }
  return MAX_ATTEMPTS - failedLogins[username].count;
}

// Placeholder for authentication controller
exports.login = async (req, res) => {
  const { username, password, remember } = req.body;
  if (!username || !password) return res.render('login', { error: 'Missing credentials', attemptsLeft: getAttemptsLeft(username), user: null });
  // Check lockout
  if (getAttemptsLeft(username) === 0) {
    return res.render('login', { error: 'Account locked for 1 hour after 3 failed attempts.', attemptsLeft: 0, user: null });
  }
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
    // 5. Remember me: set cookie maxAge if checked
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false;
    }
    // Reset failed attempts
    failedLogins[username] = { count: 0, lastFail: 0 };
    res.redirect('/explorer');
  } catch (err) {
    // Track failed attempts
    if (!failedLogins[username]) failedLogins[username] = { count: 0, lastFail: 0 };
    failedLogins[username].count++;
    failedLogins[username].lastFail = Date.now();
    const attemptsLeft = getAttemptsLeft(username);
    let errorMsg = 'Login failed';
    if (attemptsLeft === 0) errorMsg = 'Account locked for 1 hour after 3 failed attempts.';
    res.render('login', { error: errorMsg, attemptsLeft, user: null });
  }
};

exports.register = async (req, res) => {
  const { username, email, password, captcha } = req.body;
  // Validate required fields
  if (!username || !email || !password || !captcha) return res.render('register', { error: 'All fields required' });
  // Validate CAPTCHA
  if (captcha.trim() !== '4') return res.render('register', { error: 'CAPTCHA incorrect' });
  // Validate username
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return res.render('register', { error: 'Invalid username' });
  // Validate password strength
  if (password.length <= 10) return res.render('register', { error: 'Password too weak (must be >10 characters)' });
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
    let msg = 'Registration failed';
    if (err.response && err.response.data && err.response.data.error) {
      msg = err.response.data.error;
    }
    res.render('register', { error: msg });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// In-memory password reset tokens: { token: { username, expires } }
const resetTokens = {};
const cryptoRandom = () => crypto.randomBytes(16).toString('hex');

exports.forgot = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.render('forgot', { error: 'Email required' });
  try {
    // Find user by email
    const usersRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/users`, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` }
    });
    const user = usersRes.data.users.find(u => u.email === email);
    if (!user) return res.render('forgot', { error: 'No user with that email' });
    // Generate token
    const token = cryptoRandom();
    resetTokens[token] = { username: user.username, expires: Date.now() + 15 * 60 * 1000 };
    // Simulate email by logging link
    const link = `http://localhost:3000/reset?token=${token}`;
    console.log(`[SIMULATED EMAIL] To: ${email}\nSubject: BDPADrive Password Reset\nLink: ${link}`);
    res.render('forgot', { info: 'Recovery email sent (see server console for link)' });
  } catch (err) {
    res.render('forgot', { error: 'Error sending recovery email' });
  }
};

exports.resetForm = (req, res) => {
  const { token } = req.query;
  if (!token || !resetTokens[token] || resetTokens[token].expires < Date.now()) {
    return res.render('reset', { error: 'Invalid or expired token', token: '' });
  }
  res.render('reset', { token });
};

exports.reset = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !resetTokens[token] || resetTokens[token].expires < Date.now()) {
    return res.render('reset', { error: 'Invalid or expired token', token: '' });
  }
  if (!password || password.length <= 10) {
    return res.render('reset', { error: 'Password too weak (must be >10 characters)', token });
  }
  try {
    const username = resetTokens[token].username;
    // Get salt
    const userRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/users/${username}`,
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } });
    const salt = userRes.data.user.salt;
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512').toString('hex');
    await axios.patch(`https://drive.api.hscc.bdpa.org/v1/users/${username}`,
      { key },
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } }
    );
    delete resetTokens[token];
    res.render('reset', { error: null, token: '', info: 'Password reset! You may now log in.' });
  } catch (err) {
    res.render('reset', { error: 'Failed to reset password', token });
  }
};
