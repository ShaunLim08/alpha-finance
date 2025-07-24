import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useCallback, useEffect, useState } from 'react';

const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 137, 43114], // Ethereum, BSC, Polygon, Avalanche
});

export function useWeb3() {
  const { active, account, library, activate, deactivate, chainId } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await activate(injected);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [activate]);

  const disconnect = useCallback(() => {
    deactivate();
  }, [deactivate]);

  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) throw new Error('No crypto wallet found');
    
    const chainIdHex = `0x${targetChainId.toString(16)}`;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added to wallet
        console.error('Please add this network to your wallet');
      }
      throw error;
    }
  }, []);

  return {
    active,
    account,
    library,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    loading,
    error,
  };
}