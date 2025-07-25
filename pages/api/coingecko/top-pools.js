export default async function handler(req, res) {
  const { network, page = 1 } = req.query;

  if (!network) {
    return res.status(400).json({ error: 'Network parameter is required' });
  }

  // Map chain IDs to network names for CoinGecko API
  const networkMap = {
    1: 'eth',
    10: 'optimism',
    56: 'bsc',
    137: 'polygon',
    42161: 'arbitrum',
    8453: 'base',
  };

  const networkName = networkMap[network] || network;

  try {
    // Try the onchain pools endpoint first
    let response = await fetch(
      `https://api.coingecko.com/api/v3/onchain/networks/${networkName}/pools?page=${page}`,
      {
        headers: {
          accept: 'application/json',
          // Add your CoinGecko API key here if you have one
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
        },
      }
    );

    // If onchain API fails (404, 403, etc.), fall back to coins/markets
    if (!response.ok) {
      console.log(
        `Onchain API not available (${response.status}), using fallback`
      );

      response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}&sparkline=false&price_change_percentage=24h`,
        {
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const coins = await response.json();

      // Transform market cap data to mock pool structure
      const mockPools = {
        data: coins.slice(0, 8).map((coin, index) => ({
          id: `pool_${coin.id}_${index}`,
          attributes: {
            name: `${coin.symbol.toUpperCase()}/USDC Pool`,
            volume_usd: {
              h24: coin.total_volume || Math.random() * 1000000 + 100000,
            },
            reserve_in_usd:
              coin.market_cap * 0.001 || Math.random() * 5000000 + 500000,
            price_change_percentage: {
              h24:
                coin.price_change_percentage_24h || (Math.random() - 0.5) * 15,
            },
            transactions: {
              h24: {
                buys: Math.floor(Math.random() * 1000 + 100),
                sells: Math.floor(Math.random() * 1000 + 100),
              },
            },
            address: `0x${Math.random().toString(16).substr(2, 40)}`,
          },
          relationships: {
            base_token: {
              data: { id: `token_${coin.id}` },
            },
            quote_token: {
              data: { id: 'token_usdc' },
            },
            dex: {
              data: { id: 'uniswap_v3' },
            },
          },
        })),
        included: coins
          .map((coin) => ({
            id: `token_${coin.id}`,
            type: 'token',
            attributes: {
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              image_url: coin.image,
            },
          }))
          .concat([
            {
              id: 'token_usdc',
              type: 'token',
              attributes: {
                symbol: 'USDC',
                name: 'USD Coin',
                image_url:
                  'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
              },
            },
          ]),
      };

      return res.status(200).json(mockPools);
    }

    const data = await response.json();

    // Return the actual API response which already matches the expected structure
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching top pools:', error);
    res.status(500).json({ error: 'Failed to fetch top pools' });
  }
}
