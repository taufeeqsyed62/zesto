const express = require('express');
const { verifyUser } = require('../controllers/auth');

const router = express.Router();

router.post('/verify', verifyUser);

module.exports = router;