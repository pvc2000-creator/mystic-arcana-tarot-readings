// /api/verify-session.js (Vercel)
const Stripe = require("stripe");

module.exports = async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
  const stripe = new Stripe(stripeKey);

  const sid = (req.query && req.query.session_id) || null;
  if (!sid) return res.status(400).json({ error: "session_id is required" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sid);
    res.status(200).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
