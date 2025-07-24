import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useEnsName, useEnsAvatar } from 'wagmi';
import { useState } from 'react';
import { Copy, ExternalLink, QrCode, LogOut, ChevronDown } from 'lucide-react';
import { formatEther } from 'viem';
import QRCode from 'qrcode.react';

export const CustomConnectButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });

  const getChainColor = (chainId) => {
    const colors = {
      1: 'bg-blue-500',      // Ethereum
      56: 'bg-yellow-500',   // BSC
      137: 'bg-purple-500',  // Polygon
      10: 'bg-red-500',      // Optimism
      42161: 'bg-blue-600',  // Arbitrum
      11155111: 'bg-gray-500', // Sepolia
    };
    return colors[chainId] || 'bg-gray-500';
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You can add a toast notification here
    }
  };

  const getBlockExplorerUrl = () => {
    const explorers = {
      1: 'https://etherscan.io/address/',
      56: 'https://bscscan.com/address/',
      137: 'https://polygonscan.com/address/',
      10: 'https://optimistic.etherscan.io/address/',
      42161: 'https://arbiscan.io/address/',
      11155111: 'https://sepolia.etherscan.io/address/',
    };
    const baseUrl = explorers[chainId] || explorers[1];
    return `${baseUrl}${address}`;
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="relative">
                  <button
                    onClick={() => setShowModal(!showModal)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${getChainColor(chain.id)}`} />
                    <span className="text-sm font-medium">{chain.name}</span>
                    <div className="h-4 w-px bg-gray-300" />
                    <div className="text-sm">
                      {balance && (
                        <span className="font-medium">
                          {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
                        </span>
                      )}
                    </div>
                    <div className="h-4 w-px bg-gray-300" />
                    <div className="flex items-center gap-2">
                      {ensAvatar ? (
                        <img src={ensAvatar} alt="ENS Avatar" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                      )}
                      <span className="text-sm font-medium">
                        {ensName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Custom Modal */}
                  {showModal && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 space-y-3">
                        <div className="text-center">
                          {ensAvatar ? (
                            <img src={ensAvatar} alt="ENS Avatar" className="w-16 h-16 rounded-full mx-auto mb-2" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-2" />
                          )}
                          {ensName && <p className="font-semibold">{ensName}</p>}
                          <p className="text-sm text-gray-600 font-mono">
                            {account.address.slice(0, 6)}...{account.address.slice(-4)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={copyAddress}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Address
                          </button>

                          <button
                            onClick={() => setShowQR(!showQR)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                            Show QR Code
                          </button>

                          <a
                            href={getBlockExplorerUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on Explorer
                          </a>

                          <button
                            onClick={openChainModal}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className={`w-3 h-3 rounded-full ${getChainColor(chainId)}`} />
                            Switch Network
                          </button>

                          <button
                            onClick={() => {
                              setShowModal(false);
                              openAccountModal();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>

                        {showQR && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <QRCode value={account.address} size={200} className="mx-auto" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};