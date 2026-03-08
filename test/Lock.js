import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import chai from "chai";

const { expect } = chai;

describe("FileRegistry", function () {
  async function deployFileRegistryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const FileRegistry = await ethers.getContractFactory("FileRegistry");
    const fileRegistry = await FileRegistry.deploy();

    return { fileRegistry, owner, otherAccount };
  }

  it("stores and returns files for the caller", async function () {
    const { fileRegistry, owner } = await loadFixture(deployFileRegistryFixture);

    await fileRegistry.storeFile("cid-1");
    await fileRegistry.storeFile("cid-2");

    const files = await fileRegistry.getUserFiles(owner.address);
    expect(files).to.deep.equal(["cid-1", "cid-2"]);
  });

  it("keeps files isolated by wallet address", async function () {
    const { fileRegistry, owner, otherAccount } = await loadFixture(
      deployFileRegistryFixture
    );

    await fileRegistry.storeFile("owner-cid");
    await fileRegistry.connect(otherAccount).storeFile("other-cid");

    const ownerFiles = await fileRegistry.getUserFiles(owner.address);
    const otherFiles = await fileRegistry.getUserFiles(otherAccount.address);

    expect(ownerFiles).to.deep.equal(["owner-cid"]);
    expect(otherFiles).to.deep.equal(["other-cid"]);
  });

  it("returns an empty array for users with no files", async function () {
    const { fileRegistry, otherAccount } = await loadFixture(deployFileRegistryFixture);

    const files = await fileRegistry.getUserFiles(otherAccount.address);
    expect(files).to.deep.equal([]);
  });
});
