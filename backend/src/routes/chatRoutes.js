const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chat', chatController.chat);
router.get('/reset', chatController.reset);

module.exports = router;
