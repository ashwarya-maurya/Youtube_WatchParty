const experss = require('express');
const healthController = require('../controller/health.controller');

const router = experss.Router();


router.get('/health', healthController.getHealth);

module.exports = router;