import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import React, { useState, useRef } from 'react';
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion';

// AnimatedTooltip Component
const AnimatedTooltip = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="group relative -mr-4"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: 'nowrap',
                }}
                className="absolute -top-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-6 py-3 text-sm shadow-xl"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="relative z-30 text-lg font-bold text-white">
                  {item.name}
                </div>
                <div className="text-sm text-white">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={120}
            width={120}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-20 w-20 rounded-full border-2 border-white object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
};

// Team members data
const people = [
  {
    id: 1,
    name: 'Shaun Lim',
    designation: 'Chief Monkey Officer',
    image: '/team/shaun.jpeg',
  },
  {
    id: 2,
    name: 'Lau Jia Sheng',
    designation: 'Evil Overlord',
    image:
      'https://media.newyorker.com/photos/59095bb86552fa0be682d9d0/master/w_2560%2Cc_limit/Monkey-Selfie.jpg',
  },
  {
    id: 3,
    name: 'Yew Foong Yik',
    designation: "ZhinHuey's",
    image:
      'https://media.newyorker.com/photos/59095bb86552fa0be682d9d0/master/w_2560%2Cc_limit/Monkey-Selfie.jpg',
  },
  {
    id: 4,
    name: 'Jason Chu',
    designation: '101% Gambler',
    image: '/team/Winter.png',
  },
];

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
              Get the <strong>Alpha</strong> - Make informed trading decisions
              with real-time market data, or play it safe with steady staking
              rewards across multiple chains
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
              Why Choose Alpha Finance?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Alpha Information
                </h3>
                <p className="text-gray-600">
                  Access real-time trending pools, top gainers, and market
                  insights to make informed trading decisions with the edge you
                  need
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe & Steady</h3>
                <p className="text-gray-600">
                  Prefer playing it safe? Stake your assets for steady,
                  predictable returns while your investments grow over time
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Trading</h3>
                <p className="text-gray-600">
                  Combine market intelligence with best execution rates across
                  Ethereum, BSC, Polygon, Arbitrum, and Optimism
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get the Alpha?</h2>
            <p className="text-gray-600 mb-8">
              {isConnected
                ? 'Your wallet is connected. Start making informed decisions now!'
                : 'Connect your wallet to access market intelligence and trading tools'}
            </p>
            {!isConnected && (
              <p className="text-sm text-gray-500 mb-8">
                Click the "Connect Wallet" button in the top right to begin
              </p>
            )}

            {/* Animated Tooltip Section */}
            <div className="my-12">
              <h3 className="text-2xl font-semibold mb-6">Meet The Team</h3>
              <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={people} />
              </div>
            </div>

            {/* Special Note */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-400 italic">
                PLS LIANG PLS LET US PASS 😭 - Blockchain Lab4 Group 1
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
