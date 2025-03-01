// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SNUSDStaking
 * @dev A simple staking contract for NUSD to get sNUSD with 7-day locking period
 */
contract SNUSDStaking is Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public nusdToken;
    IERC20 public sNusdToken;
    
    // Constants
    uint256 public constant UNSTAKE_LOCK_PERIOD = 7 days;
    
    // Unstake request structure
    struct UnstakeRequest {
        uint256 amount;
        uint256 unlockTime;
        bool completed;
    }
    
    // Mapping of unstake requests per user
    mapping(address => UnstakeRequest[]) public unstakeRequests;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime);
    event Unstaked(address indexed user, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _nusdToken Address of the NUSD token
     * @param _sNusdToken Address of the sNUSD token
     */
    constructor(address _nusdToken, address _sNusdToken) Ownable(msg.sender) {
        nusdToken = IERC20(_nusdToken);
        sNusdToken = IERC20(_sNusdToken);
    }
    
    /**
     * @dev Stake NUSD to receive sNUSD
     * @param amount Amount of NUSD to stake
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        
        // Transfer NUSD from the user to this contract
        nusdToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Transfer sNUSD from this contract to the user
        sNusdToken.safeTransfer(msg.sender, amount);
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Request to unstake sNUSD, subject to 7-day lock period
     * @param amount Amount of sNUSD to unstake
     */
    function initiateUnstake(uint256 amount) external {
        require(amount > 0, "Cannot unstake 0");
        
        // Transfer sNUSD from the user to this contract
        sNusdToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Create unstake request
        uint256 unlockTime = block.timestamp + UNSTAKE_LOCK_PERIOD;
        unstakeRequests[msg.sender].push(UnstakeRequest({
            amount: amount,
            unlockTime: unlockTime,
            completed: false
        }));
        
        emit UnstakeRequested(msg.sender, amount, unlockTime);
    }
    
    /**
     * @dev Complete unstaking after lock period
     * @param requestId ID of the unstake request
     */
    function completeUnstake(uint256 requestId) external {
        require(requestId < unstakeRequests[msg.sender].length, "Invalid request ID");
        
        UnstakeRequest storage request = unstakeRequests[msg.sender][requestId];
        
        require(!request.completed, "Request already completed");
        require(block.timestamp >= request.unlockTime, "Lock period not yet over");
        
        // Mark request as completed
        request.completed = true;
        
        // Return NUSD to the user
        nusdToken.safeTransfer(msg.sender, request.amount);
        
        emit Unstaked(msg.sender, request.amount);
    }
    
    /**
     * @dev Get details of a specific unstake request
     * @param user Address of the user
     * @param requestId ID of the unstake request
     */
    function getUnstakeRequest(address user, uint256 requestId) external view 
        returns (uint256 amount, uint256 unlockTime, bool completed) 
    {
        require(requestId < unstakeRequests[user].length, "Invalid request ID");
        
        UnstakeRequest storage request = unstakeRequests[user][requestId];
        return (request.amount, request.unlockTime, request.completed);
    }
    
    /**
     * @dev Get number of unstake requests for a user
     * @param user Address of the user
     */
    function getUnstakeRequestCount(address user) external view returns (uint256) {
        return unstakeRequests[user].length;
    }
    
    /**
     * @dev Emergency function to recover tokens
     * @param token Address of the token to recover
     * @param amount Amount to recover
     */
    function recoverTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
} 