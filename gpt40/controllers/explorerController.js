const axios = require('axios');

// Helper to get user nodes from API
async function fetchUserNodes(username, apiKey, sortBy = 'name') {
  const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${username}/search`;
  const headers = { Authorization: `bearer ${apiKey}` };
  const res = await axios.get(url, { headers });
  let nodes = res.data.nodes || [];
  // Sort nodes by sortBy
  nodes.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'createdAt') return a.createdAt - b.createdAt;
    if (sortBy === 'modifiedAt') return a.modifiedAt - b.modifiedAt;
    if (sortBy === 'size') return (a.size || 0) - (b.size || 0);
    return 0;
  });
  return nodes;
}

exports.getExplorer = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  // Always define error as null if not present
  const error = typeof req.query.error !== 'undefined' ? req.query.error : null;
  try {
    const nodes = await fetchUserNodes(user.username, process.env.BDPA_API_KEY, req.query.sortBy);
    res.render('explorer', { user, nodes, sortBy: req.query.sortBy || 'name', error });
  } catch (err) {
    res.render('explorer', { user, nodes: [], sortBy: req.query.sortBy || 'name', error: error || 'Failed to load files.' });
  }
};

exports.createNode = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  const { type, name, tags, text, target_id } = req.body;
  let payload = { type, name };
  if (type === 'file') {
    payload.text = text ? text.slice(0, 10240) : '';
    payload.tags = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5) : [];
  } else if (type === 'directory') {
    payload.contents = [];
  } else if (type === 'symlink') {
    payload.contents = target_id ? [target_id] : [];
  }
  try {
    await axios.post(`https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}`, payload, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}`, 'content-type': 'application/json' }
    });
    res.redirect('/explorer');
  } catch (err) {
    res.redirect('/explorer?error=Failed+to+create+node');
  }
};

exports.renameNode = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  const { node_id, new_name } = req.body;
  if (!node_id || !new_name) return res.redirect('/explorer?error=Missing+rename+data');
  try {
    await axios.put(`https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/${node_id}`, { name: new_name }, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}`, 'content-type': 'application/json' }
    });
    res.redirect('/explorer');
  } catch (err) {
    res.redirect('/explorer?error=Failed+to+rename+node');
  }
};

exports.deleteNode = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  const { node_id } = req.body;
  if (!node_id) return res.redirect('/explorer?error=Missing+delete+data');
  try {
    await axios.delete(`https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/${node_id}`, {
      headers: { Authorization: `bearer ${process.env.BDPA_API_KEY}` }
    });
    res.redirect('/explorer');
  } catch (err) {
    res.redirect('/explorer?error=Failed+to+delete+node');
  }
};

exports.moveNode = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  // ...implement move logic...
  res.redirect('/explorer');
};

exports.tagNode = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  // ...implement tag logic...
  res.redirect('/explorer');
};
