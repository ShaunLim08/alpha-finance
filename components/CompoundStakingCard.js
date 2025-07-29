import React, { useState, useEffect } from 'react';

// Contract configuration
const CONTRACT_ADDRESS = '0xE1E084024d399D52aB094b44259A5b21bEF38641';
const USDC_TOKEN_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'supplyUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdrawUSDC',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'struct CompoundUSDCSupplier.UserInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserCompoundBalance',
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
    inputs: [],
    name: 'totalSuppliedAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ERC20 ABI for USDC
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

// Logo components using images from public directory
const CompoundLogo = () => (
  <img src="/Compound.png" alt="Compound" className="w-8 h-8 object-contain" />
);

const USDCLogo = () => (
  <img src="/USDC.png" alt="USDC" className="w-6 h-6 object-contain" />
);

const CompoundStakingCard = () => {
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    totalSupplied: '0',
    accumulatedYield: '0',
  });
  const [totalSupplied, setTotalSupplied] = useState('0');
  const [currentAPY, setCurrentAPY] = useState('6.9');

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
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // USDC contract
            const usdcContract = new ethers.Contract(
              USDC_TOKEN_ADDRESS,
              ERC20_ABI,
              provider
            );
            const balance = await usdcContract.balanceOf(accounts[0]);
            const formattedBalance = ethers.utils.formatUnits(balance, 6);
            setUsdcBalance(formattedBalance);

            // Compound supplier contract
            const compoundContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              provider
            );

            // Get user info
            const userInfoData = await compoundContract.getUserInfo(
              accounts[0]
            );
            setUserInfo({
              totalSupplied: ethers.utils.formatUnits(
                userInfoData.totalSupplied,
                6
              ),
              accumulatedYield: ethers.utils.formatUnits(
                userInfoData.accumulatedYield,
                6
              ),
            });

            // Get total supplied
            const totalSuppliedAmount =
              await compoundContract.totalSuppliedAmount();
            setTotalSupplied(ethers.utils.formatUnits(totalSuppliedAmount, 6));

            // Get current APY
            try {
              const supplyRate = await compoundContract.getCurrentSupplyRate();
              // Convert from Compound's format to APY percentage
              const apyPercentage =
                ((supplyRate * 365 * 24 * 60 * 60) / 1e18) * 100;
              setCurrentAPY(apyPercentage.toFixed(1));
            } catch {
              // Use default if rate fetch fails
              setCurrentAPY('6.9');
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15 seconds

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      // Convert amount to USDC units (6 decimals)
      const amountInUnits = ethers.utils.parseUnits(amount, 6);

      // First approve the contract to spend USDC
      const usdcContract = new ethers.Contract(
        USDC_TOKEN_ADDRESS,
        ERC20_ABI,
        signer
      );

      // Check current allowance
      const currentAllowance = await usdcContract.allowance(
        accounts[0],
        CONTRACT_ADDRESS
      );

      if (currentAllowance.lt(amountInUnits)) {
        console.log('Approving USDC...');
        const approveTx = await usdcContract.approve(
          CONTRACT_ADDRESS,
          amountInUnits
        );
        await approveTx.wait();
        console.log('USDC approved');
      }

      // Now stake the USDC
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      console.log('Staking USDC...');
      const stakeTx = await compoundContract.supplyUSDC(amountInUnits);
      await stakeTx.wait();

      alert('Successfully staked ' + amount + ' USDC!');
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Withdraw all from Compound
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      console.log('Withdrawing all USDC...');
      const withdrawTx = await compoundContract.withdrawAllUSDC();
      await withdrawTx.wait();

      alert('Successfully withdrawn all USDC!');
      setAmount('');

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error withdrawing all:', error);
      alert('Error withdrawing all: ' + error.message);
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Convert amount to USDC units (6 decimals)
      const amountInUnits = ethers.utils.parseUnits(amount, 6);

      // Withdraw from Compound
      const compoundContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      console.log('Withdrawing USDC...');
      const withdrawTx = await compoundContract.withdrawUSDC(amountInUnits);
      await withdrawTx.wait();

      alert('Successfully withdrawn ' + amount + ' USDC!');
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
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + ' Million';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toFixed(2);
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
            <p className="text-lg font-semibold">APY: {currentAPY}%</p>
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
            if (amount && !isTransacting) handleStake();
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
            if (amount && !isTransacting) handleWithdraw();
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
          <span className="text-gray-600">Current Position:</span>
          <span className="font-medium">
            {parseFloat(userInfo.totalSupplied).toFixed(2)} USDC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Yield Earned:</span>
          <span className="font-medium text-green-600">
            {parseFloat(userInfo.accumulatedYield).toFixed(4)} USDC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supplied:</span>
          <span className="font-medium">{formatNumber(totalSupplied)}</span>
        </div>
      </div>
    </div>
  );
};

export default CompoundStakingCard;
