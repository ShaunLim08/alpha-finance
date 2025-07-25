import SwapPlatform from '../components/SwapPlatform';
import { PoolCards } from '../components/PoolCards';

export default function Swap() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Swap Platform - Left Side */}
        <div>
          <SwapPlatform />
        </div>

        {/* Alpha Data Cards - Right Side */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Alpha Data</h2>
            <span className="text-sm text-gray-500">by</span>
            <img
              src="/coingecko.png"
              alt="CoinGecko"
              className="h-6"
              onError={(e) => {
                e.target.src =
                  'https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png';
              }}
            />
            <span className="text-xs text-gray-400">&</span>
            <img
              src="/geckoterminal.png"
              alt="GeckoTerminal"
              className="h-6"
              onError={(e) => {
                e.target.src =
                  'https://via.placeholder.com/24/00D4AA/fff?text=GT';
              }}
            />
          </div>
          <PoolCards />
        </div>
      </div>
    </div>
  );
}
