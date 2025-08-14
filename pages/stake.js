import React, { useState, useCallback, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import AaveStakingCard from '../components/AaveStakingCard';
import CompoundStakingCard from '../components/CompoundStakingCard';
import WETHCompoundStakingCard from '../components/WETHCompoundStakingCard';

export default function Stake() {
  const [isConnected, setIsConnected] = useState(true);

  // State to track staking data from all three platforms
  const [stakingData, setStakingData] = useState({
    aave: { totalSupplied: 0, yieldEarned: 0 },
    compound: { totalSupplied: 0, yieldEarned: 0 },
    wethCompound: { totalSupplied: 0, yieldEarned: 0 },
  });

  // State for token prices
  const [tokenPrices, setTokenPrices] = useState({
    link: 0,
    weth: 0,
    usdc: 0,
  });

  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Fetch token prices from CoinGecko API
  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        setIsLoadingPrices(true);

        // CoinGecko API endpoint for multiple tokens
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=chainlink,weth,usd-coin&vs_currencies=usd&include_24hr_change=true'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const data = await response.json();

        setTokenPrices({
          link: data.chainlink?.usd || 0,
          weth: data.weth?.usd || 0,
          usdc: data['usd-coin']?.usd || 1, // USDC should be close to $1
        });

        console.log('Fetched token prices:', data);
      } catch (error) {
        console.error('Error fetching token prices:', error);
        // Fallback prices if API fails
        setTokenPrices({
          link: 15, // Approximate fallback
          weth: 2500, // Approximate fallback
          usdc: 1, // USDC stable coin
        });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchTokenPrices();

    // Refresh prices every 5 minutes
    const interval = setInterval(fetchTokenPrices, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Callback functions to receive data from each staking card
  const updateAaveData = useCallback((data) => {
    setStakingData((prev) => ({
      ...prev,
      aave: {
        totalSupplied: parseFloat(data.totalSupplied) || 0,
        yieldEarned: parseFloat(data.yieldEarned) || 0,
      },
    }));
  }, []);

  const updateCompoundData = useCallback((data) => {
    setStakingData((prev) => ({
      ...prev,
      compound: {
        totalSupplied: parseFloat(data.totalSupplied) || 0,
        yieldEarned: parseFloat(data.yieldEarned) || 0,
      },
    }));
  }, []);

  const updateWETHCompoundData = useCallback((data) => {
    setStakingData((prev) => ({
      ...prev,
      wethCompound: {
        totalSupplied: parseFloat(data.totalSupplied) || 0,
        yieldEarned: parseFloat(data.yieldEarned) || 0,
      },
    }));
  }, []);

  // Calculate totals in USD
  const totalStakedUSD =
    stakingData.aave.totalSupplied * tokenPrices.link +
    stakingData.compound.totalSupplied * tokenPrices.usdc +
    stakingData.wethCompound.totalSupplied * tokenPrices.weth;

  const totalEarnedUSD =
    stakingData.aave.yieldEarned * tokenPrices.link +
    stakingData.compound.yieldEarned * tokenPrices.usdc +
    stakingData.wethCompound.yieldEarned * tokenPrices.weth;

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          Stake Your Tokens on Testnet!
        </h1>

        {!isConnected ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <div className="text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Connect your wallet to start staking
              </p>
              <p className="text-sm text-gray-500">
                Use the connect button in the navigation bar
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <AaveStakingCard onDataUpdate={updateAaveData} />
              <CompoundStakingCard onDataUpdate={updateCompoundData} />
              <WETHCompoundStakingCard onDataUpdate={updateWETHCompoundData} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">
                Your Staking Overview
              </h2>

              {isLoadingPrices && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Loading token prices...
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Total Staked</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    ${totalStakedUSD.toFixed(2)}
                  </p>
                  {!isLoadingPrices && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div>
                        LINK: {stakingData.aave.totalSupplied.toFixed(4)} × $
                        {tokenPrices.link.toFixed(2)}
                      </div>
                      <div>
                        USDC: {stakingData.compound.totalSupplied.toFixed(2)} ×
                        ${tokenPrices.usdc.toFixed(2)}
                      </div>
                      <div>
                        WETH:{' '}
                        {stakingData.wethCompound.totalSupplied.toFixed(4)} × $
                        {tokenPrices.weth.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalEarnedUSD.toFixed(2)}
                  </p>
                  {!isLoadingPrices && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div>
                        LINK: {stakingData.aave.yieldEarned.toFixed(4)} × $
                        {tokenPrices.link.toFixed(2)}
                      </div>
                      <div>
                        USDC: {stakingData.compound.yieldEarned.toFixed(4)} × $
                        {tokenPrices.usdc.toFixed(2)}
                      </div>
                      <div>
                        WETH: {stakingData.wethCompound.yieldEarned.toFixed(4)}{' '}
                        × ${tokenPrices.weth.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
