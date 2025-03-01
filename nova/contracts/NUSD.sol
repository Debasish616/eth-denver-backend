// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Importing OpenZeppelin's ERC20 implementation for standard token functionality
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NUSD is ERC20, Ownable, AccessControl {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Event for minting
    event Mint(address indexed to, uint256 amount);
    // Event for burning
    event Burn(address indexed from, uint256 amount);

    // Constructor to initialize the token with name and symbol
    constructor() ERC20("NUSD Stablecoin", "nUSD") Ownable(msg.sender) {
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        
        // Initial supply (optional): mint 1,000,000 nUSD to deployer with 18 decimals
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    // Mint function - only minters can mint new tokens
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Mint amount must be greater than 0");
        
        _mint(to, amount);
        emit Mint(to, amount);
    }

    // Burn function - anyone can burn their own tokens
    function burn(uint256 amount) public {
        require(amount > 0, "Burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }

    // Allow specific roles to burn tokens from any address (if approved)
    function burnFrom(address account, uint256 amount) public onlyRole(BURNER_ROLE) {
        require(account != address(0), "Cannot burn from zero address");
        require(amount > 0, "Burn amount must be greater than 0");
        
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _burn(account, amount);
        emit Burn(account, amount);
    }

    // Function to recover tokens sent to contract by mistake
    function recoverTokens(address tokenAddress, uint256 amount) public onlyOwner {
        require(tokenAddress != address(this), "Cannot recover nUSD tokens");
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    // Override decimals to use 18 decimals
    function decimals() public pure virtual override returns (uint8) {
        return 18; // Standard ERC-20 decimal places
    }
    
    // Required override for AccessControl when combined with other inheritance
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}