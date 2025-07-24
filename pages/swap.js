import Head from 'next/head';
import SwapPlatform from '../components/SwapPlatform';

export default function Swap() {
  return (
    <>
      <Head>
        <title>Swap - Alpha Finance</title>
        <meta
          name="description"
          content="Swap tokens at the best rates across multiple chains"
        />
      </Head>
      <SwapPlatform />
    </>
  );
}
