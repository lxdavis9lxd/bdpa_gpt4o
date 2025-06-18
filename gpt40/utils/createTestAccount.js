require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const crypto = require('crypto');

async function createTestAccount() {
  const username = 'testuser' + Math.floor(Math.random() * 10000);
  const email = username + '@example.com';
  const password = 'TestPassword123!';

  // Generate salt and key using PBKDF2 (same as login/register logic)
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 64, 'sha512').toString('hex');

  try {
    const res = await axios.post('https://drive.api.hscc.bdpa.org/v1/users', {
      username,
      email,
      salt,
      key
    }, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}`, 'content-type': 'application/json' }
    });
    console.log('Test account created:', { username, email, password });
  } catch (err) {
    console.error('Failed to create test account:', err.response ? err.response.data : err.message);
  }
}

createTestAccount();
