const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/dashboard', analyticsController.getDashboardMetrics);
router.get('/batch-performance', analyticsController.getBatchPerformance);
router.post('/reset-seed', analyticsController.resetSeedData);

module.exports = router;
