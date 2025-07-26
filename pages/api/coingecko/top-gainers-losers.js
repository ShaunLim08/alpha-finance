export default async function handler(req, res) {
  const { chainId } = req.query;

  try {
    const response = await fetch(
      'https://pro-api.coingecko.com/api/v3/coins/top_gainers_losers',
      {
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.COINGECKO_PRO_API_KEY,
        },
      }
    );

    if (!response.ok) {
      // If pro API fails, fall back to comprehensive coin list
      console.log(`Pro API not available (${response.status}), using fallback`);

      // Fetch a larger dataset to get more diverse coins
      const fallbackResponse = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
          },
        }
      );

      if (!fallbackResponse.ok) {
        throw new Error(
          `Fallback API responded with status ${fallbackResponse.status}`
        );
      }

      const fallbackData = await fallbackResponse.json();

      // If chainId is provided, try to get chain-specific tokens
      let filteredData = fallbackData;

      if (chainId) {
        try {
          // Fetch token list for the specific chain
          const tokenListResponse = await fetch(
            `${
              req.headers.origin || 'http://localhost:3000'
            }/api/tokens?chainId=${chainId}`
          );

          if (tokenListResponse.ok) {
            const tokenListData = await tokenListResponse.json();
            const chainTokenSymbols = new Set(
              Object.values(tokenListData).map((token) =>
                token.symbol.toLowerCase()
              )
            );

            // Filter coins that exist on the specific chain
            const chainSpecificCoins = fallbackData.filter((coin) =>
              chainTokenSymbols.has(coin.symbol.toLowerCase())
            );

            // Use chain-specific coins if we have enough, otherwise fall back to all coins
            if (chainSpecificCoins.length >= 20) {
              filteredData = chainSpecificCoins;
            }
          }
        } catch (tokenError) {
          console.log('Could not fetch chain-specific tokens, using all coins');
        }
      }

      // Sort by 24h price change to get real gainers and losers
      const sortedByChange = filteredData
        .filter(
          (coin) =>
            coin.price_change_percentage_24h !== null &&
            coin.price_change_percentage_24h !== undefined
        )
        .sort(
          (a, b) =>
            b.price_change_percentage_24h - a.price_change_percentage_24h
        );

      // Transform to match the expected structure
      const mockData = {
        top_gainers: sortedByChange.slice(0, 10).map((coin) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          market_cap_rank: coin.market_cap_rank,
          usd: coin.current_price,
          usd_24h_vol: coin.total_volume,
          usd_1y_change: coin.price_change_percentage_24h, // Use 24h change since we don't have 1y data
        })),
        top_losers: sortedByChange
          .slice(-10)
          .reverse()
          .map((coin) => ({
            // Reverse to show biggest losers first
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image,
            market_cap_rank: coin.market_cap_rank,
            usd: coin.current_price,
            usd_24h_vol: coin.total_volume,
            usd_1y_change: coin.price_change_percentage_24h, // Use actual negative percentage
          })),
      };

      return res.status(200).json(mockData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching top gainers/losers:', error);
    res.status(500).json({ error: 'Failed to fetch top gainers and losers' });
  }
}
