import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract configuration - WETH Compound Supplier
const CONTRACT_ADDRESS = '0xd891831C0F7034545d55E538265749136720FAC6'; // Your deployed contract address
const WETH_TOKEN_ADDRESS = '0x2D5ee574e710219a521449679A4A7f2B43f046ad'; // Sepolia WETH

// Contract ABI
const CONTRACT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'InvalidInt104', type: 'error' },
  { inputs: [], name: 'InvalidInt256', type: 'error' },
  { inputs: [], name: 'InvalidUInt104', type: 'error' },
  { inputs: [], name: 'InvalidUInt128', type: 'error' },
  { inputs: [], name: 'InvalidUInt64', type: 'error' },
  { inputs: [], name: 'NegativeNumber', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'EmergencyWithdrawal',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'firstSupplyAmount',
        type: 'uint256',
      },
    ],
    name: 'UserOnboarded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'WETHSupplied',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'WETHWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'yieldAmount',
        type: 'uint256',
      },
    ],
    name: 'YieldEarned',
    type: 'event',
  },
  {
    inputs: [],
    name: 'COMET',
    outputs: [
      { internalType: 'contract CometInterface', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_SUPPLY_AMOUNT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_WITHDRAW_AMOUNT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'RATE_SCALE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SECONDS_PER_YEAR',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WETH',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WETH_PRICE_FEED',
    outputs: [
      { internalType: 'contract IPriceFeed', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractWETHBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentSupplyRate',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getDetailedBalance',
    outputs: [
      { internalType: 'uint128', name: 'compoundBalance', type: 'uint128' },
      { internalType: 'uint256', name: 'trackedSupplied', type: 'uint256' },
      { internalType: 'uint256', name: 'estimatedYield', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMarketInfo',
    outputs: [
      { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
      { internalType: 'uint256', name: 'currentUtilization', type: 'uint256' },
      { internalType: 'address', name: 'baseToken', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProtocolStats',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserCompoundBalance',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'totalSupplied', type: 'uint256' },
          { internalType: 'uint256', name: 'lastSupplyTime', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'accumulatedYield',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'hasEverSupplied', type: 'bool' },
        ],
        internalType: 'struct CompoundWETHSupplierFixed.UserInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserWETHAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'supplyWETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSuppliedAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalUsers',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userInfo',
    outputs: [
      { internalType: 'uint256', name: 'totalSupplied', type: 'uint256' },
      { internalType: 'uint256', name: 'lastSupplyTime', type: 'uint256' },
      { internalType: 'uint256', name: 'accumulatedYield', type: 'uint256' },
      { internalType: 'bool', name: 'hasEverSupplied', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawAllWETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdrawWETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawWETHTo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ERC20 ABI for WETH
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
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
];

// Logo components
const CompoundLogo = () => (
  <img src="/Compound.png" alt="Compound" className="w-8 h-8 object-contain" />
);

const WETHLogo = () => (
  <img src="/weth.png" alt="WETH" className="w-6 h-6 object-contain" />
);

const WETHCompoundStakingCard = ({ onDataUpdate }) => {
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [wethBalance, setWethBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    totalSupplied: '0',
    accumulatedYield: '0',
  });
  const [totalSupplied, setTotalSupplied] = useState('0');
  const [currentAPY, setCurrentAPY] = useState('Loading...');
  const [debugInfo, setDebugInfo] = useState('');

  // Send data to parent component when it changes
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({
        totalSupplied: userInfo.totalSupplied,
        yieldEarned: userInfo.accumulatedYield,
      });
    }
  }, [userInfo, onDataUpdate]);

  // Load Web3 data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);

            // WETH contract
            const wethContract = new ethers.Contract(
              WETH_TOKEN_ADDRESS,
              ERC20_ABI,
              provider
            );
            const balance = await wethContract.balanceOf(accounts[0]);
            const formattedBalance = ethers.formatUnits(balance, 18);
            setWethBalance(formattedBalance);

            // Compound supplier contract
            const compoundContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              provider
            );

            // Get detailed balance info
            const detailedBalance = await compoundContract.getDetailedBalance(
              accounts[0]
            );
            console.log('Detailed balance:', detailedBalance);

            // Format the values using proper WETH decimals (18)
            setUserInfo({
              totalSupplied: ethers.formatUnits(
                detailedBalance.trackedSupplied,
                18
              ),
              accumulatedYield: ethers.formatUnits(
                detailedBalance.estimatedYield,
                18
              ),
            });

            // Get total supplied amount
            const totalSuppliedAmount =
              await compoundContract.totalSuppliedAmount();
            setTotalSupplied(ethers.formatUnits(totalSuppliedAmount, 18));

            // Get current APY with better error handling and calculation
            try {
              const supplyRate = await compoundContract.getCurrentSupplyRate();
              // Convert from rate per second to APY percentage
              // supplyRate is scaled by 1e18, annual rate
              const ratePerSecond = Number(supplyRate) / 1e18;
              const annualRate = ratePerSecond * 365 * 24 * 60 * 60;
              const apyPercentage = (annualRate * 100).toFixed(2);
              setCurrentAPY(`${apyPercentage}%`);
            } catch (error) {
              console.error('Error getting APY:', error);
              setCurrentAPY('N/A');
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setDebugInfo(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsTransacting(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      // Convert amount to WETH units (18 decimals)
      const amountInUnits = ethers.parseUnits(amount, 18);

      // First approve the contract to spend WETH
      const wethContract = new ethers.Contract(
        WETH_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      console.log('Approving WETH...');
      const approvalTx = await wethContract.approve(
        CONTRACT_ADDRESS,
        amountInUnits
      );
      await approvalTx.wait();
      console.log('WETH approved');

      // Now supply WETH to Compound
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log('Supplying WETH to Compound...');
      const supplyTx = await compoundContract.supplyWETH(amountInUnits);
      await supplyTx.wait();
      console.log('WETH supplied successfully');

      alert('WETH staked successfully!');
      setAmount('');

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error staking:', error);
      alert('Error staking: ' + error.message);
    } finally {
      setIsTransacting(false);
    }
  };

  const handleWithdrawAll = async () => {
    setIsTransacting(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Withdraw all from Compound
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log('Withdrawing all WETH from Compound...');
      const withdrawTx = await compoundContract.withdrawAllWETH();
      await withdrawTx.wait();
      console.log('All WETH withdrawn successfully');

      alert('All WETH withdrawn successfully!');

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing: ' + error.message);
    } finally {
      setIsTransacting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsTransacting(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Convert amount to WETH units (18 decimals)
      const amountInUnits = ethers.parseUnits(amount, 18);

      // Withdraw from Compound
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log('Withdrawing WETH from Compound...');
      const withdrawTx = await compoundContract.withdrawWETH(amountInUnits);
      await withdrawTx.wait();
      console.log('WETH withdrawn successfully');

      alert('WETH withdrawn successfully!');
      setAmount('');

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing: ' + error.message);
    } finally {
      setIsTransacting(false);
    }
  };

  // Format large numbers
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0.00';
    if (number >= 1000000) return `${(number / 1000000).toFixed(2)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(2)}K`;
    return number.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CompoundLogo />
          <h3 className="text-xl font-bold">Compound WETH</h3>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <WETHLogo />
          <div>
            <p className="text-sm text-gray-600">Token: WETH</p>
            <p className="text-lg font-semibold">APY: {currentAPY}</p>
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
          disabled={isTransacting}
        />
        <p className="text-sm text-gray-600 mt-1">
          Balance: {formatNumber(wethBalance)} WETH
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setActiveTab('stake');
            if (amount) handleStake();
          }}
          disabled={isTransacting}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'stake'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isTransacting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTransacting && activeTab === 'stake' ? 'Staking...' : 'Stake'}
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            if (amount) handleWithdraw();
          }}
          disabled={isTransacting}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'withdraw'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isTransacting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isTransacting && activeTab === 'withdraw'
            ? 'Withdrawing...'
            : 'Withdraw'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supplied:</span>
          <span className="font-medium">
            {formatNumber(totalSupplied)} WETH
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Position:</span>
          <span className="font-medium">
            {formatNumber(userInfo.totalSupplied)} WETH
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Yield Earned:</span>
          <span className="font-medium text-green-600">
            {formatNumber(userInfo.accumulatedYield)} WETH
          </span>
        </div>
      </div>

      {debugInfo && (
        <div className="mt-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
          Debug: {debugInfo}
        </div>
      )}
    </div>
  );
};

export default WETHCompoundStakingCard;
