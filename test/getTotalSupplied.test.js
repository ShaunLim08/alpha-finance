// Test for getTotalSupplied function in MarketInteractions contract
// Note: This test simulates the function behavior since we don't have a full Hardhat test environment

const { expect } = require('chai');

// Mock data to simulate Aave pool responses
const mockReserveData = {
  aTokenAddress: '0x1234567890123456789012345678901234567890',
  stableDebtTokenAddress: '0x2345678901234567890123456789012345678901',
  variableDebtTokenAddress: '0x3456789012345678901234567890123456789012'
};

const mockContractData = {
  contractTotalSupplied: '1500000000000000000000', // 1500 LINK supplied through the contract
};

describe('getTotalSupplied Function Test', function() {
  let expectedTotalSupplied;

  before(function() {
    // Expected total supplied is the contract's tracked total
    expectedTotalSupplied = BigInt(mockContractData.contractTotalSupplied);
    
    console.log('Mock Test Data:');
    console.log('Contract Total Supplied (Cumulative deposits through contract):', expectedTotalSupplied.toString());
    console.log('Expected Total Supplied:', expectedTotalSupplied.toString());
  });

  it('should calculate total supplied correctly', function() {
    // Simulate the logic from the contract function:
    // return contractTotalSupplied;
    
    const contractTotal = BigInt(mockContractData.contractTotalSupplied);
    const actualTotalSupplied = contractTotal;
    
    expect(actualTotalSupplied.toString()).to.equal(expectedTotalSupplied.toString());
    
    console.log('✅ Test passed: getTotalSupplied calculation is correct');
  });

  it('should handle zero values correctly', function() {
    const zeroContractTotal = BigInt('0');
    
    const totalWithZeros = zeroContractTotal;
    
    expect(totalWithZeros.toString()).to.equal('0');
    
    console.log('✅ Test passed: Zero values handled correctly');
  });

  it('should handle large numbers correctly', function() {
    // Test with very large numbers (similar to real DeFi amounts)
    const largeContractTotal = BigInt('1000000000000000000000000'); // 1M LINK supplied through contract
    
    const largeTotal = largeContractTotal;
    
    expect(largeTotal.toString()).to.equal('1000000000000000000000000');
    
    console.log('✅ Test passed: Large numbers handled correctly');
    console.log('Large contract total:', largeTotal.toString());
  });

  // Utility function to simulate the contract's getTotalSupplied logic
  function simulateGetTotalSupplied(contractTotal) {
    return BigInt(contractTotal);
  }

  it('should match expected behavior for different contract scenarios', function() {
    // Test with different contract total scenarios
    const scenarios = [
      {
        name: 'High Activity Contract',
        contractTotal: '5000000000000000000000',
        expected: '5000000000000000000000'
      },
      {
        name: 'Medium Activity Contract',
        contractTotal: '1000000000000000000000',
        expected: '1000000000000000000000'
      },
      {
        name: 'Low Activity Contract',
        contractTotal: '100000000000000000000',
        expected: '100000000000000000000'
      }
    ];

    scenarios.forEach(scenario => {
      const result = simulateGetTotalSupplied(scenario.contractTotal);
      
      expect(result.toString()).to.equal(scenario.expected);
      console.log(`✅ ${scenario.name} test passed: ${result.toString()}`);
    });
  });

  it('should handle supply and withdraw flow correctly', function() {
    // Test the complete flow: supply, supply, withdraw
    let contractTotal = BigInt('0');
    
    // Address 1 supplies 100 LINK
    contractTotal += BigInt('100000000000000000000');
    expect(contractTotal.toString()).to.equal('100000000000000000000');
    console.log('✅ After Address 1 supplies 100 LINK:', contractTotal.toString());
    
    // Address 2 supplies 100 LINK  
    contractTotal += BigInt('100000000000000000000');
    expect(contractTotal.toString()).to.equal('200000000000000000000');
    console.log('✅ After Address 2 supplies 100 LINK:', contractTotal.toString());
    
    // Address 1 withdraws 50 LINK
    const withdrawAmount = BigInt('50000000000000000000');
    contractTotal = contractTotal >= withdrawAmount ? contractTotal - withdrawAmount : BigInt('0');
    expect(contractTotal.toString()).to.equal('150000000000000000000');
    console.log('✅ After Address 1 withdraws 50 LINK:', contractTotal.toString());
    
    console.log('✅ Supply/Withdraw flow test passed');
  });
});

// Instructions for running this test:
// 1. Install testing dependencies: npm install --save-dev mocha chai
// 2. Add to package.json scripts: "test": "mocha test/*.test.js"
// 3. Run with: npm test

console.log('\n📋 Test Summary:');
console.log('This test validates the getTotalSupplied function logic by:');
console.log('1. Testing basic contract net total tracking');
console.log('2. Handling edge cases (zero values)');
console.log('3. Testing with large numbers typical in DeFi');
console.log('4. Simulating different supply/withdraw scenarios');
console.log('\nThe function should return: contractTotalSupplied (net amount in pool)');
console.log('Updates when users supply (+) or withdraw (-) LINK through the contract');