
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const handleNewUser = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.password || !req.body.email) return res.status(400).json({ "message": "Info Missing" })
    const [rows, fields] = await connection.query('SELECT 1 FROM users WHERE email = ?', [req.body.email])
    if (rows.length > 0) return res.status(409).json({ "message": "Email Address Exists." });
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        const [finalRows, finalFields] = await connection.query('INSERT INTO users SET ?', {email: req.body.email, password: hashedPassword})
        if(finalRows.affectedRows > 0){

            res.status(201).json({ 'message': "User Created Successfully" })
        }else{
            res.status(500).json({ 'message': "Something Went Wrong" })

        }
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const handleLogin = async(req, res) => {
    const cookies = req.cookies;
    let AccessToken
    if (cookies && cookies.jwt && req.body.fromRefresh) {
        AccessToken = cookies.jwt

        try {
            const decoded = jwt.verify(AccessToken, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).json({
                accessToken: AccessToken
            });
            return

        } catch(err) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }) //clear the cookies and prepare it for new one if the provided is valid

        }
        
    }
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if (!req.body.email || !req.body.password) return res.status(400).json({ "message": "Email and Password Required" })
    const [rows, fields] = await connection.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    if (!rows[0]) return res.status(400).json({ "message": "Email Doesn't Exists." })
    const pwdMatch = await bcrypt.compare(req.body.password, rows[0].password)
    if (!pwdMatch) return res.status(400).json({ "message": "Password Mismatch." })
    if (!rows[0].verified) return res.status(400).json({ "message": "You Are Not Verified Yet." })

    const accessToken = jwt.sign({ "email": rows[0].email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 }).json({
            accessToken,
        })
        // 
}

const handleVerify = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if (!req.body.email) return res.status(400).json({ "message": "Email Required" })
    const [rows, fields] = await connection.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    if (!rows[0]) return res.status(401).json({ "message": "Email Doesn't Exists." })
    if (rows[0].verified) return res.status(401).json({ "message": "Already Verified" })

    const [finalrow] = await connection.query('UPDATE users SET verified = 1 WHERE email = ?', [req.body.email])

    if(finalrow.affectedRows > 0){

        res.status(201).json({ 'message': "User Verified Successfully" })
    }else{
        res.status(500).json({ 'message': "Something Went Wrong" })
    }
}

module.exports = { handleNewUser, handleLogin, handleVerify }