
const axios = require('axios');
const crypto = require('crypto');
const API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = 4548137;
const IFRAME_ID = 835499;
const PAYMOB_SECRET = process.env.PAYMOB_SECRET_KEY; // You should securely store and retrieve your secret key
const paypal = require('@paypal/checkout-server-sdk');
const { DbConnect } = require('../ConfigFolder/DBConn');
const { client } = require('../ConfigFolder/paypalClient');
const connection = DbConnect().promise();

exports.GetOrders = async (req, res) => {
    try {

        const [orders] = await connection.query('SELECT * FROM orders');

        for (const order of orders) {
            const [products] = await connection.query(`
                SELECT op.product_id, p.name, p.price, op.quantity, op.color, op.size
                FROM order_products op
                JOIN products p ON op.product_id = p.id
                WHERE op.order_id = ?`, [order.id]);

            order.products = products.map(product => ({
                id: product.product_id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
		color: product.color,
		size: product.size
            }));
        }
	
        res.status(200).json({orders});
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
exports.GetOrdersById = async (req, res) => {
    try {
	const {buyer_id}=req.query
        const [orders] = await connection.query('SELECT * FROM orders WHERE buyer_id = ?', [buyer_id]);

        for (const order of orders) {
            const [products] = await connection.query(`
                SELECT op.product_id, p.name, p.price, op.quantity, op.color, op.size
                FROM order_products op
                JOIN products p ON op.product_id = p.id
                WHERE op.order_id = ?`, [order.id]);

            order.products = products.map(product => ({
                id: product.product_id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
		color: product.color,
		size: product.size
            }));
        }
	
        res.status(200).json({orders});
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};
exports.AddOrder = async (req, res) => {
    const { products, PaymentMethod, walletMobileNumber } = req.body; // Assuming walletMobileNumber is passed for mobile wallet payments

    if (!products || !products.length) {
        return res.status(400).json({ "message": "Missing required order details." });
    }

    try {
        let totalPrice = await calculateTotalPrice(products);
        totalPrice += req.body.Country === 'EG' ? 50 : 500;
        const totalCents = totalPrice * 100;
        const authToken = await authenticate();
        const orderId = await createOrder(authToken, totalCents, req.body.currency, req.body.PromoCode);

        await connection.query(
            'INSERT INTO orders (id, buyer_id, total_price, status) VALUES (?, ?, ?, "pending")',
            [orderId, 1, totalPrice] // Assuming buyerId is always 1 for simplicity
        );

        for (const product of products) {
            await connection.query(
                'INSERT INTO order_products (order_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)',
                [orderId, product.id, product.quantity, product.color.color, product.size.size]
            );
        }

        const billingData = {
            "apartment": "803",
            "email": "claudette09@exa.com",
            "floor": "42",
            "first_name": req.body.CustomerFirstName,
            "street": "Ethan Land",
            "building": "8028",
            "phone_number": req.body.PhoneNumber,
            "shipping_method": "PKG",
            "postal_code": req.body.ZipCode,
            "city": req.body.Region,
            "country": req.body.Country,
            "last_name": req.body.CustomerLastName,
            "state": "Utah"
        };

        let iframeURL = '';
        if (PaymentMethod === 0) { // Card Payment
            const paymentInfo = await generatePaymentKey(authToken, orderId, totalCents, "EGP", billingData, PaymentMethod);
            iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentInfo}`;
	        res.status(200).json({ iframeURL });        
		} else if (PaymentMethod === 2) { // Mobile Wallet Payment
            const paymentToken = await generatePaymentKey(authToken, orderId, totalCents, "EGP", billingData, PaymentMethod);
            const payload = {
                source: {
                    identifier: walletMobileNumber, // Ensure this is passed in the request body for mobile wallet payments
                    subtype: "WALLET"
                },
                payment_token: paymentToken
            };

            const paymentResponse = await axios.post('https://accept.paymob.com/api/acceptance/payments/pay', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            iframeURL = paymentResponse.data.iframe_redirection_url; // For mobile wallet, use redirect_url for further actions
	     res.status(200).json({ iframeURL });       
 }
	  else if(PaymentMethod === 1){
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: totalPrice
      }
    }]
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).send(err.message);
  }


		
	}


    } catch (error) {
        console.error('Error in payment process:', error);
        res.status(500).json({ message: "Failed to initiate payment", error: error.message });
    }
};
exports.UpdateOrder = async (req, res) => {

    const {orderId , tracking_order } = req.body; // Expecting products to be an array of {id, quantity}

    if (!orderId || !tracking_order) {
        return res.status(400).json({ "message": "Missing information for the order update." });
    }

    try {
        //const totalPrice = await calculateTotalPrice(products);

        // Begin transaction


        await connection.query(
            'UPDATE orders SET  tracking_order = ? WHERE id = ?',
            [ tracking_order, orderId]
        );

       

        res.status(200).json({ 'message': "Order updated successfully.", 'TrackingOrder': tracking_order });
    } catch (err) {
        // Rollback transaction in case of an error

        console.error('Failed to update order:', err);
        res.status(500).json({ 'message': err.message });
    }
};
async function calculateTotalPrice(products) {
    if (!products.length) return 0;

    let totalPrice = 0;

    for (const product of products) {
        const productId = product.id;
        const quantity = product.quantity;
        // Assuming the size and color are directly in the product object
        // and that you have price information available for each combination of size and color.
        const size = product.size.size;
        const color = product.color.color;

        // Query to get the price for this specific combination of product ID, size, and color.
        const [productData] = await connection.query(`
            SELECT price FROM products
            WHERE id = ? `,
            [productId]
        );

        // Check if the product variant exists
        if (productData.length > 0) {
            const productPrice = productData[0].price;
            totalPrice += (productPrice * quantity);
        } else {
            // Handle case where product variant does not exist
            // You might throw an error or skip to the next product
        }
    }

    return totalPrice;
}





exports.RemoveOrder = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ "message": "Order ID is missing" });
    }

    try {
        // Start a transaction


        // Delete entries in order_products table
        await connection.query('DELETE FROM order_products WHERE order_id = ?', [orderId]);

        // Delete the order
        const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);

        // Commit transaction


        if (result.affectedRows > 0) {
            res.status(200).json({ 'message': "Order removed successfully." });
        } else {
            // If no rows were affected, it means the order was not found
            res.status(404).json({ 'message': "Order not found." });
        }
    } catch (err) {
        // Rollback transaction in case of error

        res.status(500).json({ 'message': err.message });
    }
};
exports.initiatePaymentProcess = async (req, res) => {
    try {
        const authToken = await authenticate();
        const orderId = await createOrder(authToken, req.body.amountCents, req.body.currency);
        const paymentToken = await generatePaymentKey(authToken, orderId, req.body.amountCents, req.body.currency, req.body.billingData);
        const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;
       
        res.status(200).json({ iframeURL });
    } catch (error) {
        console.error('Error in payment process:', error);
        res.status(500).json({ message: "Failed to initiate payment", error: error.message });
    }
};

async function authenticate() {
    const response = await axios.post('https://accept.paymob.com/api/auth/tokens', { api_key: API_KEY });
    return response.data.token;
}

async function createOrder(token, amountCents, currency) {
    const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents,
        currency,
        items: [],
    });
    return response.data.id;
}

async function generatePaymentKey(token, orderId, amountCents, currency, billingData, PaymentMethod) {
    let integrationId = null;

    switch (PaymentMethod) {
        case 0: // Card Payment
            integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
            break;
        case 2: // Mobile Wallet
            integrationId = process.env.PAYMOB_INTEGRATION_ID_WALLET; // Make sure to set this environment variable
            break;
        default:
            throw new Error("Unsupported Payment Method");
    }

    const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
        auth_token: token,
        amount_cents: amountCents,
        currency,
        integration_id: integrationId,
        order_id: orderId,
        billing_data: billingData,
    });

    return response.data.token;
}
exports.PaymentCallback = async (req, res) => {
const queryParameters = req.query;
    const receivedHmac = queryParameters.hmac;
    delete queryParameters.hmac; // Remove hmac from query parameters to reconstruct the message for HMAC verification
//Define the desired order
const desiredOrder = [
    'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
    'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
    'is_standalone_payment', 'is_voided', 'order', 'owner', 'pending', 'source_data.pan',
    'source_data.sub_type', 'source_data.type', 'success'
];

// Get the keys based on the desired order
const orderedKeys = desiredOrder.filter(key => key in queryParameters && key !== 'hmac');



// Construct message based on ordered keys
const message = orderedKeys.map(key => queryParameters[key]).join('');
    //const message = Object.keys(queryParameters)
    //    .sort()
    //    .map(key => `${key}=${queryParameters[key]}`)
     //   .join('&');

    if (!verifyHMAC(message, receivedHmac, PAYMOB_SECRET)) {
	console.log(message);
        return res.status(401).send('Unauthorized: HMAC verification failed');
    }

    // Assuming 'success=true' indicates a successful transaction
    if (queryParameters.success === 'true') {
        try {
         //   await updateOrderStatus(queryParameters.order, 'successful');
	  await connection.query('UPDATE orders SET status = ? WHERE id = ?', ['successful', queryParameters.order]);
	const successUrl = `https://main--delightful-gumdrop-c251d7.netlify.app/ordersuccess/${queryParameters.order}`;            
	return res.redirect(successUrl);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // Handle unsuccessful transactions as needed
        res.send('Transaction was not successful');
    }
};

// Function to verify HMAC signature
function verifyHMAC(message, receivedHmac, secret) {
    const hmac = crypto.createHmac('sha512', secret).update(message, 'utf8').digest('hex');
 
    return hmac === receivedHmac;
}

// Function to update order status in your database
async function updateOrderStatus(orderId, newStatus) {
    // Implement the actual database query to update the order status based on your schema
    // This is a placeholder implementation


    if (result.affectedRows === 0) {
        throw new Error(`Order with ID ${orderId} not found`);
    }
}








