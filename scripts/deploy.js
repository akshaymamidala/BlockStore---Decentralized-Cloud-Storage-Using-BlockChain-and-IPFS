async function main() {
  const FileRegistry = await ethers.getContractFactory("FileRegistry");
  const contract = await FileRegistry.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed to:", await contract.getAddress());
}
main().catch((error) => { console.error(error); process.exitCode = 1; });