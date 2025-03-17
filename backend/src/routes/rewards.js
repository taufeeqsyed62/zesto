const express = require('express');
const { createReward, getUserRewards } = require('../controllers/rewards'); // Add getUserRewards

const router = express.Router();

router.post('/create', createReward);
router.get('/', getUserRewards); // Add this line for GET /api/rewards

module.exports = router;