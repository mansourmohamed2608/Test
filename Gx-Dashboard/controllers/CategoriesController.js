const { DbConnect } = require('../ConfigFolder/DBConn')
const connection = DbConnect().promise()
const GetAllCategories = async(req, res) => {
    try {
        const [rows] = await connection.query(`
        SELECT
        categories.id AS category_id,
        categories.name AS category_name,
        categories.description AS category_description,
	categories.img AS category_img,
        COUNT(products.id) AS product_count
      FROM
        categories
      LEFT JOIN
        products ON categories.id = products.category_id
      GROUP BY
        categories.id;
      
      `);
        res.status(200).json({ 'categories': rows });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const AddCategory = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" });
    else if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ "message": "Category Name Missing" });
    else if (!req.body.description || !req.body.description.trim()) return res.status(400).json({ "message": "Category description Missing" });
    else if (!req.body.img || !req.body.img.trim()) return res.status(400).json({ "message": "Category img Missing" });
    try {
        const { name, description,img } = req.body;
        const [rows] = await connection.query('INSERT INTO `categories` SET ?', { name, description,img });
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Category Inserted Successfully." });
        } else {
            res.status(200).json({ 'message': "Category Doesn't Inserted." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}


const ModifyCategory = async (req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" });
   else if (!req.body.id || !req.body.id) return res.status(400).json({ "message": "Category id Missing" });
   else if (!req.body.name || !req.body.name.trim()) return res.status(400).json({ "message": "Category Name Missing" });
   else if (!req.body.description || !req.body.description.trim()) return res.status(400).json({ "message": "Category description Missing" });
   else if (!req.body.img || !req.body.img.trim()) return res.status(400).json({ "message": "Category img Missing" });
    try {
        const { id, name, description, img } = req.body;
        const [rows] = await connection.query('UPDATE `categories` SET name = ?, img = ?, description = ? WHERE id = ?', [name, img, description, id]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Category Updated Successfully." });
        } else {
            res.status(200).json({ 'message': "Category Doesn't Updated." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}
const RemoveCategory = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" });
    if (!req.body.id) return res.status(400).json({ "message": "Category ID Missing" });

    try {
        const [rows] = await connection.query('DELETE FROM `categories` WHERE id = ?', [req.body.id]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Category Removed Successfully." });
        } else {
            res.status(200).json({ 'message': "Category Doesn't Removed." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { GetAllCategories, AddCategory, ModifyCategory, RemoveCategory };
