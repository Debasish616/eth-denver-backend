// Basic ABI for NUSD token
const NUSD_ABI = [
  ...ERC20_ABI,
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
]; 

// Basic ABI for SwapForNUSD contract
const SWAP_FOR_NUSD_ABI = [
  "function swapToNUSD(address token, uint256 tokenAmount)",
  "function redeemFromNUSD(address token, uint256 nusdAmount)",
  "function calculateNUSDAmount(address token, uint256 tokenAmount) view returns (uint256)",
  "function calculateTokenAmount(address token, uint256 nusdAmount) view returns (uint256)",
  "function supportedCollaterals(address token) view returns (bool)",
  "function collateralPrices(address token) view returns (uint256)",
  "function collateralDecimals(address token) view returns (uint8)",
  "function deposits(address user, address token) view returns (uint256)",
  "function nusd() view returns (address)"
]; 