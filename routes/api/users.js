const express = require('express');
const router = express.Router();
const {check, validationResult}=require('express-validator/check')
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// @route  GET api/users
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/',(req,res) => res.send('User Route'));

router.post('/create',[
    check("name","Name is required").notEmpty(),
    check("email", "Please enter valid email Id").isEmail(),
    check("password","Password is required").not().isEmpty()
],async (req,res) => {
const errors= validationResult(req);
if(!errors.isEmpty()){
    console.error("error "+errors)
       return res.status(400).json({errors : errors.array()});
}

const {name,email,password}=req.body;
try{
let user = await User.findOne({email});
console.log(user)
if(user){
    return res.status(400).json({errors:[{msg:"user already exist"}]});
}

const avatar = gravatar.url(email,{
    s:'200',//size
    r:'pg', //radius
    d:'mm' //default
});
user =new User({
    name,
    email,
    avatar,
    password
})
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password,salt);
await user.save();
console.log("request body "+user);
res.send('User Created ...')
} catch(err){
    return res.status(500).json({errors:[{msg:"server error"}]});
}
});
module.exports =router;