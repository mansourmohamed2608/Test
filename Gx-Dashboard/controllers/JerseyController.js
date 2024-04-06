const { DbConnect } = require('../ConfigFolder/DBConn')
const connection = DbConnect().promise()

const GetJerseyById = async (req, res) => {
    const jerseyId = req.query.id;

    if (!jerseyId) {
        return res.status(400).json({ 'message': 'Jersey ID is required' });
    }

    try {
       
        const [jerseys] = await connection.query('SELECT * FROM `jersey` WHERE id = ?', [jerseyId]);
        if (jerseys.length === 0) {
            return res.status(404).json({ 'message': 'Jersey not found' });
        }
        const jersey = jerseys[0]; // The product details

        // Fetch images with IDs
        const [images] = await connection.query('SELECT id, image_url, image_type FROM `jersey_images` WHERE jersey_id = ?', [jerseyId]);
       
        // Fetch colors with IDs
        const [colors] = await connection.query('SELECT id, color FROM `jersey_colors` WHERE jersey_id = ?', [jerseyId]);

        // Fetch sizes with IDs (assuming you've added the product_sizes table)
        const [sizes] = await connection.query('SELECT id, size FROM `jersey_sizes` WHERE jersey_id = ?', [jerseyId]);

        // Combine the product details with its images, colors, and sizes
        const result = { ...jersey, images, colors, sizes };
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};



const AddJersey = async (req, res) => {
    const { name, description, price, images, colors, sizes } = req.body;
    if (!name || !description || !price  || !images || images.length === 0 || !colors || colors.length === 0 || !sizes || sizes.length === 0) {
        return res.status(400).json({ "message": "Complete jersey information including images, colors, and sizes is required" });
    }

    try {
        await connection.beginTransaction();

        const [jersey] = await connection.query('INSERT INTO `jersey` (name, description, price) VALUES (?, ?, ?)', [name, description, price]);
        const jerseyId = jersey.insertId;

        // Add images, colors, and now sizes
        // Images and colors insertion as before
        // New: Insert sizes
        for (const size of sizes) {
            await connection.query('INSERT INTO `jersey_sizes` (jersey_id, size) VALUES (?, ?)', [jerseyId, size]);
        }

        await connection.commit();
        res.status(201).json({ 'message': 'Jersey added successfully', 'jerseyId': jerseyId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ 'message': err.message });
    }
};


const ModifyJersey = async (req, res) => {
    const { id, name, description, price, images, colors } = req.body;
    if (!id || !name || !description || !price  || !images || images.length === 0 || !colors || colors.length === 0) {
        return res.status(400).json({ "message": "Complete jersey information is required, including images and colors." });
    }

    try {
        await connection.beginTransaction();

        // Update product details
        await connection.query('UPDATE `jersey` SET name = ?, description = ?, price = ? WHERE id = ?', [name, description, price, id]);

        // Assuming images and colors are to be completely replaced:
        // Remove existing images
        await connection.query('DELETE FROM `jersey_images` WHERE jersey_id = ?', [id]);
        // Insert new images
        for (const { url, type } of images) {
            await connection.query('INSERT INTO `jersey_images` (jersey_id, image_url, image_type) VALUES (?, ?, ?)', [id, url, type]);
        }

        // Remove existing colors
        await connection.query('DELETE FROM `jersey_colors` WHERE jersey_id = ?', [id]);
        // Insert new colors
        for (const color of colors) {
            await connection.query('INSERT INTO `jersey_colors` (jersey_id, color) VALUES (?, ?)', [id, color]);
        }

        await connection.commit();
        res.status(200).json({ 'message': 'Jersey updated successfully.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ 'message': err.message });
    }
};

const RemoveJersey = async (req, res) => {
    const { id } = req.body;

    try {
        const [result] = await connection.query('DELETE FROM `jersey` WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': 'Jersey removed successfully.' });
        } else {
            res.status(404).json({ 'message': 'Jersey not found.' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};




 

module.exports = {GetJerseyById, AddJersey, RemoveJersey, ModifyJersey }
