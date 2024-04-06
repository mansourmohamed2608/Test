const { DbConnect } = require('../ConfigFolder/DBConn')

const connection = DbConnect().promise()

const GetAllData = async (req, res) => {
    try {
        // Fetch all sliders
        const [sliders] = await connection.query('SELECT slider.id, slider.background, slider.figures FROM slider');

        // Fetch all banners
        const [banners] = await connection.query(`
            SELECT banner.id, banner.background, banner.players, banner.jersey_id FROM banner
            LEFT JOIN jersey ON banner.jersey_id = jersey.id;
        `);

        // Fetch all categories and their products
        const [categories] = await connection.query(`
            SELECT
            categories.id AS category_id,
            categories.name AS category_name,
            categories.description AS category_description,
            categories.img AS img,
            COUNT(products.id) AS product_count
            FROM categories
            LEFT JOIN products ON categories.id = products.category_id
            GROUP BY categories.id;
        `);

        // Fetch all products along with their images, colors, and sizes
        const [products] = await connection.query('SELECT * FROM `products`');
        for (let product of products) {
            const [images] = await connection.query('SELECT id, image_url, image_type FROM `product_images` WHERE product_id = ?', [product.id]);
            const [colors] = await connection.query('SELECT id, color FROM `product_colors` WHERE product_id = ?', [product.id]);
            const [sizes] = await connection.query('SELECT id, size FROM `product_sizes` WHERE product_id = ?', [product.id]);

            product.images = images;
            product.colors = colors;
            product.sizes = sizes;
        }

        // Combine all data into a single response object
        const responseData = {
            sliders,
            banners,
            categories,
            products
        };

        res.status(200).json(responseData);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

module.exports = {GetAllData}
