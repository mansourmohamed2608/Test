
const axios = require('axios');

const API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = 4548137;
const IFRAME_ID = 835499;

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

async function generatePaymentKey(token, orderId, amountCents, currency, billingData) {
    const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
        auth_token: token,
        amount_cents: amountCents,
        currency,
        integration_id: INTEGRATION_ID,
        order_id: orderId,
        billing_data: billingData,
    });
    return response.data.token;

}
