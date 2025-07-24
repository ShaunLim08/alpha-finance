export default async function handler(req, res) {
  const { tokenAddress, walletAddress, chainId = '1' } = req.query;
  const API_KEY = process.env.ONEINCH_API_KEY;
  
  if (!tokenAddress || !walletAddress) {
    return res.status(400).json({ 
      error: 'Missing required parameters: tokenAddress, walletAddress' 
    });
  }
  
  try {
    const params = new URLSearchParams({
      tokenAddress,
      walletAddress
    });
    
    const response = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/approve/allowance?${params}`,
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
    console.error('Error checking allowance:', error);
    res.status(500).json({ error: 'Failed to check allowance' });
  }
}