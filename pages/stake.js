import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import AaveStakingCard from '../components/AaveStakingCard';
import CompoundStakingCard from '../components/CompoundStakingCard';
import CurveStakingCard from '../components/CurveStakingCard';

export default function Stake() {
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Alpha Finance</h1>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isConnected ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </div>

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
                <AaveStakingCard />
                <CompoundStakingCard />
                <CurveStakingCard />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">
                  Your Staking Overview
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Staked</p>
                    <p className="text-2xl font-bold">$300.00</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">$1.20</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Average APY</p>
                    <p className="text-2xl font-bold text-blue-600">6.9%</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
