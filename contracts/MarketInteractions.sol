// https://sepolia.etherscan.io/address/0x19ab1aBC4B4e5d6A114297ec23969773b9a5736D#code

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {DataTypes} from "@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol";

contract MarketInteractions {
    address payable owner;
    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;
    
    address private immutable linkAddress =
        0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5;
    IERC20 private link;

    // Yield tracking mappings
    mapping(address => uint256) public userTotalSupplied;
    mapping(address => uint256) public userTotalWithdrawn;
    mapping(address => uint256) public userOriginalSupply;
    
    // Global tracking for total supplied through this contract
    uint256 public contractTotalSupplied;

    constructor(address _addressProvider) {
        ADDRESSES_PROVIDER = IPoolAddressesProvider(_addressProvider);
        POOL = IPool(ADDRESSES_PROVIDER.getPool());
        owner = payable(msg.sender);
        link = IERC20(linkAddress);
    }

    
    // Get current supply (deposit) interest rate for a specific asset
    function getSupplyRate(address _asset) external view returns (uint256) {
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(_asset);
        return reserveData.currentLiquidityRate;
    }


    // Get LINK token supply rate specifically
    function getLINKSupplyRate() external view returns (uint256) {
        return this.getSupplyRate(linkAddress);
    }

    // Convert rate to APY percentage (rates are in Ray units: 1e27)
    function convertRateToAPY(uint256 _rate) external pure returns (uint256) {
        return _rate / 1e23;
    }

    // Convert rate to APY percentage with 4 decimal places (human readable)
    function convertRateToAPYReadable(uint256 _rate) external pure returns (uint256) {
        return _rate / 1e25; // This gives us percentage * 10000 (4 decimal places)
    }

    // Get reserve data with utilization rate calculation
    function getReserveDataWithUtilization(address _asset) 
        external 
        view 
        returns (
            uint256 totalLiquidity,
            uint256 availableLiquidity,
            uint256 totalBorrows,
            uint256 utilizationRate,
            uint256 supplyRate,
            uint256 variableBorrowRate
        ) 
    {
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(_asset);
        
        uint256 totalStableDebt = IERC20(reserveData.stableDebtTokenAddress).totalSupply();
        uint256 totalVariableDebt = IERC20(reserveData.variableDebtTokenAddress).totalSupply();
        uint256 availableLiq = IERC20(_asset).balanceOf(reserveData.aTokenAddress);
        
        uint256 totalBorrow = totalStableDebt + totalVariableDebt;
        uint256 totalLiq = availableLiq + totalBorrow;
        uint256 utilRate = totalLiq > 0 ? (totalBorrow * 10000) / totalLiq : 0; // Basis points (10000 = 100%)
        
        return (
            totalLiq,
            availableLiq,
            totalBorrow,
            utilRate,
            reserveData.currentLiquidityRate,
            reserveData.currentVariableBorrowRate
        );
    }


    function supplyLiquidity(address _tokenAddress, uint256 _amount) external {
        address asset = _tokenAddress;
        uint256 amount = _amount;
        address onBehalfOf = address(this);
        uint16 referralCode = 0;

        POOL.supply(asset, amount, onBehalfOf, referralCode);
    }

    function withdrawLiquidity(address _tokenAddress, uint256 _amount)
        external
        returns (uint256)
    {
        address asset = _tokenAddress;
        uint256 amount = _amount;
        address to = address(this);

        return POOL.withdraw(asset, amount, to);
    }

    function getUserAccountData(address _userAddress)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return POOL.getUserAccountData(_userAddress);
    }

    function approveLINK(uint256 _amount, address _poolContractAddress)
        external
        returns (bool)
    {
        return link.approve(_poolContractAddress, _amount);
    }

    function allowanceLINK(address _poolContractAddress)
        external
        view
        returns (uint256)
    {
        return link.allowance(address(this), _poolContractAddress);
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function getUserLINKBalance(address _user) external view returns (uint256) {
        return link.balanceOf(_user);
    }

    // Streamlined function: User approves → Contract transfers → Supplies to Aave
    function supplyLINKDirectly(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(link.balanceOf(msg.sender) >= _amount, "Insufficient LINK balance");
        
        // Step 1: Transfer LINK from user to this contract
        require(link.transferFrom(msg.sender, address(this), _amount), "Transfer from user failed");
        
        // Step 2: Approve Aave pool to spend the LINK
        require(link.approve(address(POOL), _amount), "Pool approval failed");
        
        // Step 3: Supply LINK to Aave pool on behalf of the user
        POOL.supply(linkAddress, _amount, msg.sender, 0);
        
        // Track supply for yield calculation
        userTotalSupplied[msg.sender] += _amount;
        
        // Track global total supplied through this contract
        contractTotalSupplied += _amount;
        
        // Initialize original supply if this is the first supply
        if (userOriginalSupply[msg.sender] == 0) {
            userOriginalSupply[msg.sender] = _amount;
        }
    }

    // Withdraw LINK from Aave pool - user must have aTokens
    function withdrawLINKFromAave(uint256 _amount) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Get aToken contract
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        
        // Check user has enough aTokens
        uint256 userATokenBalance = aToken.balanceOf(msg.sender);
        require(userATokenBalance >= _amount, "Insufficient aToken balance");
        
        // User must approve this contract to spend their aTokens
        require(aToken.transferFrom(msg.sender, address(this), _amount), "aToken transfer failed");
        
        // Now withdraw LINK from Aave pool to this contract
        uint256 actualWithdrawn = POOL.withdraw(linkAddress, _amount, address(this));
        
        // Transfer the withdrawn LINK to the user
        require(link.transfer(msg.sender, actualWithdrawn), "Transfer to user failed");
        
        // Track withdrawal for yield calculation
        userTotalWithdrawn[msg.sender] += actualWithdrawn;
        
        // Subtract from global total supplied through this contract
        contractTotalSupplied = contractTotalSupplied >= actualWithdrawn ? 
            contractTotalSupplied - actualWithdrawn : 0;
        
        return actualWithdrawn;
    }


    // Get user's aLINK (aToken) balance
    function getUserALINKBalance(address _user) external view returns (uint256) {
        // Get aToken address from reserve data
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(_user);
    }

    // Get aLINK token address
    function getALINKTokenAddress() external view returns (address) {
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        return reserveData.aTokenAddress;
    }

    // Get comprehensive user position data for yield tracking
    function getUserPositionData(address _user) external view returns (
        uint256 totalSupplied,
        uint256 totalWithdrawn, 
        uint256 netPosition,
        uint256 currentATokenBalance,
        uint256 yieldEarned
    ) {
        // Get current aToken balance
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        uint256 aTokenBalance = aToken.balanceOf(_user);
        
        // Calculate net position (total supplied - total withdrawn)
        uint256 netPos = userTotalSupplied[_user] > userTotalWithdrawn[_user] 
            ? userTotalSupplied[_user] - userTotalWithdrawn[_user] 
            : 0;
        
        uint256 yield = aTokenBalance > netPos ? aTokenBalance - netPos : 0;
        
        return (
            userTotalSupplied[_user],
            userTotalWithdrawn[_user],
            netPos,
            aTokenBalance,
            yield
        );
    }

    // Get current LINK position (how much LINK token user has in the pool)
    function getCurrentLINKPosition(address _user) external view returns (uint256) {
        // Return current aLINK balance which represents LINK tokens in the pool + accrued interest
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        return aToken.balanceOf(_user);
    }

    // Get yield earned (interest earned based on what was put in)
    function getYieldEarned(address _user) external view returns (uint256) {
        // Get current aToken balance
        DataTypes.ReserveData memory reserveData = POOL.getReserveData(linkAddress);
        IERC20 aToken = IERC20(reserveData.aTokenAddress);
        uint256 currentBalance = aToken.balanceOf(_user);
        
        // Calculate net position (total supplied - total withdrawn)
        uint256 netPosition = userTotalSupplied[_user] > userTotalWithdrawn[_user] 
            ? userTotalSupplied[_user] - userTotalWithdrawn[_user] 
            : 0;
        
        // Yield = current balance - net position
        return currentBalance > netPosition ? currentBalance - netPosition : 0;
    }

    // Get total amount deposited by users through this contract only
    function getTotalSupplied() external view returns (uint256) {
        return contractTotalSupplied;
    }

    function withdraw(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }

    receive() external payable {}
}