// components/Balance.js
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

export const Balance = ({ address, className = '' }) => {
  const { data: balance } = useBalance({ address });
  const [usdPrice, setUsdPrice] = useState(0);

  useEffect(() => {
    // Fetch ETH price from coingecko or another API
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    )
      .then((res) => res.json())
      .then((data) => setUsdPrice(data.ethereum.usd))
      .catch(console.error);
  }, []);

  if (!balance) return <span className={className}>0 ETH</span>;

  const ethAmount = parseFloat(formatEther(balance.value));
  const usdAmount = ethAmount * usdPrice;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold">
        {ethAmount.toFixed(4)} {balance.symbol}
      </span>
      {usdPrice > 0 && (
        <span className="text-gray-500">(${usdAmount.toFixed(2)})</span>
      )}
    </div>
  );
};
