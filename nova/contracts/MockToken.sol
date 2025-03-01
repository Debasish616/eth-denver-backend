// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IMintable.sol";

/**
 * @title MockToken
 * @dev A basic ERC20 token with minting/burning capabilities for testing
 */
contract MockToken is ERC20, AccessControl, IMintable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    uint8 private _decimals;

    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param decimals_ Token decimals
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }
    
    /**
     * @dev Returns the number of decimals used for token
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mints new tokens
     * @param account Address receiving the tokens
     * @param amount Amount to mint
     */
    function mint(address account, uint256 amount) external override onlyRole(MINTER_ROLE) {
        _mint(account, amount);
    }

    /**
     * @dev Burns tokens from account
     * @param account Address to burn tokens from
     * @param amount Amount to burn
     */
    function burn(address account, uint256 amount) external override onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }
} 