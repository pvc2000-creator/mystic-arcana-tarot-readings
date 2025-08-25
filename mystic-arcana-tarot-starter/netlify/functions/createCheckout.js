// /.netlify/functions/createCheckout (Netlify)
const Stripe = require("stripe");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { statusCode: 500, body: JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }) };
  const stripe = new Stripe(stripeKey);
  const payload = JSON.parse(event.body || "{}");
  const { service, date, time, customer_name, customer_email } = payload;

  const priceMap = {
    clarity30: process.env.PRICE_ID_30,
    deep60: process.env.PRICE_ID_60
  };
  const price = priceMap[service];
  if (!price) return { statusCode: 400, body: JSON.stringify({ error: "Invalid service or missing PRICE_IDs" }) };

  const proto = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const baseUrl = `${proto}://${host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel.html`,
      metadata: { service, date, time, customer_name, customer_email }
    });
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
