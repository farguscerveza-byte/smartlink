// Vercel Serverless Function: /api/subscribe
// v1 placeholder: just logs the email into Redis as a simple list.
// Later, swap this out to call Mailchimp/ConvertKit/Beehiiv's API instead.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, release } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!release || typeof release !== 'string') {
    return res.status(400).json({ error: 'Missing release' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    await fetch(`${url}/lpush/subscribers:${encodeURIComponent(release)}/${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save email' });
  }
}
