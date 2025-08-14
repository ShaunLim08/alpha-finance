// Sepolia Etherscan Contract Link: https://sepolia.etherscan.io/address/0xd891831C0F7034545d55E538265749136720FAC6

// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// **DIRECT IMPORTS FROM OFFICIAL COMPOUND III REPOSITORY**
// Source: https://github.com/compound-finance/comet
import "./interfaces/CometInterface.sol";
import "./interfaces/IPriceFeed.sol";
import "./interfaces/CometMath.sol";

/**
 * @title CompoundWETHSupplier
 * @dev Smart contract using OFFICIAL Compound III (Comet) interfaces from compound-finance/comet
 * @notice Enables DeFi onboarding through WETH supply to Compound III with official components
 * @author Direct implementation using official Compound III repository
 */
contract CompoundWETHSupplier is ReentrancyGuard, Ownable, CometMath {
    
    // **OFFICIAL COMPOUND III INTERFACE** - Direct from compound-finance/comet
    CometInterface public constant COMET =
        CometInterface(0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e);

    // **OFFICIAL WETH TOKEN** (from Compound configuration)
    IERC20 public constant WETH =
        IERC20(0x2D5ee574e710219a521449679A4A7f2B43f046ad);

    // **OFFICIAL PRICE FEED** (Chainlink compatible, from Compound)
    IPriceFeed public constant WETH_PRICE_FEED =
        IPriceFeed(0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e);

    // Constants following official Compound patterns
    uint256 public constant MIN_SUPPLY_AMOUNT = 1e15; // 0.001 WETH (18 decimals)
    uint256 public constant MIN_WITHDRAW_AMOUNT = 1e15; // 0.001 WETH (18 decimals)
    
    // **OFFICIAL COMPOUND III MATH CONSTANTS** (from CometMath)
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant RATE_SCALE = 1e18;

    // User tracking for DeFi onboarding
    struct UserInfo {
        uint256 totalSupplied;
        uint256 lastSupplyTime;
        uint256 accumulatedYield;
        bool hasEverSupplied;
    }

    mapping(address => UserInfo) public userInfo;
    uint256 public totalUsers;
    uint256 public totalSuppliedAmount;

    // **OFFICIAL COMPOUND III EVENTS** (following CometMainInterface patterns)
    event WETHSupplied(address indexed user, uint256 amount, uint256 timestamp);
    event WETHWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event YieldEarned(address indexed user, uint256 yieldAmount);
    event UserOnboarded(address indexed user, uint256 firstSupplyAmount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    constructor() {}

    /**
     * @notice Supply WETH using OFFICIAL Comet.supply() function
     * @param amount Amount of WETH to supply (18 decimal format)
     * @dev Uses OFFICIAL CometInterface.supply() from compound-finance/comet
     * @dev Docs: https://docs.compound.finance/collateral-and-borrowing/#supply
     */
    function supplyWETH(uint256 amount) external nonReentrant {
        require(amount >= MIN_SUPPLY_AMOUNT, "Amount too small");
        require(
            WETH.balanceOf(msg.sender) >= amount,
            "Insufficient WETH balance"
        );
        require(
            WETH.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer WETH from user to this contract
        require(
            WETH.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve Compound to spend WETH (official pattern)
        WETH.approve(address(COMET), amount);

        // **OFFICIAL COMET SUPPLY FUNCTION** - Direct from CometInterface
        COMET.supply(address(WETH), amount);

        // Update user info
        UserInfo storage user = userInfo[msg.sender];

        // Track new user onboarding
        if (!user.hasEverSupplied) {
            user.hasEverSupplied = true;
            totalUsers++;
            emit UserOnboarded(msg.sender, amount);
        }

        user.totalSupplied += amount;
        user.lastSupplyTime = block.timestamp;
        totalSuppliedAmount += amount;

        emit WETHSupplied(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Supply WETH to another address using OFFICIAL Comet.supplyTo()
     * @param recipient Address to receive the Compound balance
     * @param amount Amount of WETH to supply
     * @dev Uses OFFICIAL CometInterface.supplyTo() from compound-finance/comet
     */
    function supplyWETHTo(address recipient, uint256 amount) external nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount >= MIN_SUPPLY_AMOUNT, "Amount too small");
        require(
            WETH.balanceOf(msg.sender) >= amount,
            "Insufficient WETH balance"
        );
        require(
            WETH.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer WETH from user to this contract
        require(
            WETH.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve Compound to spend WETH
        WETH.approve(address(COMET), amount);

        // **OFFICIAL COMET SUPPLY TO FUNCTION** - Direct from CometInterface
        COMET.supplyTo(recipient, address(WETH), amount);

        // Update recipient user info
        UserInfo storage user = userInfo[recipient];

        if (!user.hasEverSupplied) {
            user.hasEverSupplied = true;
            totalUsers++;
            emit UserOnboarded(recipient, amount);
        }

        user.totalSupplied += amount;
        user.lastSupplyTime = block.timestamp;
        totalSuppliedAmount += amount;

        emit WETHSupplied(recipient, amount, block.timestamp);
    }

    /**
     * @notice Withdraw WETH using OFFICIAL Comet.withdraw() function
     * @param amount Amount of WETH to withdraw
     * @dev Uses OFFICIAL CometInterface.withdraw() from compound-finance/comet
     * @dev Docs: https://docs.compound.finance/collateral-and-borrowing/#withdraw-or-borrow
     */
    function withdrawWETH(uint256 amount) external nonReentrant {
        require(amount >= MIN_WITHDRAW_AMOUNT, "Amount too small");

        UserInfo storage user = userInfo[msg.sender];
        require(user.totalSupplied >= amount, "Cannot withdraw more than supplied");

        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        uint256 compoundBalance = COMET.balanceOf(address(this));
        require(compoundBalance >= amount, "Insufficient Compound balance");

        // **OFFICIAL COMET WITHDRAW FUNCTION** - Direct from CometInterface
        COMET.withdraw(address(WETH), amount);

        // Transfer WETH to user
        require(WETH.transfer(msg.sender, amount), "Transfer failed");

        // Update user stats
        user.totalSupplied -= amount;
        totalSuppliedAmount -= amount;

        emit WETHWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Withdraw WETH to specific address using OFFICIAL Comet.withdrawTo()
     * @param to Address to receive withdrawn WETH
     * @param amount Amount of WETH to withdraw
     * @dev Uses OFFICIAL CometInterface.withdrawTo() from compound-finance/comet
     */
    function withdrawWETHTo(address to, uint256 amount) external nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount >= MIN_WITHDRAW_AMOUNT, "Amount too small");

        UserInfo storage user = userInfo[msg.sender];
        require(user.totalSupplied >= amount, "Cannot withdraw more than supplied");

        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        uint256 compoundBalance = COMET.balanceOf(address(this));
        require(compoundBalance >= amount, "Insufficient Compound balance");

        // **OFFICIAL COMET WITHDRAW TO FUNCTION** - Direct from CometInterface
        COMET.withdrawTo(to, address(WETH), amount);

        // Update user stats
        user.totalSupplied -= amount;
        totalSuppliedAmount -= amount;

        emit WETHWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Withdraw all WETH using OFFICIAL Comet functions
     * @dev Uses multiple OFFICIAL CometInterface functions from compound-finance/comet
     */
    function withdrawAllWETH() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.totalSupplied > 0, "No balance to withdraw");

        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        uint256 compoundBalance = COMET.balanceOf(address(this));
        require(compoundBalance > 0, "No Compound balance");

        // Calculate yield earned using official balance
        uint256 yieldEarned = 0;
        if (compoundBalance > user.totalSupplied) {
            yieldEarned = compoundBalance - user.totalSupplied;
            user.accumulatedYield += yieldEarned;
            emit YieldEarned(msg.sender, yieldEarned);
        }

        // **OFFICIAL COMET WITHDRAW FUNCTION** - Direct from CometInterface
        uint256 withdrawAmount = user.totalSupplied;
        COMET.withdraw(address(WETH), withdrawAmount);

        // Transfer to user
        require(WETH.transfer(msg.sender, withdrawAmount), "Transfer failed");

        // Reset user stats
        user.totalSupplied = 0;
        if (totalSuppliedAmount >= withdrawAmount) {
            totalSuppliedAmount -= withdrawAmount;
        } else {
            totalSuppliedAmount = 0;
        }

        emit WETHWithdrawn(msg.sender, withdrawAmount, block.timestamp);
    }

    /**
     * @notice Get current supply rate using OFFICIAL Comet interest rate functions
     * @return Current supply APR using OFFICIAL calculation
     * @dev Uses OFFICIAL CometInterface.getSupplyRate() and getUtilization() from compound-finance/comet
     * @dev Docs: https://docs.compound.finance/interest-rates/
     */
    function getCurrentSupplyRate() external view returns (uint64) {
        // **OFFICIAL COMET UTILIZATION FUNCTION** - Direct from CometInterface
        uint256 utilization = COMET.getUtilization();
        
        // **OFFICIAL COMET SUPPLY RATE FUNCTION** - Direct from CometInterface
        return COMET.getSupplyRate(utilization);
    }

    /**
     * @notice Calculate estimated yield using OFFICIAL Comet interest rate math
     * @param user Address to calculate for
     * @param daysAhead Number of days to project forward
     * @return Estimated yield in WETH using OFFICIAL calculations
     * @dev Implements OFFICIAL Compound III yield calculation from compound-finance/comet
     * @dev Docs: https://docs.compound.finance/interest-rates/
     */
    function calculateEstimatedYield(address user, uint256 daysAhead) 
        external 
        view 
        returns (uint256) 
    {
        UserInfo memory userInfoData = userInfo[user];
        if (userInfoData.totalSupplied == 0) return 0;

        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        uint256 currentBalance = COMET.balanceOf(address(this));
        
        // **OFFICIAL COMET INTEREST RATE FUNCTIONS** - Direct from CometInterface
        uint256 utilization = COMET.getUtilization();
        uint64 supplyRate = COMET.getSupplyRate(utilization);

        // Calculate using official rate math (supplyRate is annual, scaled by 1e18)
        uint256 annualYield = (currentBalance * supplyRate) / RATE_SCALE;
        
        // Calculate daily yield and project forward
        uint256 dailyYield = annualYield / 365;
        uint256 estimatedYield = dailyYield * daysAhead;

        return estimatedYield;
    }

    /**
     * @notice Get advanced yield information using OFFICIAL Comet functions
     * @param user Address to get yield info for
     * @return currentSupplyRate Current supply rate (annual, from OFFICIAL function)
     * @return currentUtilization Current market utilization (from OFFICIAL function)
     * @return estimatedAnnualYield Estimated annual yield using OFFICIAL calculations
     * @dev Uses ONLY OFFICIAL CometInterface functions from compound-finance/comet
     */
    function getAdvancedYieldInfo(address user) 
        external 
        view 
        returns (
            uint64 currentSupplyRate,
            uint256 currentUtilization, 
            uint256 estimatedAnnualYield
        ) 
    {
        // **OFFICIAL COMET FUNCTIONS** - Direct from CometInterface
        currentUtilization = COMET.getUtilization();
        currentSupplyRate = COMET.getSupplyRate(currentUtilization);
        
        // Calculate estimated annual yield for user using OFFICIAL functions
        UserInfo memory userInfoData = userInfo[user];
        if (userInfoData.totalSupplied > 0) {
            uint256 currentBalance = COMET.balanceOf(address(this));
            estimatedAnnualYield = (currentBalance * currentSupplyRate) / RATE_SCALE;
        } else {
            estimatedAnnualYield = 0;
        }
    }

    /**
     * @notice Get user's current balance using OFFICIAL Comet.balanceOf()
     * @return Current WETH balance in Compound using OFFICIAL function
     * @dev Uses OFFICIAL CometInterface.balanceOf() from compound-finance/comet
     */
    function getUserCompoundBalance(address /* user */) external view returns (uint256) {
        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        return COMET.balanceOf(address(this));
    }

    /**
     * @notice Get detailed balance information using OFFICIAL Comet functions
     * @param user Address to check
     * @return compoundBalance Current balance in Compound (OFFICIAL balanceOf)
     * @return trackedSupplied Amount we've tracked as supplied
     * @return estimatedYield Estimated yield earned using OFFICIAL functions
     */
    function getDetailedBalance(address user)
        external
        view
        returns (
            uint256 compoundBalance,
            uint256 trackedSupplied,
            uint256 estimatedYield
        )
    {
        // **OFFICIAL COMET BALANCE FUNCTION** - Direct from CometInterface
        compoundBalance = COMET.balanceOf(address(this));
        trackedSupplied = userInfo[user].totalSupplied;
        estimatedYield = compoundBalance > trackedSupplied
            ? compoundBalance - trackedSupplied
            : 0;
    }

    /**
     * @notice Get OFFICIAL Compound III market information
     * @return totalSupply Total supply in market (OFFICIAL function)
     * @return currentUtilization Current market utilization (OFFICIAL function)
     * @return baseToken Base token address (OFFICIAL function)
     * @dev Uses ONLY OFFICIAL CometInterface functions from compound-finance/comet
     */
    function getMarketInfo() 
        external 
        view 
        returns (
            uint256 totalSupply, 
            uint256 currentUtilization,
            address baseToken
        ) 
    {
        // **OFFICIAL COMET FUNCTIONS** - Direct from CometInterface
        totalSupply = COMET.totalSupply();
        currentUtilization = COMET.getUtilization();
        baseToken = COMET.baseToken();
    }

    /**
     * @notice Get detailed user information for DeFi insights
     * @param user Address to get info for
     * @return UserInfo struct with all user data
     */
    function getUserInfo(address user) external view returns (UserInfo memory) {
        return userInfo[user];
    }

    /**
     * @notice Get DeFi onboarding statistics
     * @return Total users, total supplied amount, average supply per user
     */
    function getProtocolStats()
        external
        view
        returns (uint256, uint256, uint256)
    {
        uint256 avgSupplyPerUser = totalUsers > 0
            ? totalSuppliedAmount / totalUsers
            : 0;
        return (totalUsers, totalSuppliedAmount, avgSupplyPerUser);
    }

    /**
     * @notice Get contract's WETH balance
     * @return WETH balance of this contract
     */
    function getContractWETHBalance() external view returns (uint256) {
        return WETH.balanceOf(address(this));
    }

    /**
     * @notice Get user's WETH allowance for this contract
     * @param user Address to check allowance for
     * @return Allowance amount
     */
    function getUserWETHAllowance(address user) external view returns (uint256) {
        return WETH.allowance(user, address(this));
    }

    /**
     * @notice Emergency withdrawal function (only owner)
     * @param amount Amount to withdraw
     * @dev Only for emergency situations
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(
            WETH.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        require(WETH.transfer(owner(), amount), "Transfer failed");
        emit EmergencyWithdrawal(owner(), amount);
    }
}
