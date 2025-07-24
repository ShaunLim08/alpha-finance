// components/Navbar.js
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CustomConnectButton } from './CustomConnectButton';
import { Home, ArrowLeftRight, Coins } from 'lucide-react';

export const Navbar = () => {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Alpha Finance Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-gray-800">
                Alpha Finance
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              <Link
                href="/swap"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/swap')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Swap
              </Link>

              <Link
                href="/stake"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/stake')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Coins className="w-4 h-4" />
                Stake
              </Link>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="flex items-center">
            <CustomConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => {
                /* Add mobile menu toggle */
              }}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/swap"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/swap')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Swap
          </Link>

          <Link
            href="/stake"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
              isActive('/stake')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            Stake
          </Link>
        </div>
      </div>
    </nav>
  );
};
