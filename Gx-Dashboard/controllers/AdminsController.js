
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const GetAdmins = async(req, res) => {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM users')
        res.status(200).json({'admins': rows})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const VerifyAdmin = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.adminid ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('UPDATE users SET verified = ? WHERE id = ?', [1, req.body.adminid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Verified Successfully."})
        }else {
            res.status(200).json({'message': "Admin Doesn't Verified."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const RemoveAdmin = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.adminid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('UPDATE users SET verified = ? WHERE id = ?', [0, req.body.adminid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "Admin Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { GetAdmins, VerifyAdmin, RemoveAdmin }