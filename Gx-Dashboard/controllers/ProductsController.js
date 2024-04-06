const { DbConnect } = require('../ConfigFolder/DBConn')
const connection = DbConnect().promise()

const GetAllProducts = async (req, res) => {
    try {
        const [sliders] = await connection.query('SELECT slider.id, slider.background, slider.figures FROM slider');

        const [products] = await connection.query('SELECT * FROM `products`');
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

        for (let product of products) {
            const [images] = await connection.query('SELECT id, image_url, image_type FROM `product_images` WHERE product_id = ?', [product.id]);
            const [colors] = await connection.query('SELECT id, color FROM `product_colors` WHERE product_id = ?', [product.id]);
            const [sizes] = await connection.query('SELECT id, size FROM `product_sizes` WHERE product_id = ?', [product.id]);
	    const [gallery] = await connection.query('SELECT id, image_url FROM `product_gallery` WHERE product_id = ?', [product.id]);
            product.images = images;
	    product.gallery = gallery;
            product.colors = colors;
            product.sizes = sizes;
        }
        const responseData = {
            sliders,
           categories,
            products
        };
        res.status(200).json(responseData);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};


const GetProductById = async (req, res) => {
    const productId = req.query.id;

    if (!productId) {
        return res.status(400).json({ 'message': 'Product ID is required' });
    }

    try {
        // Fetch product details

        const [products] = await connection.query('SELECT * FROM `products` WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ 'message': 'Product not found' });
        }
        const product = products[0]; // The product details

        // Fetch images with IDs
        const [images] = await connection.query('SELECT id, image_url, image_type FROM `product_images` WHERE product_id = ?', [productId]);
        const [gallery] = await connection.query('SELECT id, image_url FROM `product_gallery` WHERE product_id = ?', [productId]);

        // Fetch colors with IDs
        const [colors] = await connection.query('SELECT id, color FROM `product_colors` WHERE product_id = ?', [productId]);

        // Fetch sizes with IDs (assuming you've added the product_sizes table)
        const [sizes] = await connection.query('SELECT id, size FROM `product_sizes` WHERE product_id = ?', [productId]);

        const whatsappNumber = "+201553442302";
        // Combine the product details with its images, colors, and sizes
        const result = { ...product, images,gallery, colors, sizes,whatsappNumber  };
      
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};


const GetProductByCategory = async (req, res) => {
    const categoryId = req.query.categoryId; // or req.query.categoryId, depending on how you're passing parameters

    try {
        const [sliders] = await connection.query('SELECT slider.id, slider.background, slider.figures FROM slider');

        const [products] = await connection.query('SELECT * FROM `products` WHERE category_id = ?', [categoryId]);
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
        for (let product of products) {
            const [images] = await connection.query('SELECT id, image_url, image_type FROM `product_images` WHERE product_id = ?', [product.id]);
            const [colors] = await connection.query('SELECT id, color FROM `product_colors` WHERE product_id = ?', [product.id]);
            const [sizes] = await connection.query('SELECT id, size FROM `product_sizes` WHERE product_id = ?', [product.id]);
            const [gallery] = await connection.query('SELECT id, image_url FROM `product_gallery` WHERE product_id = ?', [product.id]);
            product.images = images;
	    product.gallery = gallery;
            product.colors = colors;
            product.sizes = sizes;
        }
        const responseData = {
            sliders,
            categories,
            products
        };
        res.status(200).json(responseData);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const AddProduct = async (req, res) => {
    const { name, description, price, category_id, images,gallery, colors, sizes } = req.body;
   
    // Adjusted to check for min 2 and max 5 images
    if (!name || !description ||  !price|| !category_id || !images || !gallery || !colors  || !sizes) {
        return res.status(400).json({ "message": "Complete product information including at least 2 and no more than 5 images, colors, and sizes is required" });
    }

    try {
      // await connection.beginTransaction();

        const [product] = await connection.query('INSERT INTO `products` SET ?', {name, description, price, category_id});
        const productId = product.insertId;

        // Presumably add images, colors, and sizes to their respective tables
        // Example for images is not provided, but it would go here
        for (const { url, type } of images) {
            await connection.query('INSERT INTO `product_images` (product_id, image_url, image_type) VALUES (?, ?, ?)', [productId, url, type]);
        }
        for (const galler of gallery) {
           await connection.query('INSERT INTO `product_gallery` (product_id, image_url) VALUES (?, ?)', [productId, galler]);
        }

        for (const color of colors) {
            await connection.query('INSERT INTO `product_colors` (product_id, color) VALUES (?, ?)', [productId, color]);
        }
        for (const size of sizes) {
            await connection.query('INSERT INTO `product_sizes` (product_id, size) VALUES (?, ?)', [productId, size]);
        }

       // await connection.commit();
        res.status(200).json({ 'message': 'Product added successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ 'message': err.message });
    }
};


const ModifyProduct = async (req, res) => {
    const { id, name, description, price, category_id,images,gallery, colors, sizes } = req.body;
   
    // Adjusted to require exactly 2 images
    if (!id || !name || !description || !price || !images || !gallery || !category_id || !colors ||  !sizes ) {
        return res.status(400).json({ "message": "Complete product information is required, including exactly 2 images and non-empty colors." });
    }

    try {
        //await connection.beginTransaction();

        // Update product details


        // Remove existing images

	const productId=id;


        await connection.query('UPDATE `products` SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?', [name, description, price, category_id, productId]);
        // Insert new images, assuming images are provided with 'url' and 'type' properties
        await connection.query('DELETE FROM `product_images` WHERE product_id = ?', [id]);
       for (const { url, type } of images) {
           await connection.query('INSERT INTO `product_images` (product_id, image_url, image_type) VALUES (?, ?, ?)', [productId, url, type]);
        }

        // Insert new images, assuming images are provided with 'url' and 'type' properties
        await connection.query('DELETE FROM `product_gallery` WHERE product_id = ?', [id]);
        for (const url of gallery) {
            await connection.query('INSERT INTO `product_gallery` (product_id, image_url) VALUES (?, ?)', [productId, url]);
        }

        // Remove existing colors

        // Insert new colors
       await connection.query('DELETE FROM `product_colors` WHERE product_id = ?', [productId]);
        for (const color of colors) {
           await connection.query('INSERT INTO `product_colors` (product_id, color) VALUES (?, ?)', [productId, color]);
        }

        // Insert new colors
        await connection.query('DELETE FROM `product_sizes` WHERE product_id = ?', [id]);
       for (const size of sizes) {
            await connection.query('INSERT INTO `product_sizes` (product_id, size) VALUES (?, ?)', [productId, size]);
       }

       // await connection.commit();
        res.status(200).json({ 'message': 'Product updated successfully.' });
    } catch (err) {
        // If there's an error, roll back any changes made in the database
       // await connection.rollback();
        res.status(500).json({ 'message': err.message });
    }
};


const RemoveProduct = async (req, res) => {
    const { id } = req.body;

    try {
        const [result] = await connection.query('DELETE FROM `products` WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': 'Product removed successfully.' });
        } else {
            res.status(404).json({ 'message': 'Product not found.' });
        }
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};




 

module.exports = {GetAllProducts,GetProductById,GetProductByCategory, AddProduct, RemoveProduct, ModifyProduct }