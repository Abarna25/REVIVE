const express = require('express');
const router = express.Router();
const casesController = require('../controllers/cases.controller');

router.get('/', casesController.getCases);
router.get('/:id', casesController.getCaseById);
router.post('/:id/analyze', casesController.analyzeCase);

module.exports = router;
