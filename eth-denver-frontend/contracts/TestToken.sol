// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev ERC20 Token with a public mint function for testnet use
 */
contract TestToken is ERC20, Ownable {
    uint8 private _decimals;
    uint256 public mintLimit = 1000 * 10**18; // 1000 tokens max per mint
    
    mapping(address => uint256) public lastMintTime;
    uint256 public mintCooldown = 1 hours; // 1 hour cooldown between mints

    /**
     * @dev Constructor that sets name, symbol, and decimals
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _decimals = decimalsValue;
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Public mint function that allows anyone to mint tokens up to mintLimit
     * with a cooldown period between mints
     */
    function mint(address to, uint256 amount) public returns (bool) {
        require(amount <= mintLimit, "Amount exceeds mint limit");
        require(
            block.timestamp >= lastMintTime[to] + mintCooldown || lastMintTime[to] == 0,
            "Cooldown period not passed"
        );
        
        _mint(to, amount);
        lastMintTime[to] = block.timestamp;
        
        return true;
    }
    
    /**
     * @dev Owner can mint without limits or cooldown
     */
    function ownerMint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Owner can update mint limit
     */
    function setMintLimit(uint256 newLimit) public onlyOwner {
        mintLimit = newLimit;
    }
    
    /**
     * @dev Owner can update cooldown period
     */
    function setMintCooldown(uint256 newCooldown) public onlyOwner {
        mintCooldown = newCooldown;
    }
} 