// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";



async function main() {
  
  const BASE_TOKEN_URI = process.env.BASE_TOKEN_URI || "ipfs://QmPm9uWxk85Ymv9VF5YpYdXUX1tyehXYW7kaZ8ct2u7qVv/";
  // Get contract that we want to deploy
  const contractFactory = await ethers.getContractFactory("NFTCollectible");
  // Deploy contract with the correct constructor arguments
  const contract = await contractFactory.deploy(BASE_TOKEN_URI);

   // Wait for this transaction to be mined
   await contract.deployed();

  console.log("NFTCollectible deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
