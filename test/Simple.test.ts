import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Simple", function() {
  async function deploy() {
    const [deployer, user2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimpleV1");
    const proxyContract = await upgrades.deployProxy(Factory, [], {
      initializer: 'initialize',
      kind: 'uups',
    });

    await proxyContract.waitForDeployment();

    return { proxyContract, deployer, user2 }
  }

  it("Initial version should be 1", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const version = await proxyContract.getVersion();
    expect(version).to.eq("V1");
  })
  it("New proxy address should be the same as initial proxy address", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const SimpleV2 = await ethers.getContractFactory("SimpleV2");
    const proxyContract2 = await upgrades.upgradeProxy(proxyContract.target, SimpleV2);
    expect(proxyContract2.target).to.eq(proxyContract.target);
  })
  it("New version should be 2", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const SimpleV2 = await ethers.getContractFactory("SimpleV2");
    await upgrades.upgradeProxy(proxyContract.target, SimpleV2);

    const version = await proxyContract.getVersion();
    expect(version).to.eq("V2");
  })
  it("Only the owner can update the contract", async function() {
    const { proxyContract, user2 } = await loadFixture(deploy);

    const SimpleV2 = await ethers.getContractFactory("SimpleV2");
    const tx = upgrades.upgradeProxy(proxyContract.target, SimpleV2.connect(user2));

    await expect(tx).to.be.revertedWithCustomError(proxyContract, 'OwnableUnauthorizedAccount')
  })
});