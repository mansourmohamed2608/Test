const { DbConnect } = require('../ConfigFolder/DBConn');

const connection = DbConnect().promise();

// Get all teams
const GetAllTeams = async (req, res) => {
    try {
        const [teams] = await connection.query('SELECT * FROM `teams`');
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

// Get a single team by ID
const GetTeamById = async (req, res) => {
    const { teamId } = req.query;
    try {
        const [team] = await connection.query('SELECT * FROM `teams` WHERE team_id = ?', [teamId]);
        if (team.length) {
            res.status(200).json(team[0]);
        } else {
            res.status(404).json({ 'message': 'Team not found' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.messawge });
    }
};

// Add a new team
const AddTeam = async (req, res) => {
    const { team_name, game_name, game_icon, region, game_img, players_img } = req.body;
    if (!team_name || !game_name || !game_icon) {
        return res.status(400).json({ "message": "Missing required team information" });
    }
    try {
        const [result] = await connection.query('INSERT INTO `teams` SET ?', {
            team_name, game_name, game_icon, region, game_img, players_img
        });
        if (result.insertId) {
            res.status(201).json({ 'message': 'Team added successfully', 'teamId': result.insertId });
        } else {
            res.status(500).json({ 'message': 'Failed to add team' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

// Update an existing team
const UpdateTeam = async (req, res) => {
    const { teamId, team_name, game_name, game_icon, region, game_img, players_img } = req.body;
    try {
        const [result] = await connection.query('UPDATE `teams` SET ? WHERE team_id = ?', [{
            team_name, game_name, region, game_icon, game_img, players_img
        }, teamId]);
        if (result.affectedRows) {
            res.status(200).json({ 'message': 'Team updated successfully' });
        } else {
            res.status(404).json({ 'message': 'Team not found' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

// Delete a team
const DeleteTeam = async (req, res) => {
    const { teamId } = req.body;
    try {
        const [result] = await connection.query('DELETE FROM `teams` WHERE team_id = ?', [teamId]);
        if (result.affectedRows) {
            res.status(200).json({ 'message': 'Team deleted successfully' });
        } else {
            res.status(404).json({ 'message': 'Team not found' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = { GetAllTeams, GetTeamById, AddTeam, UpdateTeam, DeleteTeam };
