const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');

router.post('/:id/execute', actionController.executeAction);
router.post('/:id/approve', actionController.approveAction);
router.post('/:id/confirm-payment', actionController.confirmPayment);
router.post('/:id/stop', actionController.stopRecovery);

module.exports = router;
