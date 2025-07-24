// components/Address.js
import { useEnsName, useEnsAvatar } from 'wagmi';
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export const Address = ({
  address,
  disableAddressLink = false,
  format = 'short',
  size = 'base',
  onlyEnsOrAddress = false,
}) => {
  const [copied, setCopied] = useState(false);
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (format === 'long') return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  };

  const displayText = onlyEnsOrAddress
    ? ensName || formatAddress(address)
    : ensName
    ? `${ensName} (${formatAddress(address)})`
    : formatAddress(address);

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt="ENS Avatar"
          className="w-6 h-6 rounded-full"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
      )}

      {disableAddressLink ? (
        <span className="font-mono">{displayText}</span>
      ) : (
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono hover:text-blue-500 transition-colors"
        >
          {displayText}
        </a>
      )}

      <button
        onClick={copyAddress}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Copy address"
      >
        <Copy className="w-4 h-4" />
      </button>

      {copied && <span className="text-xs text-green-500 ml-1">Copied!</span>}
    </div>
  );
};
