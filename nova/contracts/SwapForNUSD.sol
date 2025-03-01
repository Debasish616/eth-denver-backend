// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NUSD.sol";

contract SwapForNUSD is Ownable {
    NUSD public nusd;
    
    // Supported collateral tokens
    mapping(address => bool) public supportedCollaterals;
    
    // Price feeds for collaterals in USD (scaled by 10^8)
    // For testnet, we'll use fixed prices but in production would use oracles
    mapping(address => uint256) public collateralPrices;
    
    // Collateral decimals
    mapping(address => uint8) public collateralDecimals;
    
    // User deposits per collateral type
    mapping(address => mapping(address => uint256)) public deposits;

    event CollateralAdded(address indexed token, uint256 price, uint8 decimals);
    event CollateralRemoved(address indexed token);
    event PriceUpdated(address indexed token, uint256 newPrice);
    event SwappedToNUSD(address indexed user, address indexed token, uint256 tokenAmount, uint256 nusdAmount);
    event RedeemedFromNUSD(address indexed user, address indexed token, uint256 nusdAmount, uint256 tokenAmount);

    constructor(address _nusd) Ownable(msg.sender) {
        nusd = NUSD(_nusd);
    }
    
    // Add or update a supported collateral token
    function addCollateral(address token, uint256 price, uint8 decimals) external onlyOwner {
        supportedCollaterals[token] = true;
        collateralPrices[token] = price;
        collateralDecimals[token] = decimals;
        emit CollateralAdded(token, price, decimals);
    }
    
    // Remove a collateral token
    function removeCollateral(address token) external onlyOwner {
        supportedCollaterals[token] = false;
        emit CollateralRemoved(token);
    }
    
    // Update price of a collateral token
    function updatePrice(address token, uint256 newPrice) external onlyOwner {
        require(supportedCollaterals[token], "Token not supported");
        collateralPrices[token] = newPrice;
        emit PriceUpdated(token, newPrice);
    }

    // Swap any supported collateral token for NUSD
    function swapToNUSD(address token, uint256 tokenAmount) external {
        require(supportedCollaterals[token], "Token not supported");
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        // Calculate NUSD amount based on token price and decimals
        // Token price is in USD with 8 decimals precision
        // NUSD has 18 decimals
        uint256 nusdAmount = calculateNUSDAmount(token, tokenAmount);
        
        // Update user's deposit
        deposits[msg.sender][token] += tokenAmount;
        
        // Mint NUSD to user
        nusd.mint(msg.sender, nusdAmount);

        emit SwappedToNUSD(msg.sender, token, tokenAmount, nusdAmount);
    }

    // Redeem NUSD for any supported collateral token
    function redeemFromNUSD(address token, uint256 nusdAmount) external {
        require(supportedCollaterals[token], "Token not supported");
        require(nusdAmount > 0, "Amount must be greater than 0");
        
        // Calculate token amount based on NUSD amount
        uint256 tokenAmount = calculateTokenAmount(token, nusdAmount);
        
        require(deposits[msg.sender][token] >= tokenAmount, "Insufficient deposit");
        require(nusd.transferFrom(msg.sender, address(this), nusdAmount), "NUSD transfer failed");

        // Update user's deposit
        deposits[msg.sender][token] -= tokenAmount;
        
        // Burn NUSD
        nusd.burn(nusdAmount);
        
        // Transfer collateral back to user
        require(IERC20(token).transfer(msg.sender, tokenAmount), "Token transfer failed");

        emit RedeemedFromNUSD(msg.sender, token, nusdAmount, tokenAmount);
    }
    
    // Calculate NUSD amount from token amount
    function calculateNUSDAmount(address token, uint256 tokenAmount) public view returns (uint256) {
        uint256 tokenPrice = collateralPrices[token];
        uint8 tokenDecimals = collateralDecimals[token];
        
        // Calculate USD value: (tokenAmount * tokenPrice) / 10^8
        uint256 usdValue = (tokenAmount * tokenPrice) / (10**8);
        
        // Adjust decimals from token to NUSD (18 decimals)
        // If token has 6 decimals (USDC/USDT), we multiply by 10^12
        // If token has 8 decimals (WBTC), we multiply by 10^10
        // If token has 18 decimals (WETH), we don't adjust
        if (tokenDecimals < 18) {
            usdValue = usdValue * (10**(18 - tokenDecimals));
        }
        
        return usdValue;
    }
    
    // Calculate token amount from NUSD amount
    function calculateTokenAmount(address token, uint256 nusdAmount) public view returns (uint256) {
        uint256 tokenPrice = collateralPrices[token];
        uint8 tokenDecimals = collateralDecimals[token];
        
        // Adjust decimals from NUSD (18 decimals) to token
        uint256 adjustedAmount = nusdAmount;
        if (tokenDecimals < 18) {
            adjustedAmount = nusdAmount / (10**(18 - tokenDecimals));
        }
        
        // Calculate token amount: (adjustedAmount * 10^8) / tokenPrice
        uint256 tokenAmount = (adjustedAmount * (10**8)) / tokenPrice;
        
        return tokenAmount;
    }

    // Withdraw any ERC20 token (emergency function)
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}