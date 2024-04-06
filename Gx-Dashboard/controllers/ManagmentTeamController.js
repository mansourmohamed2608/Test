
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const GetTeam = async(req, res) => {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM `managment-team`')
        rows.forEach((row) => {
            row.links = JSON.parse(row.links)
        })
        res.status(200).json({'members': rows})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const AddMember = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.username || !req.body.img || !req.body.links || !req.body.position ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('INSERT INTO `managment-team` SET ?', {username: req.body.username, image: req.body.img, position: req.body.position, links: req.body.links})
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Inserted Successfully."})
        }else {
            res.status(200).json({'message': "Member Doesn't Inserted."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const ModifyMember = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.memid || !req.body.username || !req.body.img || !req.body.links || !req.body.position ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('UPDATE `managment-team` SET username = ?, position = ?, image = ?, links = ? WHERE id = ?', [req.body.username, req.body.position, req.body.img, req.body.links, req.body.memid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Updated Successfully."})
        }else {
            res.status(200).json({'message': "Memeber Doesn't Updated."})
        }
    } catch (err) { 
        console.log(err)
        res.status(500).json({ 'message': err.message })
    }
}

const RemoveMember = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.memid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('DELETE FROM `managment-team` WHERE id = ?', [req.body.memid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "Member Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { GetTeam, AddMember, RemoveMember, ModifyMember }