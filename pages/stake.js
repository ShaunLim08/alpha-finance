import React, { useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import AaveStakingCard from '../components/AaveStakingCard';
import CompoundStakingCard from '../components/CompoundStakingCard';
import CurveStakingCard from '../components/CurveStakingCard';

export default function Stake() {
  const [isConnected, setIsConnected] = useState(true);

  // State to track staking data from all three platforms
  const [stakingData, setStakingData] = useState({
    aave: { totalSupplied: 0, yieldEarned: 0 },
    compound: { totalSupplied: 0, yieldEarned: 0 },
    curve: { totalSupplied: 0, yieldEarned: 0 },
  });

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

  const updateCurveData = useCallback((data) => {
    setStakingData((prev) => ({
      ...prev,
      curve: {
        totalSupplied: parseFloat(data.totalSupplied) || 0,
        yieldEarned: parseFloat(data.yieldEarned) || 0,
      },
    }));
  }, []);

  // Calculate totals
  const totalStaked =
    stakingData.aave.totalSupplied +
    stakingData.compound.totalSupplied +
    stakingData.curve.totalSupplied;
  const totalEarned =
    stakingData.aave.yieldEarned +
    stakingData.compound.yieldEarned +
    stakingData.curve.yieldEarned;

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Stake Your Tokens
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
              <CurveStakingCard onDataUpdate={updateCurveData} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">
                Your Staking Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Staked</p>
                  <p className="text-2xl font-bold">
                    ${totalStaked.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${totalEarned.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
