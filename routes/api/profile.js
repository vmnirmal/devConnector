const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult}=require('express-validator/check')

// @route  GET api/profile/me
// @desc   Test route
// @access Public (if this service used any token validation then this is private access)
router.get('/me',auth, async(req,res) => {
    
    const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
    if(!profile){
        return res.status(401).json({errors:[{msg:'No profile found !'}]});
    }
    res.json(profile);
});

// @route  Post api/profile/me
// @desc   created profile 
// @access private (if this service used any token validation then this is private access)
router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').notEmpty()
]],async(req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()});
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedIn
    } = req.body;

    // Build profile Object
    const profileFields= {};
    profileFields.user=req.user.id;
    if(company) profileFields.company=company;
    if(website) profileFields.website=website;
    if(location) profileFields.location=location;
    if(bio) profileFields.bio=bio;
    if(status) profileFields.status=status;
    if(githubusername) profileFields.githubusername=githubusername;
    if(skills){
        profileFields.skills =skills.split(',').map(skill=> skill.trim());
    }
    profileFields.social={};
    if(youtube) profileFields.social.youtube=youtube;
    if(twitter) profileFields.social.twitter=twitter;
    if(linkedIn) profileFields.social.linkedIn=linkedIn;
    if(instagram) profileFields.social.instagram=instagram;

    try {
        let profile = await Profile.findOne({user:req.user.id});
        if(profile){
            console.log("update");
            //update
            profile = await Profile.findOneAndUpdate({user:req.user.id}, {$set:profileFields},{new:true});
            return res.json(profile);
        }
        console.log("create");
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    }catch(err){
        console.error(err);
        res.status(500).send('server error');
    }
});

// @route  GET api/profile/
// @desc   Get all profiles
// @access Public (if this service used any token validation then this is private access)
router.get('/',async(req,res)=>{

    try {
        let profile = await Profile.find().populate('user',['name','avatar']);
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('server error');
    }
    
});

// @route  GET api/profile/user:user_id
// @desc   Get all profiles
// @access Public (if this service used any token validation then this is private access)
router.get('/user/:user_id',async(req,res)=>{

    try {
        let profile = await Profile.findOne({user:req.params.user_id}) .populate('user',['name','avatar']);
        if(!profile){
            return res.status(401).json({msg:'No profile found for the particular user !'});
        }
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        if(error.kind == 'ObjectId'){
            return res.status(401).json({msg:'No profile found for the particular user !'});
        }
        return res.status(500).send('server error');
    }
    
});
module.exports =router;