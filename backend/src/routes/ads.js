const express = require('express');
const { createAd, getActiveAds, getUserAds, updateAd, deleteAd, getAdDetail } = require('../controllers/ads');

const router = express.Router();

router.post('/create', createAd);
router.get('/active', getActiveAds);
router.get('/my-ads', getUserAds);
router.put('/update', updateAd);
router.delete('/delete', deleteAd);
router.get('/:adId', getAdDetail); // New endpoint

module.exports = router;