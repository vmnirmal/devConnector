const express = require('express');
const router = express.Router();

// @route  GET api/auth
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/',(req,res) => res.send('Auth Route'));
module.exports =router;