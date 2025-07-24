export default async function handler(req, res) {
  const {
    src,
    dst,
    amount,
    from,
    slippage = '1',
    disableEstimate = 'false',
    allowPartialFill = 'false',
    chainId = '1'
  } = req.query;
  
  const API_KEY = process.env.ONEINCH_API_KEY;
  
  // Validate required parameters
  if (!src || !dst || !amount || !from) {
    return res.status(400).json({ 
      error: 'Missing required parameters: src, dst, amount, from' 
    });
  }
  
  try {
    const params = new URLSearchParams({
      src,
      dst,
      amount,
      from,
      slippage,
      disableEstimate,
      allowPartialFill
    });
    
    const response = await fetch(
      `https://api.1inch.dev/swap/v6.0/${chainId}/quote?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting swap quote:', error);
    res.status(500).json({ error: 'Failed to get swap quote' });
  }
}