const express = require('express');
const router = express.Router();
const twinController = require('../controllers/twin.controller');

router.get('/:id/twin', twinController.getTwin);
router.post('/:id/simulate', twinController.simulateTwin);

module.exports = router;
