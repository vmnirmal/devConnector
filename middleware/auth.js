const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){

    const token = req.header('x-auth-token');

    if(!token){
        return res.status(401).json({msg: 'No token found !'});
    }
    try {
        const decode = jwt.verify(token,config.get('privateKey'));
        req.user = decode.user; // setting the user object ( contains only id ) to request object
        next();
    } catch(err){
        res.status(402).json({msg: 'Invalid token'})
    }

};