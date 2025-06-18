const express = require('express');
const router = express.Router();
const editorController = require('../controllers/editorController');
const { ensureAuthed } = require('../middleware/authMiddleware');

router.use(ensureAuthed);

// GET /editor/:node_id
router.get('/:node_id', editorController.getEditor);

// POST /editor/:node_id/save
router.post('/:node_id/save', editorController.saveFile);

// POST /editor/:node_id/tags
router.post('/:node_id/tags', editorController.updateTags);

// POST /editor/:node_id/rename
router.post('/:node_id/rename', editorController.renameFile);

// POST /editor/:node_id/delete
router.post('/:node_id/delete', editorController.deleteFile);

module.exports = router;
