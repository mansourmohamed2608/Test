
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const getImages = async(req, res) => {
    try {
        const [rows, fields] = await connection.query('SELECT * FROM `community-gallery`')
        res.status(200).json({'imgs': rows})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const addNewImage = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.url || !req.body.label ) return res.status(400).json({ "message": "Info Missing" })
    try {
        const [rows, fields] = await connection.query('INSERT INTO `community-gallery` SET ?', {img: req.body.url, imglabel: req.body.label})
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Inserted Successfully."})
        }else {
            res.status(200).json({'message': "Image Doesn't Inserted."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const removeImage = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.imgid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('DELETE FROM `community-gallery` WHERE id = ?', [req.body.imgid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "Image Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { getImages, removeImage, addNewImage }