const express = require('express');
const authorization = require('../controllers/authorization');
const router = express.Router();

router.route('/').post(authorization.login);

module.exports = router;

