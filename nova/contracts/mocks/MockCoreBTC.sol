// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockCoreBTC is ERC20 {
    constructor() ERC20("Core Wrapped BTC", "CoreBTC") {
        _mint(msg.sender, 1000 * 10**8); // 1000 CoreBTC, 8 decimals
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }
}