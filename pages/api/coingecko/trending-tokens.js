export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: {
          accept: 'application/json',
          // Add your CoinGecko API key here if you have one
          // 'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    res.status(500).json({ error: 'Failed to fetch trending tokens' });
  }
}
