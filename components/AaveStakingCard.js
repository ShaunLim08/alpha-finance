import React, { useState } from 'react';
import { AAVETokenLogo } from './AAVETokenLogo'; // adjust import path as needed

const VaultPoolComponent = ({ apy, linkTokenBalance, onDeposit }) => {
  const [amount, setAmount] = useState('');

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
      {/* Token and APY Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <AAVETokenLogo />
          <div>
            <p className="text-sm text-gray-600">Token: LINK</p>
            <p className="text-lg font-semibold">
              APY: {apy === '--' ? 'Loading...' : `${apy}%`}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600">Type: Vault / Pool</p>
      </div>

      {/* Input and Balance */}
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

      {/* Deposit Button */}
      <button
        onClick={() => onDeposit(amount)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
      >
        Deposit
      </button>
    </div>
  );
};

export default VaultPoolComponent;
