const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { ensureAuthed } = require('../middleware/authMiddleware');

router.use(ensureAuthed);

// GET /dashboard
router.get('/', dashboardController.getDashboard);

// POST /dashboard/email
router.post('/email', dashboardController.updateEmail);

// POST /dashboard/password
router.post('/password', dashboardController.updatePassword);

// POST /dashboard/delete
router.post('/delete', dashboardController.deleteAccount);

module.exports = router;
