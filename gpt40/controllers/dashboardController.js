const axios = require('axios');

// Placeholder for dashboard controller
exports.getDashboard = async (req, res) => {
  const user = req.session.user;
  let error = null;
  let userInfo = null;
  let usage = null;
  try {
    // Fetch user info
    const userRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/users/${user.username}`, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` }
    });
    userInfo = userRes.data.user;
    // Fetch storage usage
    const usageRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/usage`, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` }
    });
    usage = usageRes.data;
  } catch (err) {
    error = err.message || 'Failed to load dashboard info.';
  }
  res.render('dashboard', {
    user,
    userInfo,
    usage,
    error,
    success: req.query.success || null
  });
};

exports.updateEmail = async (req, res) => {
  const user = req.session.user;
  const { email } = req.body;
  try {
    await axios.patch(`https://drive.api.hscc.bdpa.org/v1/users/${user.username}`,
      { email },
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } }
    );
    res.redirect('/dashboard?success=Email updated successfully');
  } catch (err) {
    res.redirect(`/dashboard?error=${encodeURIComponent(err.message || 'Email update failed')}`);
  }
};

exports.updatePassword = async (req, res) => {
  const user = req.session.user;
  const { password } = req.body;
  const crypto = require('crypto');
  try {
    // Fetch salt
    const userRes = await axios.get(`https://drive.api.hscc.bdpa.org/v1/users/${user.username}`,
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } });
    const salt = userRes.data.user.salt;
    const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512').toString('hex');
    await axios.patch(`https://drive.api.hscc.bdpa.org/v1/users/${user.username}`,
      { key },
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } }
    );
    res.redirect('/dashboard?success=Password updated successfully');
  } catch (err) {
    res.redirect(`/dashboard?error=${encodeURIComponent(err.message || 'Password update failed')}`);
  }
};

exports.deleteAccount = async (req, res) => {
  const user = req.session.user;
  try {
    await axios.delete(`https://drive.api.hscc.bdpa.org/v1/users/${user.username}`,
      { headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` } });
    req.session.destroy(() => {
      res.redirect('/register');
    });
  } catch (err) {
    res.redirect(`/dashboard?error=${encodeURIComponent(err.message || 'Account deletion failed')}`);
  }
};
