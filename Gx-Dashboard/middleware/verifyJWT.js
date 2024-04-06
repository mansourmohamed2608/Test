const jwt = require('jsonwebtoken');

const verifyJWt = (req, res, next) => {
    const cookies = req.cookies
    if(!cookies || !cookies.jwt) return res.sendStatus(401);
    
    jwt.verify(cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ 'message': 'Access Token Expired.' }); //invalid token
        req.email = decoded.email;
        next()
    })
}

module.exports = verifyJWt