import { expect } from "chai";
import { ethers } from "hardhat";

describe("SwapPool", () => {
  const feeBps = 50n; // 0.5%
  const rate = ethers.parseUnits("1", 18);

  let owner: any;
  let manager: any;
  let investor: any;
  let eutToken: any;
  let spvToken: any;
  let pool: any;

  const deployFixture = async () => {
    [owner, manager, investor] = await ethers.getSigners();

    const erc20Factory = await ethers.getContractFactory("ERC20PresetMinterPauser");
    eutToken = await erc20Factory.deploy("EUT Token", "EUT");
    spvToken = await erc20Factory.deploy("Green Fund Token", "GFT");

    await eutToken.mint(owner.address, ethers.parseEther("1000"));
    await spvToken.mint(owner.address, ethers.parseEther("1000"));

    const poolFactory = await ethers.getContractFactory("SwapPool");
    pool = await poolFactory.deploy(await eutToken.getAddress(), Number(feeBps));

    await pool.setPool(await spvToken.getAddress(), rate);

    await eutToken.connect(owner).approve(await pool.getAddress(), ethers.parseEther("500"));
    await pool.deposit(await eutToken.getAddress(), ethers.parseEther("500"));
    await spvToken.connect(owner).approve(await pool.getAddress(), ethers.parseEther("500"));
    await pool.deposit(await spvToken.getAddress(), ethers.parseEther("500"));

    await pool.setAllowlist(await spvToken.getAddress(), manager.address, true);

    await eutToken.connect(owner).transfer(manager.address, ethers.parseEther("100"));
    await spvToken.connect(owner).transfer(manager.address, ethers.parseEther("50"));
    await eutToken.connect(owner).transfer(investor.address, ethers.parseEther("25"));
  };

  beforeEach(async () => {
    await deployFixture();
  });

  it("swaps utility tokens to security tokens with fee deduction", async () => {
    const amountIn = ethers.parseEther("10");
    const expectedFee = (amountIn * feeBps) / 10_000n;
    const expectedOut = amountIn - expectedFee;

    await eutToken.connect(manager).approve(await pool.getAddress(), amountIn);
    await expect(pool.connect(manager).swapEutForSpv(await spvToken.getAddress(), amountIn, manager.address))
      .to.emit(pool, "SwapExecuted")
      .withArgs(manager.address, await eutToken.getAddress(), await spvToken.getAddress(), amountIn, expectedOut, expectedFee);

    const balance = await spvToken.balanceOf(manager.address);
    expect(balance).to.equal(ethers.parseEther("50") + expectedOut);
  });

  it("swaps security tokens back to EUT applying the configured fee", async () => {
    const amountIn = ethers.parseEther("5");
    await spvToken.connect(manager).approve(await pool.getAddress(), amountIn);

    const grossEut = (amountIn * ethers.parseUnits("1", 18)) / rate;
    const expectedFee = (grossEut * feeBps) / 10_000n;
    const expectedNet = grossEut - expectedFee;

    await expect(pool.connect(manager).swapSpvForEut(await spvToken.getAddress(), amountIn, manager.address))
      .to.emit(pool, "SwapExecuted")
      .withArgs(manager.address, await spvToken.getAddress(), await eutToken.getAddress(), amountIn, expectedNet, expectedFee);

    const balance = await eutToken.balanceOf(manager.address);
    expect(balance).to.equal(ethers.parseEther("100") + expectedNet);
  });

  it("blocks swaps for recipients that are not allowlisted", async () => {
    const amountIn = ethers.parseEther("1");
    await eutToken.connect(investor).approve(await pool.getAddress(), amountIn);
    await expect(
      pool.connect(investor).swapEutForSpv(await spvToken.getAddress(), amountIn, investor.address),
    ).to.be.revertedWith("SwapPool: recipient not allowed");
  });

  it("allows swaps once the allowlist is cleared", async () => {
    await pool.setAllowlist(await spvToken.getAddress(), manager.address, false);
    await eutToken.connect(investor).approve(await pool.getAddress(), ethers.parseEther("2"));
    await expect(pool.connect(investor).swapEutForSpv(await spvToken.getAddress(), ethers.parseEther("2"), investor.address))
      .to.emit(pool, "SwapExecuted");
  });
});
