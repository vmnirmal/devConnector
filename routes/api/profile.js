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

// @route  Delete api/profile/
// @desc   Get all profiles
// @access Public (if this service used any token validation then this is private access)

router.delete('/',auth, async(req,res) => {

    await Profile.findOneAndRemove({user:req.user.id});
    await User.findOneAndRemove({_id:req.user.id});
    res.json({msg:'user deleted successfully !'});

});

// @route  Put api/profile/
// @desc   Get all profiles
// @access private (if this service used any token validation then this is private access)

router.put('/',[auth,[
    check('title','Title is required').notEmpty(),
    check('company','company is required').notEmpty(),
    check('from','from date is required').notEmpty()
]], async(req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(401).json({errors:errors.array()});
    }

    const {
        title,
        company,
        from,
        location,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        from,
        to,
        current,
        description,
        location
    }

    try {
        const profile = await Profile.findOne({user:req.user.id});
        console.log(profile); 
        if(!profile){
            return res.status(401).json({msg:'No profile found'});
        }
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('server error !');
    }

});

// @route  Put api/profile/
// @desc   Get all profiles
// @access Public (if this service used any token validation then this is private access)

router.delete('/experience/:exp_id',auth,async(req,res)=>{
try {

    const profile = await Profile.findOne({user: req.user.id});
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex,1)
    await profile.save();
    //let profile = await Profile.findOneAndRemove({experience:req.params.exp_id});
    res.json(profile);
} catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error');
}
    
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
      auth,
      [
        check('school', 'School is required')
          .not()
          .isEmpty(),
        check('degree', 'Degree is required')
          .not()
          .isEmpty(),
        check('fieldofstudy', 'Field of study is required')
          .not()
          .isEmpty(),
        check('from', 'From date is required')
          .not()
          .isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/profile/education/:edu_id
  // @desc     Delete education from profile
  // @access   Private
  //router.delete('/education/:edu_id', auth, async (req, res) => {
  //try {
  //const profile = await Profile.findOne({ user: req.user.id });
  
  // Get remove index
  //const removeIndex = profile.education
  //.map(item => item.id)
  //.indexOf(req.params.edu_id);
  /*
      profile.education.splice(removeIndex, 1);
  
      await profile.save();
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  */
  
  router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
      const eduIds = foundProfile.education.map(edu => edu._id.toString());
      // if i dont add .toString() it returns this weird mongoose coreArray and the ids are somehow objects and it still deletes anyway even if you put /education/5
      const removeIndex = eduIds.indexOf(req.params.edu_id);
      if (removeIndex === -1) {
        return res.status(500).json({ msg: 'Server error' });
      } else {
        // theses console logs helped me figure it out
        /*   console.log("eduIds", eduIds);
        console.log("typeof eduIds", typeof eduIds);
        console.log("req.params", req.params);
        console.log("removed", eduIds.indexOf(req.params.edu_id));
   */ foundProfile.education.splice(
          removeIndex,
          1
        );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });
  // @route    GET api/profile/github/:username
  // @desc     Get user repos from Github
  // @access   Public
  router.get('/github/:username', (req, res) => {
    try {
      const options = {
        uri: encodeURI(
          `https://api.github.com/users/${
            req.params.username
          }/repos?per_page=5&sort=created:asc&client_id=${config.get(
            'githubClientId'
          )}&client_secret=${config.get('githubSecret')}`
        ),
        method: 'GET',
        headers: { 'user-agent': 'node.js' }
      };
  
      request(options, (error, response, body) => {
        if (error) console.error(error);
  
        if (response.statusCode !== 200) {
          return res.status(404).json({ msg: 'No Github profile found' });
        }
  
        res.json(JSON.parse(body));
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
module.exports =router;