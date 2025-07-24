import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ArrowDownUp,
  Loader2,
  AlertCircle,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import {
  useAccount,
  useChainId,
  useBalance,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CustomConnectButton } from './CustomConnectButton';

// ERC20 ABI for approval
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
];

const SwapPlatform = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [tokens, setTokens] = useState({});
  const [loading, setLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFromTokenList, setShowFromTokenList] = useState(false);
  const [showToTokenList, setShowToTokenList] = useState(false);
  const [swapQuote, setSwapQuote] = useState(null);
  const [slippage, setSlippage] = useState(1);
  const [allowance, setAllowance] = useState('0');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState();
  const [swapTxHash, setSwapTxHash] = useState();
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const oneInchRouter = '0x1111111254EEB25477B68fb85Ed929f73A960582'; // 1inch v5 router

  // Get native token balance
  const { data: nativeBalance } = useBalance({
    address: address,
  });

  // Get token balance
  const { data: tokenBalance } = useBalance({
    address: address,
    token:
      fromToken?.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ? fromToken?.address
        : undefined,
  });

  // Fetch token list on component mount or chain change
  useEffect(() => {
    if (chainId) {
      fetchTokenList();
    }
  }, [chainId]);

  // Check allowance when token or amount changes
  useEffect(() => {
    if (
      fromToken &&
      amount &&
      address &&
      fromToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    ) {
      checkAllowance();
    }
  }, [fromToken, amount, address]);

  const fetchTokenList = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tokens?chainId=${chainId}`);
      const data = await response.json();
      setTokens(data);

      // Set default tokens
      if (data['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']) {
        setFromToken(data['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee']);
      }
      if (data['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']) {
        setToToken(data['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']);
      }
    } catch (err) {
      setError('Failed to fetch token list');
      console.error(err);
    }
    setLoading(false);
  };

  const checkAllowance = async () => {
    if (!fromToken || !address) return;

    try {
      const response = await fetch(
        `/api/approve/allowance?tokenAddress=${fromToken.address}&walletAddress=${address}&chainId=${chainId}`
      );
      const data = await response.json();
      setAllowance(data.allowance);

      // Check if approval is needed
      const amountInWei = parseUnits(amount || '0', fromToken.decimals);
      setNeedsApproval(BigInt(data.allowance) < amountInWei);
    } catch (err) {
      console.error('Error checking allowance:', err);
    }
  };

  // Prepare approval transaction
  const { writeContract: approveToken, isPending: isApproving } =
    useWriteContract();
  const { sendTransaction, isPending: isSendingSwap } = useSendTransaction();

  const { isLoading: isApprovalConfirming } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });

  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } =
    useWaitForTransactionReceipt({
      hash: swapTxHash,
    });

  useEffect(() => {
    if (approvalTxHash && !isApprovalConfirming) {
      // After approval is confirmed, recheck allowance and get quote
      checkAllowance().then(() => getSwapQuote());
    }
  }, [approvalTxHash, isApprovalConfirming]);

  useEffect(() => {
    if (isSwapSuccess) {
      // Reset state after successful swap
      const swappedAmount = amount;
      const receivedAmount = formatAmount(
        swapQuote.dstAmount,
        toToken.decimals
      );
      setSuccessMessage(
        `Successfully swapped ${swappedAmount} ${fromToken.symbol} for ${receivedAmount} ${toToken.symbol}!`
      );

      setAmount('');
      setSwapQuote(null);
      setSwapTxHash(undefined);
      setError('');

      // Clear success message after 10 seconds
      setTimeout(() => setSuccessMessage(''), 10000);
    }
  }, [isSwapSuccess]);

  const handleApprove = async () => {
    if (!fromToken || !amount) return;

    try {
      const result = await approveToken({
        address: fromToken.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [oneInchRouter, parseUnits(amount, fromToken.decimals)],
      });
      setApprovalTxHash(result);
    } catch (error) {
      console.error('Approval error:', error);
      setError('Failed to approve token');
    }
  };

  const getSwapQuote = async () => {
    if (!fromToken || !toToken || !amount || !address) {
      setError('Please fill in all fields');
      return;
    }

    setSwapLoading(true);
    setError('');

    try {
      const amountInWei = parseUnits(amount, fromToken.decimals).toString();

      const params = new URLSearchParams({
        src: fromToken.address,
        dst: toToken.address,
        amount: amountInWei,
        from: address,
        slippage: slippage.toString(),
        disableEstimate: 'false',
        allowPartialFill: 'false',
      });

      const response = await fetch(
        `/api/swap/quote?${params}&chainId=${chainId}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.description || 'Failed to get swap quote');
      } else {
        setSwapQuote(data);
      }
    } catch (err) {
      setError('Failed to get swap quote');
      console.error(err);
    }
    setSwapLoading(false);
  };

  const executeSwap = async () => {
    if (!swapQuote || !address) return;

    setError('');
    setIsExecutingSwap(true);

    try {
      const params = new URLSearchParams({
        src: fromToken.address,
        dst: toToken.address,
        amount: parseUnits(amount, fromToken.decimals).toString(),
        from: address,
        slippage: slippage.toString(),
        disableEstimate: 'false',
        allowPartialFill: 'false',
      });

      const response = await fetch(
        `/api/swap/execute?${params}&chainId=${chainId}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.description || 'Failed to build swap transaction');
        setIsExecutingSwap(false);
        return;
      }

      // Extract transaction data
      const swapTransaction = data.tx;

      // Send the transaction using wagmi
      const result = await sendTransaction({
        to: swapTransaction.to,
        data: swapTransaction.data,
        value: swapTransaction.value ? BigInt(swapTransaction.value) : 0n,
        gas: swapTransaction.gas ? BigInt(swapTransaction.gas) : undefined,
      });

      setSwapTxHash(result);
    } catch (err) {
      console.error('Swap execution error:', err);
      setError(err.message || 'Failed to execute swap');
    }
    setIsExecutingSwap(false);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setSwapQuote(null);
  };

  const formatAmount = (amount, decimals) => {
    if (!amount) return '0';
    return formatUnits(BigInt(amount), decimals);
  };

  const getCurrentBalance = () => {
    if (!fromToken) return '0';
    if (fromToken.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
      return nativeBalance
        ? formatUnits(nativeBalance.value, nativeBalance.decimals)
        : '0';
    }
    return tokenBalance
      ? formatUnits(tokenBalance.value, tokenBalance.decimals)
      : '0';
  };

  const getBlockExplorerUrl = (chainId) => {
    const explorers = {
      1: 'https://etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      10: 'https://optimistic.etherscan.io',
      42161: 'https://arbiscan.io',
      11155111: 'https://sepolia.etherscan.io',
    };
    return explorers[chainId] || explorers[1];
  };

  const TokenSelector = ({ token, onClick, label }) => (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {token ? (
          <>
            <img
              src={token.logoURI}
              alt={token.symbol}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/24/888/fff?text=${token.symbol[0]}`;
              }}
            />
            <span className="font-semibold">{token.symbol}</span>
          </>
        ) : (
          <span className="text-gray-500">Select token</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </div>
    </button>
  );

  const TokenList = ({ onSelect, onClose, excludeToken }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTokens, setFilteredTokens] = useState(Object.values(tokens));

    useEffect(() => {
      const filterTokens = async () => {
        if (searchTerm) {
          const results = Object.values(tokens).filter(
            (token) =>
              token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              token.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredTokens(results);
        } else {
          setFilteredTokens(Object.values(tokens));
        }
      };
      filterTokens();
    }, [searchTerm]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Select Token</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name or symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
          />

          <div className="overflow-y-auto flex-1">
            {filteredTokens
              .filter((token) => token.address !== excludeToken?.address)
              .map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className="w-full p-3 hover:bg-gray-100 flex items-center gap-3 rounded-lg transition-colors"
                >
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/32/888/fff?text=${token.symbol[0]}`;
                    }}
                  />
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-500">{token.name}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Token Swap</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Show connection prompt if not connected */}
          {!isConnected ? (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Connect your wallet to start swapping
              </p>
            </div>
          ) : (
            <>
              {/* Chain warning */}
              {chainId &&
                ![1, 56, 137, 10, 42161, 11155111].includes(chainId) && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Please switch to a supported network
                    </span>
                  </div>
                )}

              {/* From Token Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    From
                  </label>
                  <span className="text-xs text-gray-500">
                    Balance: {getCurrentBalance().slice(0, 10)}
                  </span>
                </div>
                <div className="space-y-2">
                  <TokenSelector
                    token={fromToken}
                    onClick={() => setShowFromTokenList(true)}
                    label="You pay"
                  />
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSwapQuote(null);
                    }}
                    className="w-full p-3 border rounded-lg text-lg"
                  />
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center my-2">
                <button
                  onClick={switchTokens}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </button>
              </div>

              {/* To Token Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="space-y-2">
                  <TokenSelector
                    token={toToken}
                    onClick={() => setShowToTokenList(true)}
                    label="You receive"
                  />
                  <div className="w-full p-3 border rounded-lg text-lg bg-gray-50">
                    {swapQuote
                      ? formatAmount(swapQuote.dstAmount, toToken.decimals)
                      : '0.0'}
                  </div>
                </div>
              </div>

              {/* Slippage Settings */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex gap-2">
                  {[0.5, 1, 2.5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-4 py-2 rounded-lg ${
                        slippage === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={slippage}
                    onChange={(e) =>
                      setSlippage(parseFloat(e.target.value) || 0)
                    }
                    className="px-4 py-2 border rounded-lg w-24"
                  />
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                  <div className="text-2xl">🎉</div>
                  <span className="text-sm">{successMessage}</span>
                </div>
              )}

              {/* Transaction Status */}
              {(approvalTxHash || swapTxHash) && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg space-y-2">
                  {approvalTxHash && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">
                        Approval Transaction:
                      </span>
                      <a
                        href={`${getBlockExplorerUrl(
                          chainId
                        )}/tx/${approvalTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {swapTxHash && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Swap Transaction:</span>
                      <a
                        href={`${getBlockExplorerUrl(
                          chainId
                        )}/tx/${swapTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Swap Quote Details */}
              {swapQuote && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">You pay</span>
                    <span>
                      {amount} {fromToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">You receive</span>
                    <span>
                      {formatAmount(swapQuote.dstAmount, toToken.decimals)}{' '}
                      {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Gas</span>
                    <span>{swapQuote.gas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Impact</span>
                    <span className="text-red-500">~{slippage}%</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {needsApproval &&
                fromToken?.address !==
                  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isApprovalConfirming}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isApproving || isApprovalConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approving {fromToken?.symbol}...
                      </>
                    ) : (
                      `Approve ${fromToken?.symbol}`
                    )}
                  </button>
                ) : !swapQuote ? (
                  <button
                    onClick={getSwapQuote}
                    disabled={
                      swapLoading ||
                      !fromToken ||
                      !toToken ||
                      !amount ||
                      (chainId &&
                        ![1, 56, 137, 10, 42161, 11155111].includes(chainId))
                    }
                    className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {swapLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Getting Quote...
                      </>
                    ) : (
                      'Get Swap Quote'
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={executeSwap}
                      disabled={
                        isExecutingSwap || isSendingSwap || isSwapConfirming
                      }
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isExecutingSwap || isSendingSwap || isSwapConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isSwapConfirming
                            ? 'Confirming Swap...'
                            : 'Executing Swap...'}
                        </>
                      ) : (
                        'Execute Swap'
                      )}
                    </button>
                    <button
                      onClick={() => setSwapQuote(null)}
                      disabled={
                        isExecutingSwap || isSendingSwap || isSwapConfirming
                      }
                      className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Token List Modals */}
        {showFromTokenList && (
          <TokenList
            onSelect={(token) => {
              setFromToken(token);
              setSwapQuote(null);
            }}
            onClose={() => setShowFromTokenList(false)}
            excludeToken={toToken}
          />
        )}

        {showToTokenList && (
          <TokenList
            onSelect={(token) => {
              setToToken(token);
              setSwapQuote(null);
            }}
            onClose={() => setShowToTokenList(false)}
            excludeToken={fromToken}
          />
        )}
      </div>
    </div>
  );
};

export default SwapPlatform;
