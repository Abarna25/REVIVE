const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');

router.get('/', auditController.getAllAuditLogs);
router.get('/:id', auditController.getCaseAuditTrail);

module.exports = router;
