import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Simple", function() {
  async function deploy() {
    const [deployer] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimpleV1");
    const proxyContract = await upgrades.deployProxy(Factory, [], {
      initializer: 'initialize',
      kind: 'uups',
    });

    await proxyContract.waitForDeployment();

    return { proxyContract, deployer }
  }

  it("Initial version should be 1", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const version = await proxyContract.getVersion();
    expect(version).to.eq("V1");
  })
  it("New proxy address should be the same as initial proxy address", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const SimpleV2 = await ethers.getContractFactory("SimpleV2");
    const proxyContractAddress1 = await proxyContract.getAddress()
    const proxyContract2 = await upgrades.upgradeProxy(proxyContractAddress1, SimpleV2);
    const proxyContractAddress2 = await proxyContract2.getAddress()
    expect(proxyContractAddress2).to.eq(proxyContractAddress1);
  })
  it("New version should be 2", async function() {
    const { proxyContract } = await loadFixture(deploy);

    const SimpleV2 = await ethers.getContractFactory("SimpleV2");
    await upgrades.upgradeProxy(await proxyContract.getAddress(), SimpleV2);

    const version = await proxyContract.getVersion();
    expect(version).to.eq("V2");
  })
});