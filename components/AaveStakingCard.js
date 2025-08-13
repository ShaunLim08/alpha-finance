import React, { useState, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';

// ABI for MarketInteractions contract
const MARKET_INTERACTIONS_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_addressProvider', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ADDRESSES_PROVIDER',
    outputs: [
      {
        internalType: 'contract IPoolAddressesProvider',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'POOL',
    outputs: [{ internalType: 'contract IPool', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_poolContractAddress',
        type: 'address',
      },
    ],
    name: 'allowanceLINK',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      {
        internalType: 'address',
        name: '_poolContractAddress',
        type: 'address',
      },
    ],
    name: 'approveLINK',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_rate', type: 'uint256' }],
    name: 'convertRateToAPY',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_rate', type: 'uint256' }],
    name: 'convertRateToAPYReadable',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getALINKTokenAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_tokenAddress', type: 'address' },
    ],
    name: 'getBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getCurrentLINKPosition',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLINKSupplyRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_asset', type: 'address' }],
    name: 'getReserveDataWithUtilization',
    outputs: [
      { internalType: 'uint256', name: 'totalLiquidity', type: 'uint256' },
      { internalType: 'uint256', name: 'availableLiquidity', type: 'uint256' },
      { internalType: 'uint256', name: 'totalBorrows', type: 'uint256' },
      { internalType: 'uint256', name: 'utilizationRate', type: 'uint256' },
      { internalType: 'uint256', name: 'supplyRate', type: 'uint256' },
      { internalType: 'uint256', name: 'variableBorrowRate', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_asset', type: 'address' }],
    name: 'getSupplyRate',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getTotalSupplied',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUserALINKBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_userAddress', type: 'address' },
    ],
    name: 'getUserAccountData',
    outputs: [
      { internalType: 'uint256', name: 'totalCollateralBase', type: 'uint256' },
      { internalType: 'uint256', name: 'totalDebtBase', type: 'uint256' },
      {
        internalType: 'uint256',
        name: 'availableBorrowsBase',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentLiquidationThreshold',
        type: 'uint256',
      },
      { internalType: 'uint256', name: 'ltv', type: 'uint256' },
      { internalType: 'uint256', name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUserLINKBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getUserPositionData',
    outputs: [
      { internalType: 'uint256', name: 'totalSupplied', type: 'uint256' },
      { internalType: 'uint256', name: 'totalWithdrawn', type: 'uint256' },
      { internalType: 'uint256', name: 'netPosition', type: 'uint256' },
      {
        internalType: 'uint256',
        name: 'currentATokenBalance',
        type: 'uint256',
      },
      { internalType: 'uint256', name: 'yieldEarned', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getYieldEarned',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'supplyLINKDirectly',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_tokenAddress', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'supplyLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userOriginalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userTotalSupplied',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userTotalWithdrawn',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_tokenAddress', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'withdrawLINKFromAave',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_tokenAddress', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'withdrawLiquidity',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

// Contract addresses (you'll need to deploy and update these)
const MARKET_INTERACTIONS_CONTRACT =
  '0xc8D58A37b72aB6427928d80Fa84479843ceF1393'; // Replace with actual deployed contract address
const LINK_TOKEN_ADDRESS = '0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5'; // Sepolia LINK
// We'll get the aToken address dynamically from the Pool contract

// ERC20 ABI for LINK token approval
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Aave Logo Component
const AaveLogo = () => (
  <img src="/aave.png" alt="Aave Logo" className="w-8 h-8" />
);

// LINK Token Logo
const LINKTokenLogo = () => (
  <img src="/chainlink.png" alt="LINK Token Logo" className="w-6 h-6" />
);

const AaveStakingCard = ({ walletBalance = '0', onDataUpdate }) => {
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [supplyRate, setSupplyRate] = useState('0');
  const [apy, setAPY] = useState('0');
  const [linkTokenBalance, setLinkTokenBalance] = useState('0');
  const [currentPosition, setCurrentPosition] = useState('0');
  const [yieldEarned, setYieldEarned] = useState('0');
  const [totalSupplied, setTotalSupplied] = useState('0');
  const [isWithdrawMode, setIsWithdrawMode] = useState(false);

  const { address, isConnected } = useAccount();

  // Send data to parent component when it changes
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate({
        totalSupplied: currentPosition,
        yieldEarned: yieldEarned,
      });
    }
  }, [currentPosition, yieldEarned, onDataUpdate]);

  // Read contract data
  const { data: linkSupplyRate } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getLINKSupplyRate',
    enabled:
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Read user's LINK token balance
  const { data: linkBalance } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getUserLINKBalance',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Read user's aLINK balance directly from contract
  const { data: aTokenBalance } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getUserALINKBalance',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Get reserve data for more comprehensive information
  const { data: reserveData } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getReserveDataWithUtilization',
    args: [LINK_TOKEN_ADDRESS],
    enabled:
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Get aToken address for withdrawals
  const { data: aTokenAddress } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getALINKTokenAddress',
    enabled:
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  const { data: userAccountData } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getUserAccountData',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Write contract functions
  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContract: approveLINK,
  } = useWriteContract();

  const {
    data: supplyHash,
    isPending: isSupplyPending,
    writeContract: supplyLiquidity,
  } = useWriteContract();

  const {
    data: withdrawHash,
    isPending: isWithdrawPending,
    writeContract: withdrawLiquidity,
  } = useWriteContract();

  const {
    data: aTokenApproveHash,
    isPending: isATokenApprovePending,
    writeContract: approveAToken,
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isSupplyConfirming, isSuccess: isSupplySuccess } =
    useWaitForTransactionReceipt({
      hash: supplyHash,
    });

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  const {
    isLoading: isATokenApproveConfirming,
    isSuccess: isATokenApproveSuccess,
  } = useWaitForTransactionReceipt({
    hash: aTokenApproveHash,
  });

  // Convert rate to APY using the contract's function
  const { data: readableAPY } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'convertRateToAPYReadable',
    args: [linkSupplyRate],
    enabled:
      !!linkSupplyRate &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Update APY from contract calculation with multiple fallbacks
  useEffect(() => {
    console.log('APY Debug - linkSupplyRate:', linkSupplyRate);
    console.log('APY Debug - readableAPY:', readableAPY);
    console.log('APY Debug - reserveData:', reserveData);

    if (readableAPY && Number(readableAPY) > 0) {
      // If contract returns the APY in basis points or percentage
      const apyValue = Number(readableAPY);
      console.log('APY Debug - using readableAPY:', apyValue);

      if (apyValue > 1000) {
        // If it's in basis points (e.g., 250 = 2.5%)
        setAPY((apyValue / 100).toFixed(2));
      } else if (apyValue > 100) {
        // If it's already in percentage but needs decimal conversion
        setAPY((apyValue / 100).toFixed(2));
      } else {
        // If it's already in decimal percentage
        setAPY(apyValue.toFixed(2));
      }
    } else if (reserveData && reserveData[4] && Number(reserveData[4]) > 0) {
      // Use supply rate from reserve data (index 4 is supplyRate)
      const rayRate = Number(reserveData[4]);
      console.log('APY Debug - using reserve data supply rate:', rayRate);

      // Convert from Ray (1e27) to APY percentage
      // Aave rates are per second, need to convert to annual
      const secondsPerYear = 365 * 24 * 60 * 60;
      const apyValue = ((rayRate / 1e27) * secondsPerYear * 100).toFixed(2);
      console.log('APY Debug - calculated APY from reserve data:', apyValue);
      setAPY(apyValue);
    } else if (linkSupplyRate && Number(linkSupplyRate) > 0) {
      // Fallback: Manual calculation from ray units
      const rayRate = Number(linkSupplyRate);
      console.log('APY Debug - using fallback calculation from ray:', rayRate);

      // Convert from Ray (1e27) to APY percentage
      // Aave rates are per second, need to convert to annual
      const secondsPerYear = 365 * 24 * 60 * 60;
      const apyValue = ((rayRate / 1e27) * secondsPerYear * 100).toFixed(2);
      console.log('APY Debug - calculated APY:', apyValue);
      setAPY(apyValue);
    } else {
      // If no data available, show loading
      console.log('APY Debug - no data available');
      setAPY('--');
    }
  }, [readableAPY, linkSupplyRate, reserveData]);

  // Update LINK token balance (formatted to 4 decimal places)
  useEffect(() => {
    if (linkBalance !== undefined) {
      const formattedBalance = parseFloat(formatEther(linkBalance)).toFixed(4);
      setLinkTokenBalance(formattedBalance);
    } else if (isConnected) {
      setLinkTokenBalance('0.0000');
    } else {
      setLinkTokenBalance('--');
    }
  }, [linkBalance, isConnected]);

  // Get individual position data using the new functions exactly like in testNewPositionFunctions
  const { data: currentPositionData } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getCurrentLINKPosition',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  const { data: totalSuppliedData } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getTotalSupplied',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Get getUserPositionData for yield calculation
  const { data: userPositionData } = useReadContract({
    address: MARKET_INTERACTIONS_CONTRACT,
    abi: MARKET_INTERACTIONS_ABI,
    functionName: 'getUserPositionData',
    args: [address],
    enabled:
      !!address &&
      !!MARKET_INTERACTIONS_CONTRACT &&
      MARKET_INTERACTIONS_CONTRACT !== '0x...',
  });

  // Update balances from contract calls
  useEffect(() => {
    console.log('🔍 Contract Data Debug:', {
      getCurrentLINKPosition: currentPositionData
        ? formatEther(currentPositionData)
        : 'N/A',
      getTotalSupplied: totalSuppliedData
        ? formatEther(totalSuppliedData)
        : 'N/A',
      userPositionData_available: !!userPositionData,
      userPositionData_aTokenBalance:
        userPositionData && userPositionData[3]
          ? formatEther(userPositionData[3])
          : 'N/A',
      userPositionData_netPosition:
        userPositionData && userPositionData[2]
          ? formatEther(userPositionData[2])
          : 'N/A',
      userPositionData_yieldFromContract:
        userPositionData && userPositionData[4]
          ? formatEther(userPositionData[4])
          : 'N/A',
      isConnected,
      address,
    });

    if (isConnected && address) {
      // Current position: Show aLINK token balance from getCurrentLINKPosition
      const currentPos = currentPositionData
        ? parseFloat(formatEther(currentPositionData)).toFixed(4)
        : '0.0000';
      setCurrentPosition(currentPos);

      // Yield earned: Calculate as aTokenBalance - netPosition
      if (
        userPositionData &&
        userPositionData[3] !== undefined &&
        userPositionData[2] !== undefined
      ) {
        const aTokenBalance = parseFloat(formatEther(userPositionData[3]));
        const netPosition = parseFloat(formatEther(userPositionData[2]));
        const calculatedYield = Math.max(
          0,
          aTokenBalance - netPosition
        ).toFixed(4);

        console.log('💰 Yield Calculation:', {
          aTokenBalance,
          netPosition,
          calculatedYield,
          rawATokenBalance: userPositionData[3].toString(),
          rawNetPosition: userPositionData[2].toString(),
          contractYieldFromUserPositionData: userPositionData[4]
            ? formatEther(userPositionData[4])
            : 'N/A',
        });

        setYieldEarned(calculatedYield);
      } else {
        console.log('❌ Yield calculation failed - missing data:', {
          hasUserPositionData: !!userPositionData,
          hasATokenBalance: !!(
            userPositionData && userPositionData[3] !== undefined
          ),
          hasNetPosition: !!(
            userPositionData && userPositionData[2] !== undefined
          ),
          rawUserPositionData: userPositionData
            ? userPositionData.map((item) => item?.toString())
            : 'No data',
        });
        setYieldEarned('0.0000');
      }

      // Total supplied from getTotalSupplied
      const totalSuppliedAmount = totalSuppliedData
        ? parseFloat(formatEther(totalSuppliedData)).toFixed(4)
        : '0.0000';
      setTotalSupplied(totalSuppliedAmount);
    } else {
      setCurrentPosition('--');
      setYieldEarned('--');
      setTotalSupplied('--');
    }
  }, [
    currentPositionData,
    userPositionData,
    totalSuppliedData,
    isConnected,
    address,
  ]);

  // Contract-based tracking eliminates need for localStorage reset functions

  const handleStake = async () => {
    if (!amount || !isConnected || MARKET_INTERACTIONS_CONTRACT === '0x...') {
      alert(
        'Please connect wallet and enter amount, and ensure contract is deployed'
      );
      return;
    }

    try {
      const amountWei = parseEther(amount);

      // Step 1: Approve LINK token for the contract
      console.log('Step 1: Approving LINK tokens...');
      await approveLINK({
        address: LINK_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [MARKET_INTERACTIONS_CONTRACT, amountWei],
      });

      // Step 2 will be handled after approval confirmation
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Token approval failed');
    }
  };

  // Handle supply after approval is confirmed
  useEffect(() => {
    if (isApproveSuccess && amount && address) {
      const executeSupply = async () => {
        try {
          const amountWei = parseEther(amount);
          console.log('Step 2: Calling supplyLINKDirectly...');
          // Contract will automatically track supply amounts

          await supplyLiquidity({
            address: MARKET_INTERACTIONS_CONTRACT,
            abi: MARKET_INTERACTIONS_ABI,
            functionName: 'supplyLINKDirectly',
            args: [amountWei],
          });
        } catch (error) {
          console.error('Supply failed:', error);
          alert('Supply transaction failed');
        }
      };

      executeSupply();
    }
  }, [isApproveSuccess, amount, supplyLiquidity, address]);

  // Refresh page after successful supply transaction
  useEffect(() => {
    if (isSupplySuccess) {
      console.log('✅ Supply transaction successful - refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Wait 2 seconds before refresh to show success message
    }
  }, [isSupplySuccess]);

  // Refresh page after successful withdraw transaction
  useEffect(() => {
    if (isWithdrawSuccess) {
      console.log('✅ Withdraw transaction successful - refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Wait 2 seconds before refresh to show success message
    }
  }, [isWithdrawSuccess]);

  const handleWithdraw = async () => {
    if (!amount || !isConnected || MARKET_INTERACTIONS_CONTRACT === '0x...') {
      alert(
        'Please connect wallet and enter amount, and ensure contract is deployed'
      );
      return;
    }

    if (!aTokenAddress) {
      alert('aToken address not loaded yet. Please wait and try again.');
      return;
    }

    try {
      const amountWei = parseEther(amount);
      console.log('Withdrawing amount:', amount, 'Wei:', amountWei.toString());
      console.log('Using aToken address:', aTokenAddress);
      setIsWithdrawMode(true);

      // Step 1: Approve contract to spend user's aTokens
      console.log('Step 1: Approving aToken spending for withdrawal...');
      await approveAToken({
        address: aTokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [MARKET_INTERACTIONS_CONTRACT, amountWei],
      });

      // Step 2 will be handled after approval confirmation
    } catch (error) {
      console.error('aToken approval failed:', error);
      alert('Withdrawal approval failed: ' + error.message);
      setIsWithdrawMode(false);
    }
  };

  // Handle withdrawal after aToken approval is confirmed
  useEffect(() => {
    if (isATokenApproveSuccess && amount && address && isWithdrawMode) {
      const executeWithdraw = async () => {
        try {
          const amountWei = parseEther(amount);
          console.log('Step 2: Calling withdrawLINKFromAave...');
          // Contract will automatically track withdrawal amounts

          await withdrawLiquidity({
            address: MARKET_INTERACTIONS_CONTRACT,
            abi: MARKET_INTERACTIONS_ABI,
            functionName: 'withdrawLINKFromAave',
            args: [amountWei],
          });

          setIsWithdrawMode(false);
        } catch (error) {
          console.error('Withdrawal failed:', error);
          alert('Withdrawal transaction failed: ' + error.message);
          setIsWithdrawMode(false);
        }
      };

      executeWithdraw();
    }
  }, [
    isATokenApproveSuccess,
    amount,
    withdrawLiquidity,
    address,
    isWithdrawMode,
  ]);

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
          <LINKTokenLogo />
          <div>
            <p className="text-sm text-gray-600">Token: LINK</p>
            <p className="text-lg font-semibold">
              APY: {apy === '--' ? 'Loading...' : `${apy}%`}
            </p>
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
          Balance: {linkTokenBalance} LINK
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setActiveTab('stake');
            if (amount) handleStake();
          }}
          disabled={isSupplyPending || isSupplyConfirming || !isConnected}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'stake'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${
            isSupplyPending || isSupplyConfirming || !isConnected
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {isSupplyPending || isSupplyConfirming ? 'Processing...' : 'Stake'}
        </button>
        <button
          onClick={() => {
            setActiveTab('withdraw');
            if (amount) handleWithdraw();
          }}
          disabled={
            isATokenApprovePending ||
            isATokenApproveConfirming ||
            isWithdrawPending ||
            isWithdrawConfirming ||
            !isConnected
          }
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === 'withdraw'
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${
            isWithdrawPending || isWithdrawConfirming || !isConnected
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {isATokenApprovePending ||
          isATokenApproveConfirming ||
          isWithdrawPending ||
          isWithdrawConfirming
            ? 'Processing...'
            : 'Withdraw'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supplied:</span>
          <span className="font-medium">{totalSupplied} LINK</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Position:</span>
          <span className="font-medium">{currentPosition} LINK</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Yield Earned:</span>
          <span className="font-medium text-green-600">
            +{yieldEarned} LINK
          </span>
        </div>
      </div>
    </div>
  );
};

export default AaveStakingCard;
