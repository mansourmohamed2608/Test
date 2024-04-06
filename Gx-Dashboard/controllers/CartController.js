const { DbConnect } = require('../ConfigFolder/DBConn')
const connection = DbConnect().promise()

const GetCartItems = async(req, res) => {
    if (!req.params.cart_id) return res.status(400).json({ "message": "Cart ID Missing" });

    try {
        const [rows] = await connection.query('SELECT * FROM `cart_items` WHERE cart_id = ?', [req.params.cart_id]);
        res.status(200).json({ 'cartItems': rows });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const AddCartItem = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" });
    if (!req.body.cart_id || !req.body.product_id || !req.body.quantity) return res.status(400).json({ "message": "Cart Item Info Missing" });

    try {
        const { cart_id, product_id, quantity } = req.body;
        const [existingItem] = await connection.query('SELECT * FROM `cart_items` WHERE cart_id = ? AND product_id = ?', [cart_id, product_id]);

        if (existingItem.length > 0) {
            const newQuantity = existingItem[0].quantity + quantity;
            await connection.query('UPDATE `cart_items` SET quantity = ? WHERE cart_id = ? AND product_id = ?', [newQuantity, cart_id, product_id]);
        } else {
            await connection.query('INSERT INTO `cart_items` SET ?', { cart_id, product_id, quantity });
        }

        res.status(200).json({ 'message': "Product added to cart successfully." });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const UpdateCartItem = async(req, res) => {
    if (!req.body) return res.status(400).json({ "message": "Request Body Is Missing" });
    if (!req.body.id || !req.body.quantity) return res.status(400).json({ "message": "Cart Item ID or Quantity Missing" });

    try {
        const [rows] = await connection.query('UPDATE `cart_items` SET quantity = ? WHERE id = ?', [req.body.quantity, req.body.id]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Cart item updated successfully." });
        } else {
            res.status(200).json({ 'message': "Cart item doesn't exist." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

const RemoveCartItem = async(req, res) => {
    if (!req.params.id) return res.status(400).json({ "message": "Cart Item ID Missing" });

    try {
        const [rows] = await connection.query('DELETE FROM `cart_items` WHERE id = ?', [req.params.id]);
        if (rows.affectedRows > 0) {
            res.status(200).json({ 'message': "Cart item removed successfully." });
        } else {
            res.status(200).json({ 'message': "Cart item doesn't exist." });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = { GetCartItems, AddCartItem, UpdateCartItem, RemoveCartItem };
