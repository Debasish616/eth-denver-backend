// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockWETH is ERC20, Ownable {
    constructor() ERC20("Wrapped Ethereum", "WETH") Ownable(msg.sender) {
        // Mint 1000 WETH to deployer
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // WETH uses 18 decimals
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
