
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const GetAcheivments = async(req, res) => {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM `acheivments`')
        res.status(200).json({'acheivments': rows || []})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const AddAcheivment = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.game || !req.body.position || !req.body.date || !req.body.tourname ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('INSERT INTO `acheivments` SET ?', {game: req.body.game, position: req.body.position, date: req.body.date, tourname: req.body.tourname})
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Inserted Successfully."})
        }else {
            res.status(200).json({'message': "Acheivment Doesn't Inserted."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const ModifyAcheivment = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.game || !req.body.position || !req.body.date || !req.body.tourname ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('UPDATE `acheivments` SET game = ?, position = ?, tourname = ?, date = ? WHERE id = ?', [req.body.game, req.body.position, req.body.tourname, req.body.date, req.body.acheivid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Updated Successfully."})
        }else {
            res.status(200).json({'message': "Acheivment Doesn't Updated."})
        }
    } catch (err) { 
        console.log(err)
        res.status(500).json({ 'message': err.message })
    }
}

const RemoveAcheivment = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.acheivid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('DELETE FROM `acheivments` WHERE id = ?', [req.body.acheivid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "Acheivment Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { GetAcheivments, AddAcheivment, RemoveAcheivment, ModifyAcheivment }