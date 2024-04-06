
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const GetNews = async(req, res) => {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM `news`')
        res.status(200).json({'news': rows})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const AddNews = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.title || !req.body.img || !req.body.desc  || !req.body.date) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('INSERT INTO `news` SET ?', {title: req.body.title, img: req.body.img, description: req.body.desc, ishero: req.body.ishero || 0,  date: req.body.date})
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Inserted Successfully."})
        }else {
            res.status(200).json({'message': "News Doesn't Inserted."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const ModifyNews = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.newid || !req.body.title || !req.body.img || !req.body.desc || !req.body.date) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('UPDATE `news` SET title = ?, img = ?, description = ?, ishero = ?, date = ? WHERE id = ?', [req.body.title, req.body.img, req.body.desc, req.body.ishero, req.body.date || 0, req.body.newid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Updated Successfully."})
        }else {
            res.status(200).json({'message': "News Doesn't Updated."})
        }
    } catch (err) { 
        console.log(err)
        res.status(500).json({ 'message': err.message })
    }
}

const RemoveNews = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.newid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('DELETE FROM `news` WHERE id = ?', [req.body.newid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "News Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { GetNews, AddNews, RemoveNews, ModifyNews }