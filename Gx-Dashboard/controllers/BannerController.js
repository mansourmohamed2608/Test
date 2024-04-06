const { DbConnect } = require('../ConfigFolder/DBConn');
const connection = DbConnect().promise();

const GetAllBanners = async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT banner.id, banner.background, banner.players, banner.jersey_id FROM banner
            LEFT JOIN jersey ON banner.jersey_id = jersey.id;
        `);
        res.status(200).json({ 'banners': rows });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
const AddBanner = async (req, res) => {
    const { background, players, jersey_id } = req.body;
    if (!background || !players || !jersey_id) {
        return res.status(400).json({ "message": "Complete banner information including jersey ID is required" });
    }

    try {
        // Optional: Validate jersey_id exists in the jersey table before insertion
        const [jerseys] = await connection.query('SELECT id FROM jersey WHERE id = ?', [jersey_id]);
        if (jerseys.length === 0) {
            return res.status(404).json({ "message": "Jersey not found" });
        }

        const [result] = await connection.query('INSERT INTO banner (background, players, jersey_id) VALUES (?, ?, ?)', [background, players, jersey_id]);
        if (result.affectedRows > 0) {
            res.status(201).json({ 'message': "Banner inserted successfully.", 'bannerId': result.insertId });
        } else {
            res.status(400).json({ 'message': "Banner couldn't be inserted." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
const ModifyBanner = async (req, res) => {
    const { id, background, players, jersey_id } = req.body;
    if (!id || !background || !players || !jersey_id) {
        return res.status(400).json({ "message": "Complete banner information including jersey ID is required" });
    }

    try {
        // Optional: Validate jersey_id exists in the jersey table before updating
        const [jerseys] = await connection.query('SELECT id FROM jersey WHERE id = ?', [jersey_id]);
        if (jerseys.length === 0) {
            return res.status(404).json({ "message": "Jersey not found" });
        }

        const [result] = await connection.query('UPDATE banner SET background = ?, players = ?, jersey_id = ? WHERE id = ?', [background, players, jersey_id, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': "Banner updated successfully." });
        } else {
            res.status(404).json({ 'message': "Banner not found or no changes made." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const RemoveBanner = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ "message": "Banner ID is required" });
    }

    try {
        const [result] = await connection.query('DELETE FROM banner WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': "Banner removed successfully." });
        } else {
            res.status(404).json({ 'message': "Banner not found." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};



module.exports = { GetAllBanners, AddBanner, ModifyBanner, RemoveBanner };