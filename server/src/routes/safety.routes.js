const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');

router.get('/:id/safety-checks', safetyController.getSafetyChecks);
router.get('/policy', safetyController.getPolicy);
router.put('/policy', safetyController.updatePolicy);

module.exports = router;
