// /api/create-checkout-session.js (Vercel)
const Stripe = require("stripe");

function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  const stripe = new Stripe(stripeKey);

  const { service, date, time, customer_name, customer_email } = req.body || {};

  const priceMap = {
    clarity30: process.env.PRICE_ID_30,
    deep60: process.env.PRICE_ID_60
  };
  const price = priceMap[service];
  if (!price) return res.status(400).json({ error: "Invalid service or missing PRICE_IDs" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer_email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${baseUrl(req)}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl(req)}/cancel.html`,
      metadata: {
        service,
        date,
        time,
        customer_name,
        customer_email
      }
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
