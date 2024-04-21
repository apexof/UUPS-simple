import { ethers } from "hardhat";

async function main() {
  const contractFactory = await ethers.getContractFactory("Monekop1155");
  const contract = await contractFactory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress()

  console.log("Contract deployed to:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
