// Sepolia Etherscan Contract Link: https://sepolia.etherscan.io/address/0x716C91b6f283c3127133D85E3c0d9eF1A6DD16F6

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CompoundUSDCSupplier
 * @dev Smart contract to help users onboard to DeFi by supplying USDC to Compound III
 * @notice This contract provides easy-to-use functions for supplying USDC to earn yield through Compound Protocol
 */

// Compound III (Comet) Interface for USDC market
interface IComet {
    function supply(address asset, uint amount) external;

    function supplyTo(address dst, address asset, uint amount) external;

    function withdraw(address asset, uint amount) external;

    function withdrawTo(address to, address asset, uint amount) external;

    function balanceOf(address account) external view returns (uint256);

    function collateralBalanceOf(
        address account,
        address asset
    ) external view returns (uint128);

    function getSupplyRate(uint utilization) external view returns (uint64);

    function baseTrackingSupplySpeed() external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function getUtilization() external view returns (uint256);
}

// Price Feed Interface for yield calculations
interface IPriceFeed {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract CompoundUSDCSupplier is ReentrancyGuard, Ownable {
    // Compound III USDC market on Sepolia testnet
    IComet public constant COMET =
        IComet(0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e);

    // USDC token contract on Sepolia testnet (from Compound configuration)
    IERC20 public constant USDC =
        IERC20(0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238);

    // Minimum amounts for supply/withdraw (1 USDC)
    uint256 public constant MIN_SUPPLY_AMOUNT = 1e6; // 1 USDC (6 decimals)
    uint256 public constant MIN_WITHDRAW_AMOUNT = 1e6; // 1 USDC (6 decimals)

    // User tracking for DeFi onboarding insights
    struct UserInfo {
        uint256 totalSupplied;
        uint256 lastSupplyTime;
        uint256 accumulatedYield;
        bool hasEverSupplied;
    }

    mapping(address => UserInfo) public userInfo;
    uint256 public totalUsers;
    uint256 public totalSuppliedAmount;

