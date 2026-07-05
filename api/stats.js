// Vercel Serverless Function: /api/stats?key=YOUR_SECRET
// Returns click counts as JSON. Basic shared-secret protection so randoms can't see your numbers.
//
// Set STATS_KEY as an env var in Vercel to whatever password you want.

export default async function handler(req, res) {
  const { key, release } = req.query;
  if (!process.env.STATS_KEY || key !== process.env.STATS_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!release || typeof release !== 'string') {
    return res.status(400).json({ error: 'Missing release' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  const platforms = ['spotify', 'apple_music', 'tidal'];
  const results = {};

  try {
    for (const p of platforms) {
      const r = await fetch(`${url}/get/clicks:${encodeURIComponent(release)}:${p}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      results[p] = Number(data.result) || 0;
    }
    const totalRes = await fetch(`${url}/get/clicks:${encodeURIComponent(release)}:total`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const totalData = await totalRes.json();
    results.total = Number(totalData.result) || 0;

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read stats' });
  }
}
