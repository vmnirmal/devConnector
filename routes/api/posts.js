const express = require('express');
const router = express.Router();

// @route  GET api/posts
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/',(req,res) => res.send('Posts Route'));
module.exports =router;