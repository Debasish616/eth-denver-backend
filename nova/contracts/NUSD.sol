// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NUSD is ERC20, Ownable {
    address public swapContract;

    modifier onlySwapContract() {
        require(msg.sender == swapContract, "Only swap contract can call");
        _;
    }

    constructor(address _swapContract) ERC20("Neutral USD", "nUSD") Ownable(msg.sender) {
        require(_swapContract != address(0), "Invalid swap contract");
        swapContract = _swapContract;
    }

    function mint(address to, uint256 amount) external onlySwapContract {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlySwapContract {
        _burn(from, amount);
    }

    function setSwapContract(address _newSwapContract) external onlyOwner {
        require(_newSwapContract != address(0), "Invalid new swap contract");
        swapContract = _newSwapContract;
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USD-like precision (e.g., USDC)
    }
}