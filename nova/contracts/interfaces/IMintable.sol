// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IMintable
 * @dev Interface for tokens that can be minted and burned
 */
interface IMintable {
    /**
     * @dev Mints new tokens and assigns them to the specified account
     * @param account The account that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address account, uint256 amount) external;
    
    /**
     * @dev Burns tokens from the specified account
     * @param account The account whose tokens will be burned
     * @param amount The amount of tokens to burn
     */
    function burn(address account, uint256 amount) external;
} 