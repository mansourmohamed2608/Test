const { DbConnect } = require('../ConfigFolder/DBConn');
const connection = DbConnect().promise();

const GetAllSliders = async (req, res) => {
    try {
        const [rows] = await connection.query(`
            SELECT slider.id, slider.background, slider.figures FROM slider
          
        `);
        res.status(200).json({ 'sliders': rows });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
const AddSlider = async (req, res) => {
    const { background, figures} = req.body;
    if (!background || !figures ) {
        return res.status(400).json({ "message": "Complete slider information  is required" });
    }

    try {
        // Optional: Validate jersey_id exists in the jersey table before insertion
      

        const [result] = await connection.query('INSERT INTO slider (background, figures) VALUES (?, ?)', [background, figures]);
        if (result.affectedRows > 0) {
            res.status(201).json({ 'message': "Slider inserted successfully.", 'sliderId': result.insertId });
        } else {
            res.status(400).json({ 'message': "Slider couldn't be inserted." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
const ModifySlider = async (req, res) => {
    const { id, background, figures} = req.body;
    if (!id || !background || !figures) {
        return res.status(400).json({ "message": "Complete slider information  is required" });
    }

    try {
      

        const [result] = await connection.query('UPDATE slider SET background = ?, figures = ? WHERE id = ?', [background, figures, id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': "Slider updated successfully." });
        } else {
            res.status(404).json({ 'message': "Slider not found or no changes made." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const RemoveSlider = async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ "message": "Slider ID is required" });
    }

    try {
        const [result] = await connection.query('DELETE FROM slider WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': "Slider removed successfully." });
        } else {
            res.status(404).json({ 'message': "Slider not found." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};



module.exports = { GetAllSliders, AddSlider, ModifySlider, RemoveSlider };
