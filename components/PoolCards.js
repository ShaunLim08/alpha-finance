import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Loader2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Coins,
  Briefcase,
} from 'lucide-react';
import { useChainId } from 'wagmi';

const formatNumber = (num) => {
  const numValue = parseFloat(num);
  if (isNaN(numValue)) return 'N/A';
  if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
  if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
  if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
  return `$${numValue.toFixed(2)}`;
};

const formatPercent = (percent) => {
  const num = parseFloat(percent);
  if (isNaN(num)) return 'N/A';
  return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
};

const formatBtcPrice = (price) => {
  return parseFloat(price).toFixed(8);
};

const TrendingTokenCard = ({ token, index }) => {
  const coinData = token.item || token;

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
          <img
            src={coinData.small || coinData.thumb}
            alt={coinData.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/32/888/fff?text=${coinData.symbol[0]}`;
            }}
          />
          <div>
            <div className="font-semibold text-sm">{coinData.name}</div>
            <div className="text-xs text-gray-500 uppercase">
              {coinData.symbol}
            </div>
          </div>
        </div>
        <a
          href={`https://www.coingecko.com/en/coins/${
            coinData.slug || coinData.id
          }`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
        <div>
          <span className="text-gray-500">Market Cap Rank:</span>
          <div className="font-semibold">
            #{coinData.market_cap_rank || 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Price (BTC):</span>
          <div className="font-semibold">
            {coinData.price_btc
              ? `₿${formatBtcPrice(coinData.price_btc)}`
              : 'N/A'}
          </div>
        </div>
        {coinData.data?.price && (
          <>
            <div>
              <span className="text-gray-500">Price (USD):</span>
              <div className="font-semibold">
                ${coinData.data.price.toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">24h Change:</span>
              <div
                className={`font-semibold flex items-center gap-1 ${
                  coinData.data.price_change_percentage_24h?.usd >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {coinData.data.price_change_percentage_24h?.usd >= 0 ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {formatPercent(
                  coinData.data.price_change_percentage_24h?.usd || 0
                )}
              </div>
            </div>
            {coinData.data.market_cap && (
              <div className="col-span-2">
                <span className="text-gray-500">Market Cap:</span>
                <div className="font-semibold">
                  {formatNumber(coinData.data.market_cap)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PoolCard = ({ pool, tokenMap }) => {
  const baseToken = tokenMap[pool.relationships?.base_token?.data?.id];
  const quoteToken = tokenMap[pool.relationships?.quote_token?.data?.id];

  // Fallback to pool name if token symbols aren't available
  const getPoolName = () => {
    if (baseToken?.attributes?.symbol && quoteToken?.attributes?.symbol) {
      return `${baseToken.attributes.symbol} / ${quoteToken.attributes.symbol}`;
    }
    // Use pool name as fallback or parse from pool attributes
    return (
      pool.attributes?.name ||
      pool.attributes?.pool_name ||
      `Pool ${pool.id?.slice(0, 8)}...`
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {baseToken?.attributes?.image_url && (
              <img
                src={baseToken.attributes.image_url}
                alt={baseToken.attributes.symbol}
                className="w-6 h-6 rounded-full border-2 border-white"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            {quoteToken?.attributes?.image_url && (
              <img
                src={quoteToken.attributes.image_url}
                alt={quoteToken.attributes.symbol}
                className="w-6 h-6 rounded-full border-2 border-white"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">{getPoolName()}</div>
            <div className="text-xs text-gray-500">
              {pool.relationships?.dex?.data?.id
                ?.replace(/_/g, ' ')
                .toUpperCase() || 'DEX'}
            </div>
          </div>
        </div>
        <a
          href={`https://etherscan.io/address/${
            pool.attributes?.address || ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">24h Volume:</span>
          <div className="font-semibold">
            {pool.attributes?.volume_usd?.h24
              ? formatNumber(parseFloat(pool.attributes.volume_usd.h24))
              : 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">TVL:</span>
          <div className="font-semibold">
            {pool.attributes?.reserve_in_usd
              ? formatNumber(parseFloat(pool.attributes.reserve_in_usd))
              : 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">24h Change:</span>
          <div
            className={`font-semibold flex items-center gap-1 ${
              parseFloat(pool.attributes?.price_change_percentage?.h24 || 0) >=
              0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {parseFloat(pool.attributes?.price_change_percentage?.h24 || 0) >=
            0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {pool.attributes?.price_change_percentage?.h24
              ? formatPercent(pool.attributes.price_change_percentage.h24)
              : 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">24h Txns:</span>
          <div className="font-semibold">
            {pool.attributes?.transactions?.h24
              ? pool.attributes.transactions.h24.buys +
                pool.attributes.transactions.h24.sells
              : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

const TopGainerCard = ({ coin, index, isLoser = false }) => {
  const changePercentage = coin.usd_1y_change || 0;
  const isPositive = changePercentage >= 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
          <img
            src={coin.image}
            alt={coin.name}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/32/888/fff?text=${coin.symbol[0]}`;
            }}
          />
          <div>
            <div className="font-semibold text-sm">{coin.name}</div>
            <div className="text-xs text-gray-500 uppercase">{coin.symbol}</div>
          </div>
        </div>
        <a
          href={`https://www.coingecko.com/en/coins/${coin.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
        <div>
          <span className="text-gray-500">Market Cap Rank:</span>
          <div className="font-semibold">#{coin.market_cap_rank || 'N/A'}</div>
        </div>
        <div>
          <span className="text-gray-500">Price (USD):</span>
          <div className="font-semibold">{formatNumber(coin.usd)}</div>
        </div>
        <div>
          <span className="text-gray-500">24h Volume:</span>
          <div className="font-semibold">{formatNumber(coin.usd_24h_vol)}</div>
        </div>
        <div>
          <span className="text-gray-500">24h Change:</span>
          <div
            className={`font-semibold flex items-center gap-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {formatPercent(changePercentage)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PoolCards = () => {
  const chainId = useChainId();
  const [trendingPools, setTrendingPools] = useState([]);
  const [topPools, setTopPools] = useState([]);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [topGainersLosers, setTopGainersLosers] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingTrendingTokens, setLoadingTrendingTokens] = useState(true);
  const [loadingGainersLosers, setLoadingGainersLosers] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoolData();
  }, [chainId]);

  const fetchPoolData = async () => {
    setLoadingTrending(true);
    setLoadingTop(true);
    setLoadingTrendingTokens(true);
    setLoadingGainersLosers(true);
    setError(null);

    try {
      // Fetch trending pools
      const trendingResponse = await fetch(
        `/api/coingecko/trending-pools?network=${chainId}`
      );
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingPools(trendingData);
      }

      // Fetch top pools
      const topResponse = await fetch(
        `/api/coingecko/top-pools?network=${chainId}`
      );
      if (topResponse.ok) {
        const topData = await topResponse.json();
        setTopPools(topData);
      }

      // Fetch trending tokens
      const trendingTokensResponse = await fetch(
        `/api/coingecko/trending-tokens`
      );
      if (trendingTokensResponse.ok) {
        const trendingTokensData = await trendingTokensResponse.json();
        setTrendingTokens(trendingTokensData);
      }

      // Fetch top gainers and losers
      const gainersLosersResponse = await fetch(
        `/api/coingecko/top-gainers-losers?chainId=${chainId}`
      );
      if (gainersLosersResponse.ok) {
        const gainersLosersData = await gainersLosersResponse.json();
        setTopGainersLosers(gainersLosersData);
      }
    } catch (err) {
      console.error('Error fetching pool data:', err);
      setError('Failed to fetch pool data');
    } finally {
      setLoadingTrending(false);
      setLoadingTop(false);
      setLoadingTrendingTokens(false);
      setLoadingGainersLosers(false);
    }
  };

  // Create token map for easy lookup
  const createTokenMap = (data) => {
    const map = {};
    if (data.included) {
      data.included.forEach((item) => {
        if (item.type === 'token') {
          map[item.id] = item;
        }
      });
    }
    return map;
  };

  const renderPoolList = (pools, loading, title, icon) => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      );
    }

    const tokenMap = createTokenMap(pools);
    const poolList = pools.data?.slice(0, 10) || []; // Show more pools since we're making it scrollable

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {poolList.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {poolList.map((pool, index) => (
              <PoolCard
                key={pool.id || index}
                pool={pool}
                tokenMap={tokenMap}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No pools available</p>
        )}
      </div>
    );
  };

  const renderTrendingTokensList = (tokens, loading, title, icon) => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      );
    }

    const tokenList = tokens.coins?.slice(0, 7) || [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {tokenList.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {tokenList.map((token, index) => (
              <TrendingTokenCard
                key={token.item?.id || index}
                token={token}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No trending tokens available
          </p>
        )}
      </div>
    );
  };

  const renderGainersLosersList = (data, loading, title, icon) => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      );
    }

    const gainers = data.top_gainers?.slice(0, 5) || [];
    const losers = data.top_losers?.slice(0, 5) || [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {gainers.length > 0 || losers.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {gainers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
                  <ArrowUp className="w-4 h-4" />
                  Top Gainers
                </h4>
                <div className="space-y-2">
                  {gainers.map((coin, index) => (
                    <TopGainerCard
                      key={coin.id}
                      coin={coin}
                      index={index}
                      isLoser={false}
                    />
                  ))}
                </div>
              </div>
            )}
            {losers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <ArrowDown className="w-4 h-4" />
                  Top Losers
                </h4>
                <div className="space-y-2">
                  {losers.map((coin, index) => (
                    <TopGainerCard
                      key={coin.id}
                      coin={coin}
                      index={index}
                      isLoser={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No gainers/losers data available
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      {renderPoolList(
        trendingPools,
        loadingTrending,
        'Trending Pools',
        <TrendingUp className="w-5 h-5 text-orange-500" />
      )}
      {renderPoolList(
        topPools,
        loadingTop,
        'Top Pools',
        <Award className="w-5 h-5 text-blue-500" />
      )}
      {renderTrendingTokensList(
        trendingTokens,
        loadingTrendingTokens,
        'Trending Tokens',
        <Coins className="w-5 h-5 text-green-500" />
      )}
      {renderGainersLosersList(
        topGainersLosers,
        loadingGainersLosers,
        'Top Gainers & Losers',
        <Briefcase className="w-5 h-5 text-purple-500" />
      )}
    </div>
  );
};
