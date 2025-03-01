// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockWBTC is ERC20, Ownable {
    constructor() ERC20("Wrapped Bitcoin", "WBTC") Ownable(msg.sender) {
        // Mint 1000 WBTC to deployer
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // WBTC uses 8 decimals
    function decimals() public pure override returns (uint8) {
        return 8;
    }
}
