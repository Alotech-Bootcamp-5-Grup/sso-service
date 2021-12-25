const express = require('express');
const authorization = require('../controllers/authorization');
const router = express.Router();

router.route('/').post(authorization.isAuthorized);
router.route('/token').get(authorization.isAccessTokenValid);

module.exports = router;
