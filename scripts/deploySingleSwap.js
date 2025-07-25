const hre = require('hardhat');

async function main() {
  console.log('deploying...');
  const SingleSwap = await hre.ethers.getContractFactory('SingleSwap');
  const singleSwap = await SingleSwap.deploy();

  await singleSwap.waitForDeployment();

  console.log('Single Swap contract deployed: ', await singleSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
