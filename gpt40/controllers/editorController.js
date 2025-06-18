const axios = require('axios');

// Helper to fetch a node by node_id
async function fetchNodeById(username, apiKey, node_id) {
  const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${username}/node/${node_id}`;
  const headers = { Authorization: `bearer ${apiKey}` };
  const res = await axios.get(url, { headers });
  return res.data.node;
}

// Helper to update node lock
async function updateNodeLock(username, apiKey, node_id, lock) {
  const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${username}/node/${node_id}`;
  const headers = { Authorization: `bearer ${apiKey}` };
  await axios.patch(url, { lock }, { headers });
}

// Helper to check lock status (mock, as API may not support locks)
async function getLockStatus(node_id) {
  // TODO: Replace with real API call if available
  return { locked: false, lockedBy: null };
}

// Placeholder for editor controller
exports.getEditor = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  let error = null;
  let node = null;
  let lock = { locked: false, lockedBy: null };
  try {
    node = await fetchNodeById(user.username, process.env.BDPA_API_KEY, node_id);
    if (node.type !== 'file') throw new Error('Not a file node');
    if (node.lock && node.lock.user && node.lock.client && Date.now() - node.lock.createdAt < 2 * 60 * 1000) {
      lock = { locked: true, lockedBy: node.lock.user, clientId: node.lock.client };
    }
  } catch (err) {
    error = err.message || 'Failed to load file.';
  }
  res.render('editor', {
    user,
    node,
    error,
    lock,
    success: req.query.success || null
  });
};

exports.saveFile = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  const { text } = req.body;
  try {
    const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/node/${node_id}`;
    const headers = { Authorization: `bearer ${process.env.BDPA_API_KEY}` };
    await axios.patch(url, { text: text.slice(0, 10240) }, { headers });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Save failed' });
  }
};

exports.updateTags = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 5) : [];
  try {
    const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/node/${node_id}`;
    const headers = { Authorization: `bearer ${process.env.BDPA_API_KEY}` };
    await axios.patch(url, { tags }, { headers });
    res.redirect(`/editor/${node_id}?success=Tags updated successfully`);
  } catch (err) {
    res.redirect(`/editor/${node_id}?error=${encodeURIComponent(err.message || 'Tag update failed')}`);
  }
};

exports.renameFile = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  const { new_name } = req.body;
  try {
    const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/node/${node_id}`;
    const headers = { Authorization: `bearer ${process.env.BDPA_API_KEY}` };
    await axios.patch(url, { name: new_name }, { headers });
    res.redirect(`/editor/${node_id}?success=File renamed successfully`);
  } catch (err) {
    res.redirect(`/editor/${node_id}?error=${encodeURIComponent(err.message || 'Rename failed')}`);
  }
};

exports.deleteFile = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  try {
    const url = `https://drive.api.hscc.bdpa.org/v1/filesystem/${user.username}/node/${node_id}`;
    const headers = { Authorization: `bearer ${process.env.BDPA_API_KEY}` };
    await axios.delete(url, { headers });
    res.redirect('/explorer?success=File deleted successfully');
  } catch (err) {
    res.redirect(`/editor/${node_id}?error=${encodeURIComponent(err.message || 'Delete failed')}`);
  }
};

// GET lock status
exports.lockStatus = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  try {
    const node = await fetchNodeById(user.username, process.env.BDPA_API_KEY, node_id);
    const lock = node.lock || null;
    let locked = false, lockedBy = null, clientId = null;
    if (lock && lock.user && lock.client) {
      // Lock is valid if not stale (2 min)
      if (Date.now() - lock.createdAt < 2 * 60 * 1000) {
        locked = true;
        lockedBy = lock.user;
        clientId = lock.client;
      }
    }
    res.json({ locked, lockedBy, clientId });
  } catch {
    res.json({ locked: false });
  }
};

// POST set lock
exports.setLock = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  const { clientId } = req.body;
  try {
    const lock = { user: user.username, client: clientId, createdAt: Date.now() };
    await updateNodeLock(user.username, process.env.BDPA_API_KEY, node_id, lock);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

// DELETE release lock
exports.releaseLock = async (req, res) => {
  const user = req.session.user;
  const node_id = req.params.node_id;
  try {
    await updateNodeLock(user.username, process.env.BDPA_API_KEY, node_id, null);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};
