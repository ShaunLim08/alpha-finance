import React, { useState } from 'react';

// Aave Logo Component
const AaveLogo = () => (
  <svg className="w-8 h-8" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="128" fill="#B6509E" />
    <path d="M128 64L168 192H152L144 168H112L104 192H88L128 64Z" fill="white" />
  </svg>
);

// AAVE Token Logo
const AAVETokenLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="128" fill="#B6509E" />
    <path
      d="M128 64L168 192H152L144 168H112L104 192H88L128 64Z"
      fill="white"
      opacity="0.9"
    />
  </svg>
);

const AaveStakingCard = ({ walletBalance = '0' }) => {
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');

  const handleStake = () => {
    console.log(`Staking ${amount} AAVE in Aave protocol`);
    // Add AAVE token address here when integrating: 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing ${amount} AAVE from Aave protocol`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AaveLogo />
          <h3 className="text-xl font-bold">Aave</h3>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <AAVETokenLogo />
          <div>
            <p className="text-sm text-gray-600">Token: Link</p>
            <p className="text-lg font-semibold">APY: 6.9%</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">Type: Vault / Pool</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <p className="text-sm text-gray-600 mt-1">
          Balance: {walletBalance} AAVE
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setActiveTab('stake');
            if (amount) handleStake();
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'stake'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Stake
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            if (amount) handleWithdraw();
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'withdraw'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Withdraw
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Current Position:</span>
          <span className="font-medium">100 AAVE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Yield Earned:</span>
          <span className="font-medium text-green-600">0.4 AAVE</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supplied:</span>
          <span className="font-medium">6 Million</span>
        </div>
      </div>
    </div>
  );
};

export default AaveStakingCard;
