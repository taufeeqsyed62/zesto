const express = require('express');
const {
  sendChatRequest,
  updateChatRequest,
  getUserRequests,
} = require('../controllers/chat');

const router = express.Router();

router.post('/request', sendChatRequest);
router.put('/request/update', updateChatRequest);
router.get('/requests', getUserRequests);

module.exports = router;