import Head from 'next/head';
import { useAccount } from 'wagmi';
import { Wallet, Info } from 'lucide-react';

export default function Stake() {
  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>Stake - Alpha Finance</title>
        <meta
          name="description"
          content="Stake your tokens and earn rewards on Alpha Finance"
        />
      </Head>

      <div className="min-h-[calc(100vh-64px)] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Stake Your Tokens
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {!isConnected ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Connect your wallet to start staking
                </p>
                <p className="text-sm text-gray-500">
                  Use the connect button in the navigation bar
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Info className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  We're working on bringing you the best staking experience.
                  Check back soon to stake your tokens and earn rewards.
                </p>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 In the meantime, try our swap feature to exchange tokens
                    at the best rates!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Placeholder for future staking features */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-2">Flexible Staking</h3>
              <p className="text-sm text-gray-600">Stake and unstake anytime</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-2">High APY</h3>
              <p className="text-sm text-gray-600">Earn competitive rewards</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold mb-2">Multi-Token</h3>
              <p className="text-sm text-gray-600">
                Support for various tokens
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
