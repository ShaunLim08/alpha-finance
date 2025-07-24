import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>Alpha Finance - DeFi Platform</title>
        <meta
          name="description"
          content="Swap tokens and stake assets across multiple chains with Alpha Finance"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-[calc(100vh-64px)]">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo.png"
                alt="Alpha Finance Logo"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
              />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                Alpha Finance
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Swap tokens at the best rates and stake your assets to earn
              rewards on multiple chains
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/swap"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Start Swapping
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/stake"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Stake Tokens
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our Platform?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Rates</h3>
                <p className="text-gray-600">
                  Get the best swap rates across multiple DEXs using 1inch
                  aggregation protocol
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Trusted</h3>
                <p className="text-gray-600">
                  Built on battle-tested smart contracts with security as our
                  top priority
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Chain</h3>
                <p className="text-gray-600">
                  Support for Ethereum, BSC, Polygon, Arbitrum, and Optimism
                  networks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">
              {isConnected
                ? 'Your wallet is connected. Start swapping or staking now!'
                : 'Connect your wallet to access all features'}
            </p>
            {!isConnected && (
              <p className="text-sm text-gray-500">
                Click the "Connect Wallet" button in the top right to begin
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
