import React, { useState, useEffect } from 'react';

// USDC Token Address for Compound
const USDC_TOKEN_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// ERC20 ABI - Only includes the methods we need
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

// Compound Logo Component
const CompoundLogo = () => (
  <svg className="w-8 h-8" viewBox="0 0 256 256" fill="none">
    <rect width="256" height="256" rx="128" fill="#00D395" />
    <path
      d="M128 64C128 64 88 96 88 128C88 160 108 192 128 192C148 192 168 160 168 128C168 96 128 64 128 64Z"
      fill="white"
    />
  </svg>
);

// USDC Token Logo
const USDCLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#2775CA" />
    <path
      d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4zm0 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S6 21.5 6 16 10.5 6 16 6zm0 2c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"
      fill="white"
    />
    <path
      d="M17.5 11.5v1.2c1.1.3 1.9 1.3 1.9 2.5 0 .6-.5 1.1-1.1 1.1s-1.1-.5-1.1-1.1c0-.3-.2-.5-.5-.5s-.5.2-.5.5c0 .8.5 1.5 1.2 1.7v1.2c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1v-1.2c1.1-.3 1.9-1.3 1.9-2.5 0-1.4-1.1-2.5-2.5-2.5-.3 0-.5-.2-.5-.5s.2-.5.5-.5 .5.2.5.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1c0-1.2-.8-2.2-1.9-2.5v-1.2c0-.6-.5-1.1-1.1-1.1s-1.1.5-1.1 1.1z"
      fill="white"
    />
  </svg>
);

const CompoundStakingCard = () => {
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Check if Web3 is available
        if (typeof window.ethereum !== 'undefined') {
          // Request account access if needed
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            // Import ethers if you're using it, or use Web3.js
            const { ethers } = await import('ethers');

            // Create provider and contract instance
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
              USDC_TOKEN_ADDRESS,
              ERC20_ABI,
              provider
            );

            // Get balance
            const balance = await contract.balanceOf(accounts[0]);
            const decimals = await contract.decimals();

            // Format balance (USDC has 6 decimals)
            const formattedBalance = ethers.utils.formatUnits(
              balance,
              decimals
            );
            setUsdcBalance(formattedBalance);
          }
        }
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        setUsdcBalance('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up interval to refresh balance
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStake = () => {
    console.log(`Staking ${amount} USDC in Compound protocol`);
    // Implement staking logic here
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing ${amount} USDC from Compound protocol`);
    // Implement withdrawal logic here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CompoundLogo />
          <h3 className="text-xl font-bold">Compound</h3>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <USDCLogo />
          <div>
            <p className="text-sm text-gray-600">Token: USDC</p>
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
          Balance:{' '}
          {isLoading
            ? 'Loading...'
            : `${parseFloat(usdcBalance).toFixed(2)} USDC`}
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
          <span className="font-medium">100 USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Yield Earned:</span>
          <span className="font-medium text-green-600">0.4 USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supplied:</span>
          <span className="font-medium">6 Million</span>
        </div>
      </div>
    </div>
  );
};

export default CompoundStakingCard;
