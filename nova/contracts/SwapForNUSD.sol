// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NUSD.sol";

contract SwapForNUSD is Ownable {
    NUSD public nusd;
    IERC20 public corebtc; // CoreBTC as collateral

    mapping(address => uint256) public deposits;

    event SwappedToNUSD(address indexed user, uint256 corebtcAmount, uint256 nusdAmount);
    event RedeemedFromNUSD(address indexed user, uint256 nusdAmount, uint256 corebtcAmount);

    constructor(address _corebtc, address _nusd) Ownable(msg.sender) {
        corebtc = IERC20(_corebtc);
        nusd = NUSD(_nusd);
    }

    function swapToNUSD(uint256 corebtcAmount) external {
        require(corebtcAmount > 0, "Amount must be greater than 0");
        require(corebtc.transferFrom(msg.sender, address(this), corebtcAmount), "CoreBTC transfer failed");

        // Simplified: 1 CoreBTC = $70,000 USD, so 1 CoreBTC = 70,000 nUSD (adjust with oracle in production)
        uint256 nusdAmount = corebtcAmount * 70000 * 10**6 / 10**8; // Adjust decimals: 8 -> 6
        deposits[msg.sender] += corebtcAmount;
        nusd.mint(msg.sender, nusdAmount);

        emit SwappedToNUSD(msg.sender, corebtcAmount, nusdAmount);
    }

    function redeemFromNUSD(uint256 nusdAmount) external {
        require(nusdAmount > 0, "Amount must be greater than 0");
        uint256 corebtcAmount = nusdAmount * 10**8 / (70000 * 10**6); // Reverse calculation
        require(deposits[msg.sender] >= corebtcAmount, "Insufficient deposit");
        require(nusd.transferFrom(msg.sender, address(this), nusdAmount), "nUSD transfer failed");

        deposits[msg.sender] -= corebtcAmount;
        nusd.burn(address(this), nusdAmount);
        require(corebtc.transfer(msg.sender, corebtcAmount), "CoreBTC transfer failed");

        emit RedeemedFromNUSD(msg.sender, nusdAmount, corebtcAmount);
    }

    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}