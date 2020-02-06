const express = require('express');
const router = express.Router();

// @route  GET api/profile
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/',(req,res) => res.send('Profile Route'));
module.exports =router;