// /.netlify/functions/verifySession (Netlify)
const Stripe = require("stripe");

exports.handler = async (event, context) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { statusCode: 500, body: JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }) };
  const stripe = new Stripe(stripeKey);

  const params = event.queryStringParameters || {};
  const sid = params.session_id;
  if (!sid) return { statusCode: 400, body: JSON.stringify({ error: "session_id is required" }) };

  try {
    const session = await stripe.checkout.sessions.retrieve(sid);
    return { statusCode: 200, body: JSON.stringify(session) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
