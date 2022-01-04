const express = require('express');
const authorization = require('../controllers/authorization');
const router = express.Router();

// Eğer sso auth'un servisine route olarak sadece / bu şekilde bir post isteği atılırsa 
// isAuthorized servisimiz çalşır
router.route('/').post(authorization.isAuthorized);

// Eğer /token route'una bir get isteği atılırsa isAccessTokenValid servisimiz çalışır.
router.route('/token').get(authorization.isAccessTokenValid);

module.exports = router;
