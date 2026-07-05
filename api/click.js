// Vercel Serverless Function: /api/click
// Increments a per-platform counter in Upstash Redis (free tier: https://upstash.com)
//
// Setup:
// 1. Create a free Upstash Redis database.
// 2. In your Vercel project settings, add env vars:
//      UPSTASH_REDIS_REST_URL
//      UPSTASH_REDIS_REST_TOKEN
// 3. Deploy. That's it — no other backend needed.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform, release } = req.body || {};
  if (!platform || typeof platform !== 'string') {
    return res.status(400).json({ error: 'Missing platform' });
  }
  if (!release || typeof release !== 'string') {
    return res.status(400).json({ error: 'Missing release' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  try {
    // INCR clicks:<release>:<platform> and INCR clicks:<release>:total
    await fetch(`${url}/incr/clicks:${encodeURIComponent(release)}:${encodeURIComponent(platform)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetch(`${url}/incr/clicks:${encodeURIComponent(release)}:total`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log click' });
  }
}
