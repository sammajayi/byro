const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Platform = await hre.ethers.getContractFactory("ResearchFundingPlatform");

  // Deploy the contract
  const platform = await Platform.deploy();

  // Wait for the contract to be deployed
  await platform.waitForDeployment();

  // Get the contract address
  const contractAddress = await platform.getAddress();

  console.log("ResearchFundingPlatform deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });