const express = require('express');
const router = express.Router();
const explorerController = require('../controllers/explorerController');
const { ensureAuthed } = require('../middleware/authMiddleware');

router.use(ensureAuthed);

// GET /explorer
router.get('/', explorerController.getExplorer);

// POST /explorer/create
router.post('/create', explorerController.createNode);

// POST /explorer/rename
router.post('/rename', explorerController.renameNode);

// POST /explorer/delete
router.post('/delete', explorerController.deleteNode);

// POST /explorer/move
router.post('/move', explorerController.moveNode);

// POST /explorer/tag
router.post('/tag', explorerController.tagNode);

// POST /explorer/owner
router.post('/owner', explorerController.ownerNode);

module.exports = router;
