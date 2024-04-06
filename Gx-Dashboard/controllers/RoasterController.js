const { DbConnect } = require('../ConfigFolder/DBConn');

const connection = DbConnect().promise();

const GetRoaster = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM `roaster`');
        const members = rows.map(row => ({
            ...row,
            agents: JSON.parse(row.agents || '[]') // Ensure agents is an array even if null/empty
        }));
        res.status(200).json({ members });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
const GetPlayersInTeam = async (req, res) => {
    const { teamId } = req.query; // Assuming you're using the team ID from the URL parameter

    if (!teamId) {
        return res.status(400).json({ "message": "Team ID is missing" });
    }

    try {
        const query = `
            SELECT roaster.*
            FROM roaster
            JOIN teams ON roaster.team_id = teams.team_id
            WHERE teams.team_id = ?`;
        const [players] = await connection.query(query, [teamId]);

       
            res.status(200).json(players);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': err.message });
    }
};

const AddMember = async (req, res) => {
    const { game, username, description, img, agents, iscoach, isgirl } = req.body;
    if (!game || !username || !description || !img) {
        return res.status(400).json({ "message": "Info Missing" });
    }
   
    try {
        const [rows] = await connection.query('INSERT INTO `roaster` SET ?', {
            game, username, description, img,
            agents: JSON.stringify(agents || []), // Ensure agents are stored as a JSON string
            iscoach: iscoach || 0,
            isgirl: isgirl || 0
        });
        if (rows.affectedRows > 0) {
            res.status(201).json({ 'message': "Inserted Successfully." });
        } else {
            res.status(400).json({ 'message': "Member Not Inserted." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const ModifyMember = async (req, res) => {
    const { game, username, description, img, agents, iscoach, isgirl, memid, team_id } = req.body;
    if (!game || !username || !description || !agents || !img || !memid) {
        return res.status(400).json({ "message": "Info Missing" });
    }
   
    try {
        const [rows] = await connection.query('UPDATE `roaster` SET ? WHERE id = ?', [{
            game, username, description, img, team_id, 
            agents: JSON.stringify(agents), // Ensure agents are stored as a JSON string
            iscoach: iscoach || 0,
            isgirl: isgirl || 0
        }, memid]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Updated Successfully." });
        } else {
            res.status(404).json({ 'message': "Member Not Found." });
        }
    } catch (err) {
        console.error(err); // Use console.error for errors
        res.status(500).json({ 'message': err.message });
    }
};

const RemoveMember = async(req, res) => {
    const { memid } = req.body;
    if (!memid) {
        return res.status(400).json({ "message": "Member ID Missing" });
    }

    try {
        const [rows] = await connection.query('DELETE FROM `roaster` WHERE id = ?', [memid]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Removed Successfully." });
        } else {
            res.status(404).json({ 'message': "Member Not Found." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = { GetRoaster,GetPlayersInTeam, AddMember, RemoveMember, ModifyMember };