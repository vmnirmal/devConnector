const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult}=require('express-validator/check')
// @route  GET api/auth
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/',auth,async(req,res) => {
    try{
      const user =  await User.findById(req.user.id).select('-password'); // req.user.id // getting the user id ,
                                                        // already setted in middleware auth.js 
      
        console.log(req.user);
        res.json(user);

    } catch(err){
        res.status(500).send('server error');
    }
});



router.post('/login',[
    check("email", "Please enter valid email Id").isEmail(),
    check("password","Password is required").not().isEmpty()
],async (req,res) => {
const errors= validationResult(req);
if(!errors.isEmpty()){
    console.error("error "+errors)
       return res.status(400).json({errors : errors.array()});
}

const {email,password}=req.body;
try{
let user = await User.findOne({email});
console.log(user)
if(!user){
    return res.status(400).json({errors:[{msg:"Invalid username !"}]});
}

const isMatch = await bcrypt.compare(password,user.password);
if(!isMatch){
    return res.status(401).json({errors:[{msg:'Invalid password'}]});
}
const payload = {
   user :{
    id:user.id
   } 
};
jwt.sign(payload,config.get('privateKey'),{expiresIn:300000},
(err,token) =>{
    if(err) throw err;
    res.json({token:{token}});
});

//res.send('User Created ...')
} catch(err){
    return res.status(500).json({errors:[{msg:"server error"}]});
}
});
module.exports =router;