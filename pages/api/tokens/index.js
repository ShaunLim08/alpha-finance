export default async function handler(req, res) {
  const { chainId = '1' } = req.query;
  const API_KEY = process.env.ONEINCH_API_KEY;

  // Validate chainId
  const supportedChains = ['1', '56', '137', '10', '42161'];
  if (!supportedChains.includes(chainId)) {
    return res.status(400).json({ error: 'Unsupported chain' });
  }

  try {
    const response = await fetch(
      `https://api.1inch.dev/token/v1.2/${chainId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Failed to fetch token list' });
  }
}
