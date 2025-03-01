const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NUSD and SwapForNUSD", function () {
  let nusd, swapForNUSD;
  let mockUSDC, mockUSDT, mockWETH, mockWBTC;
  let owner, user1, user2;

  // Constants for testing
  let usdcAmount, usdtAmount, wethAmount, wbtcAmount;
  
  before(async function() {
    usdcAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDC
    usdtAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDT
    wethAmount = ethers.utils.parseEther("1"); // 1 WETH
    wbtcAmount = ethers.utils.parseUnits("0.1", 8); // 0.1 WBTC
  });

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy NUSD
    const NUSD = await ethers.getContractFactory("NUSD");
    nusd = await NUSD.deploy();
    await nusd.deployed();

    // Deploy SwapForNUSD
    const SwapForNUSD = await ethers.getContractFactory("SwapForNUSD");
    swapForNUSD = await SwapForNUSD.deploy(nusd.address);
    await swapForNUSD.deployed();

    // Grant minter role to SwapForNUSD
    const MINTER_ROLE = await nusd.MINTER_ROLE();
    await nusd.grantRole(MINTER_ROLE, swapForNUSD.address);

    // Deploy mock tokens
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.deployed();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    const MockWETH = await ethers.getContractFactory("MockWETH");
    mockWETH = await MockWETH.deploy();
    await mockWETH.deployed();

    const MockWBTC = await ethers.getContractFactory("MockWBTC");
    mockWBTC = await MockWBTC.deploy();
    await mockWBTC.deployed();

    // Add collaterals to SwapForNUSD
    // USDC: $1 = 100000000 (8 decimals)
    await swapForNUSD.addCollateral(mockUSDC.address, 100000000, 6);
    // USDT: $1 = 100000000 (8 decimals)
    await swapForNUSD.addCollateral(mockUSDT.address, 100000000, 6);
    // WETH: $3000 = 300000000000 (8 decimals)
    await swapForNUSD.addCollateral(mockWETH.address, 300000000000, 18);
    // WBTC: $60000 = 6000000000000 (8 decimals)
    await swapForNUSD.addCollateral(mockWBTC.address, 6000000000000, 8);

    // Mint tokens to users
    await mockUSDC.mint(user1.address, usdcAmount);
    await mockUSDT.mint(user1.address, usdtAmount);
    await mockWETH.mint(user1.address, wethAmount);
    await mockWBTC.mint(user1.address, wbtcAmount);

    // Approve tokens for SwapForNUSD
    await mockUSDC.connect(user1).approve(swapForNUSD.address, usdcAmount);
    await mockUSDT.connect(user1).approve(swapForNUSD.address, usdtAmount);
    await mockWETH.connect(user1).approve(swapForNUSD.address, wethAmount);
    await mockWBTC.connect(user1).approve(swapForNUSD.address, wbtcAmount);
  });

  it("Should correctly calculate NUSD amount from USDC", async function () {
    const nusdAmount = await swapForNUSD.calculateNUSDAmount(mockUSDC.address, usdcAmount);
    // 1000 USDC (6 decimals) at $1 each should be 1000 NUSD (18 decimals)
    // 1000 * 10^6 * $1 * 10^12 = 1000 * 10^18
    expect(nusdAmount).to.equal(ethers.utils.parseEther("1000"));
  });

  it("Should correctly swap USDC for NUSD", async function () {
    // Swap 1000 USDC for NUSD
    await swapForNUSD.connect(user1).swapToNUSD(mockUSDC.address, usdcAmount);

    // Check user1's NUSD balance
    const nusdBalance = await nusd.balanceOf(user1.address);
    expect(nusdBalance).to.equal(ethers.utils.parseEther("1000"));

    // Check contract's USDC balance
    const contractUsdcBalance = await mockUSDC.balanceOf(swapForNUSD.address);
    expect(contractUsdcBalance).to.equal(usdcAmount);
  });

  it("Should correctly swap WETH for NUSD", async function () {
    // Swap 1 WETH for NUSD
    await swapForNUSD.connect(user1).swapToNUSD(mockWETH.address, wethAmount);

    // Check user1's NUSD balance (1 ETH at $3000 = 3000 NUSD)
    const nusdBalance = await nusd.balanceOf(user1.address);
    expect(nusdBalance).to.equal(ethers.utils.parseEther("3000"));
  });

  it("Should correctly swap WBTC for NUSD", async function () {
    // Swap 0.1 WBTC for NUSD
    await swapForNUSD.connect(user1).swapToNUSD(mockWBTC.address, wbtcAmount);

    // Check user1's NUSD balance (0.1 BTC at $60000 = 6000 NUSD)
    const nusdBalance = await nusd.balanceOf(user1.address);
    expect(nusdBalance).to.equal(ethers.utils.parseEther("6000"));
  });

  it("Should correctly redeem NUSD for USDC", async function () {
    // First swap USDC for NUSD
    await swapForNUSD.connect(user1).swapToNUSD(mockUSDC.address, usdcAmount);
    
    // Get the NUSD balance
    const nusdBalance = await nusd.balanceOf(user1.address);
    
    // Approve NUSD for redeeming
    await nusd.connect(user1).approve(swapForNUSD.address, nusdBalance);
    
    // Initial USDC balance of user1
    const initialUsdcBalance = await mockUSDC.balanceOf(user1.address);
    
    // Redeem NUSD for USDC
    await swapForNUSD.connect(user1).redeemFromNUSD(mockUSDC.address, nusdBalance);
    
    // Check user1's USDC balance has increased
    const finalUsdcBalance = await mockUSDC.balanceOf(user1.address);
    expect(finalUsdcBalance.sub(initialUsdcBalance)).to.equal(usdcAmount);
    
    // Check user1's NUSD balance is now 0
    const finalNusdBalance = await nusd.balanceOf(user1.address);
    expect(finalNusdBalance).to.equal(0);
  });

  it("Should correctly update prices", async function () {
    // Update WETH price to $4000
    await swapForNUSD.updatePrice(mockWETH.address, 400000000000);
    
    // Swap 1 WETH for NUSD
    await swapForNUSD.connect(user1).swapToNUSD(mockWETH.address, wethAmount);
    
    // Check user1's NUSD balance (1 ETH at $4000 = 4000 NUSD)
    const nusdBalance = await nusd.balanceOf(user1.address);
    expect(nusdBalance).to.equal(ethers.utils.parseEther("4000"));
  });
}); 