    // Events for tracking user DeFi journey
    event USDCSupplied(address indexed user, uint256 amount, uint256 timestamp);
    event USDCWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    event YieldEarned(address indexed user, uint256 yieldAmount);
    event UserOnboarded(address indexed user, uint256 firstSupplyAmount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    constructor() {}

    /**
     * @notice Supply USDC to Compound III to start earning yield
     * @param amount Amount of USDC to supply (in 6 decimal format)
     * @dev Users need to approve this contract to spend their USDC first
     */
    function supplyUSDC(uint256 amount) external nonReentrant {
        require(amount >= MIN_SUPPLY_AMOUNT, "Amount too small");
        require(
            USDC.balanceOf(msg.sender) >= amount,
            "Insufficient USDC balance"
        );
        require(
            USDC.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer USDC from user to this contract
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve Compound to spend USDC
        USDC.approve(address(COMET), amount);

        // Supply USDC to Compound as the contract
        COMET.supply(address(USDC), amount);

        // Update user info and stats
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

        emit USDCSupplied(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Supply USDC to Compound III for another address
     * @param recipient Address that will receive the Compound balance
     * @param amount Amount of USDC to supply
     */
    function supplyUSDCTo(
        address recipient,
        uint256 amount
    ) external nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount >= MIN_SUPPLY_AMOUNT, "Amount too small");
        require(
            USDC.balanceOf(msg.sender) >= amount,
            "Insufficient USDC balance"
        );
        require(
            USDC.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer USDC from user to this contract
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve Compound to spend USDC
        USDC.approve(address(COMET), amount);

        // Supply USDC to Compound for the recipient
        COMET.supplyTo(recipient, address(USDC), amount);

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

        emit USDCSupplied(recipient, amount, block.timestamp);
    }

    /**
     * @notice Withdraw USDC from Compound III
     * @param amount Amount of USDC to withdraw
     */
    function withdrawUSDC(uint256 amount) external nonReentrant {
        require(amount >= MIN_WITHDRAW_AMOUNT, "Amount too small");

        UserInfo storage user = userInfo[msg.sender];
        require(user.totalSupplied >= amount, "Cannot withdraw more than supplied");

        // Get current balances
        uint256 compoundBalance = COMET.balanceOf(address(this));
        uint256 initialContractBalance = USDC.balanceOf(address(this));
        
        // Withdraw from Compound first (whatever is available)
        if (compoundBalance > 0) {
            // Withdraw the lesser of: requested amount or available balance
            uint256 withdrawFromCompound = amount <= compoundBalance ? amount : compoundBalance;
            COMET.withdraw(address(USDC), withdrawFromCompound);
        }
        
        // Check how much USDC we actually have after withdrawal
        uint256 finalContractBalance = USDC.balanceOf(address(this));
        uint256 actualAvailable = finalContractBalance;
        
        // Transfer whatever amount is available (up to requested amount)
        uint256 actualWithdrawAmount = amount <= actualAvailable ? amount : actualAvailable;
        require(actualWithdrawAmount > 0, "No USDC available for withdrawal");
        
        // Transfer the actual available amount to user
        require(USDC.transfer(msg.sender, actualWithdrawAmount), "Transfer failed");

        // Update user stats based on actual withdrawal
        if (actualWithdrawAmount >= user.totalSupplied) {
            user.totalSupplied = 0;
        } else {
            user.totalSupplied -= actualWithdrawAmount;
        }

        // Update global stats
        if (totalSuppliedAmount >= actualWithdrawAmount) {
            totalSuppliedAmount -= actualWithdrawAmount;
        } else {
            totalSuppliedAmount = 0;
        }

        emit USDCWithdrawn(msg.sender, actualWithdrawAmount, block.timestamp);
    }

    /**
     * @notice Withdraw all USDC from Compound III
     * @dev Withdraws the user's entire Compound balance
     */
    function withdrawAllUSDC() external nonReentrant {
        // Get current balance in Compound
        uint256 compoundBalance = COMET.balanceOf(address(this));
        require(compoundBalance > 0, "No balance to withdraw");

        UserInfo storage user = userInfo[msg.sender];

        // Calculate yield earned before withdrawal
        uint256 yieldEarned = 0;
        if (compoundBalance > user.totalSupplied) {
            yieldEarned = compoundBalance - user.totalSupplied;
            user.accumulatedYield += yieldEarned;
            emit YieldEarned(msg.sender, yieldEarned);
        }

        // Withdraw entire balance from Compound
        COMET.withdraw(address(USDC), compoundBalance);

        // Reset user stats since they withdrew everything
        user.totalSupplied = 0;

        // Update global stats
        if (totalSuppliedAmount >= compoundBalance) {
            totalSuppliedAmount -= compoundBalance;
        } else {
            totalSuppliedAmount = 0;
        }

        emit USDCWithdrawn(msg.sender, compoundBalance, block.timestamp);
    }

    /**
     * @notice Get user's current balance in Compound III
     * @param user Address to check
     * @return Current USDC balance in Compound
     */
    function getUserCompoundBalance(
        address user
    ) external view returns (uint256) {
        return COMET.balanceOf(address(this));
    }

    /**
     * @notice Get detailed balance information for debugging
     * @param user Address to check
     * @return compoundBalance Current balance in Compound
     * @return trackedSupplied Amount we've tracked as supplied
     * @return estimatedYield Estimated yield earned
     */
    function getDetailedBalance(
        address user
    )
        external
        view
        returns (
            uint256 compoundBalance,
            uint256 trackedSupplied,
            uint256 estimatedYield
        )
    {
        compoundBalance = COMET.balanceOf(address(this));
        trackedSupplied = userInfo[user].totalSupplied;
        estimatedYield = compoundBalance > trackedSupplied
            ? compoundBalance - trackedSupplied
            : 0;
    }

    /**
     * @notice Get user's collateral balance (if any)
     * @param user Address to check
     * @return Collateral balance in USDC
     */
    function getUserCollateralBalance(
        address user
    ) external view returns (uint128) {
        return COMET.collateralBalanceOf(user, address(USDC));
    }

    /**
     * @notice Get current supply rate from Compound
     * @return Current supply APR (scaled by 1e18)
     */
    function getCurrentSupplyRate() external view returns (uint64) {
        uint256 utilization = COMET.getUtilization();
        return COMET.getSupplyRate(utilization);
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
     * @notice Calculate estimated yield for a user over a period
     * @param user Address to calculate for
     * @param daysAhead Number of days to project forward
     * @return Estimated yield in USDC
     */
    function calculateEstimatedYield(
        address user,
        uint256 daysAhead
    ) external view returns (uint256) {
        UserInfo memory userInfoData = userInfo[user];
        if (userInfoData.totalSupplied == 0) return 0;

        // Get current compound balance
        uint256 currentBalance = COMET.balanceOf(address(this));

        // Calculate current yield rate (approximate)
        uint256 utilization = COMET.getUtilization();
        uint64 supplyRate = COMET.getSupplyRate(utilization);

        // Estimate daily yield (supplyRate is annual, scaled by 1e18)
        uint256 dailyYield = (currentBalance * supplyRate * daysAhead) /
            (365 * 1e18);

        return dailyYield;
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
     * @notice Get contract's USDC balance
     * @return USDC balance of this contract
     */
    function getContractUSDCBalance() external view returns (uint256) {
        return USDC.balanceOf(address(this));
    }

    /**
     * @notice Get user's USDC allowance for this contract
     * @param user Address to check allowance for
     * @return Allowance amount
     */
    function getUserUSDCAllowance(
        address user
    ) external view returns (uint256) {
        return USDC.allowance(user, address(this));
    }

    /**
     * @notice Emergency withdrawal function (only owner)
     * @param amount Amount to withdraw
     * @dev Only for emergency situations
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(
            USDC.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        require(USDC.transfer(owner(), amount), "Transfer failed");
        emit EmergencyWithdrawal(owner(), amount);
    }

    /**
     * @notice Get Compound market information
     * @return Total supply in the market, current utilization rate
     */
    function getMarketInfo() external view returns (uint256, uint256) {
        return (COMET.totalSupply(), COMET.getUtilization());
    }
}
