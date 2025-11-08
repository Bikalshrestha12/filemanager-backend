const express = require('express');
const router = express.Router();
const { getSpeedInsights } = require('@vercel/speed-insights');

// GET /api/insights?url=https://example.com
router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).json({ message: 'URL is required' });

  try {
    const metrics = await getSpeedInsights(url, {
      strategy: 'desktop', // or 'mobile'
    });

    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching Speed Insights', error: err.message });
  }
});

module.exports = router;
