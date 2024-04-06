const dayjs = require('dayjs')
const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()
const GetMatches = async(req, res) => {
    try {
        let [rows, fields] = await connection.query('SELECT * FROM `matches`')
        if (req.query.past) {
            rows = rows?.filter((e) => dayjs(e.date).isBefore(dayjs()))
            rows?.forEach((e) => e.results = JSON.parse (e.results))    
        }else{
            rows = rows?.filter((e) => {
                const matchDate = dayjs(e.date)
                const now = dayjs()
                return matchDate.isAfter(now) || matchDate.isSame(now)
            })
        }
	rows?.forEach((e) => e.enemy = JSON.parse (e.enemy) || e.enemy)
        res.status(200).json({'matches': rows || []})
    } catch (err) {
        res.status(500).json({ 'message': err.message })
        throw err
    }
}

const AddMatch = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.game || !req.body.enemy || !req.body.date || !req.body.tourname ) return res.status(400).json({ "message": "Info Missing" })
    if (typeof req.body.results !== 'string' || !req.body.results.includes('-')) {
        return res.status(400).send('Input must be a string containing at least one hyphen (-).');
      }
    try {
        const [rows, fields] = await connection.query('INSERT INTO `matches` SET ?', {game: req.body.game, date: req.body.date, enemy: JSON.stringify(req.body.enemy), tourname: req.body.tourname, results: req.body.results || JSON.stringify({state: 'not-yet'}), watchlink: req.body.watchlink || '' })
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Inserted Successfully."})
        }else {
            res.status(200).json({'message': "Match Doesn't Inserted."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

const ModifyMatch = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.game || !req.body.enemy || !req.body.date || !req.body.tourname || !req.body.matchid ) return res.status(400).json({ "message": "Info Missing" })
    if (typeof req.body.results !== 'string' || !req.body.results.includes('-')) {
        return res.status(400).send('Input must be a string containing at least one hyphen (-).');
      }
    try {
        const [rows, fields] = await connection.query('UPDATE `matches` SET game = ?, enemy = ?, tourname = ?, date = ?, results = ?, watchlink = ? WHERE id = ?', [req.body.game, JSON.stringify(req.body.enemy), req.body.tourname, req.body.date, req.body.results || JSON.stringify({state: 'not-yet'}), req.body.watchlink || '',  req.body.matchid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Updated Successfully."})
        }else {
            res.status(200).json({'message': "Match Doesn't Updated."})
        }
    } catch (err) { 
        console.log(err)
        res.status(500).json({ 'message': err.message })
    }
}

const RemoveMatch = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" })
    if ( !req.body.matchid ) return res.status(400).json({ "message": "Info Missing" })

    try {
        const [rows, fields] = await connection.query('DELETE FROM `matches` WHERE id = ?', [req.body.matchid])
        if (rows.affectedRows > 0) {
            res.status(200).json({'message': "Removed Successfully."})
        }else {
            res.status(200).json({'message': "Match Doesn't Removed."})
        }
    } catch (err) { 
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { GetMatches, AddMatch, RemoveMatch, ModifyMatch }