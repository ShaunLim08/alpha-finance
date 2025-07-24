export default async function handler(req, res) {
  const { query, chainId = '1', limit = '10' } = req.query;
  const API_KEY = process.env.ONEINCH_API_KEY;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  try {
    const params = new URLSearchParams({
      query,
      limit,
      ignore_listed: 'false'
    });
    
    const response = await fetch(
      `https://api.1inch.dev/token/v1.2/${chainId}/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error searching tokens:', error);
    res.status(500).json({ error: 'Failed to search tokens' });
  }
}