const db = require('../repositories/database');

async function getCaseAuditTrail(req, res) {
  try {
    const logs = await db.getAuditLogs(req.params.id);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

async function getAllAuditLogs(req, res) {
  try {
    const logs = await db.getAuditLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: err.message } });
  }
}

module.exports = {
  getCaseAuditTrail,
  getAllAuditLogs
};
