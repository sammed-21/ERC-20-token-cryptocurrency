const { expect } = require("chai");
// const { expect } = require("hardhat");
const hre = require("hardhat");

describe("OceanToken contract", function () {
  let Token;
  let OceanToken;
  let owner;
  let address1;
  let address2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async () => {
    Token = await ethers.getContractFactory("OceanToken");
    [owner, address1, address2] = await hre.ethers.getSigners();

    OceanToken = await Token.deploy(tokenCap, tokenBlockReward);
  });
  describe("deployment", async () => {
    it("should set the right owner ", async () => {
      expect(await OceanToken.owner()).to.equal(owner.address);
    });
    it("should be assign totalsupply of the token to the owner", async () => {
      const ownerBalance = await OceanToken.balanceOf(owner.address);

      expect(await OceanToken.totalSupply()).to.equal(ownerBalance);
    });
    it("should set the max capped supply to the argument provided during deployment", async () => {
      const Cap = await OceanToken.cap();
      expect(Number(hre.ethers.utils.formatEther(Cap))).to.equal(tokenCap);
    });
    it("should set the blockreward the number assinged during the deployment", async () => {
      const blockreward = await OceanToken.blockReward();
      expect(Number(hre.ethers.utils.formatEther(blockreward))).to.equal(
        tokenBlockReward
      );
    });
    describe("transaction ", async () => {
      it("should update the balance after the transfer", async () => {
        const initialOwnerBalance = await OceanToken.balanceOf(owner.address);

        // send 100 token to owner to address1
        await OceanToken.transfer(address1.address, 100);

        //send 50 tokens to owner to address2
        await OceanToken.transfer(address2.address, 50);

        const finalOwnerBalance = await OceanToken.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
        const address1Balance = await OceanToken.balanceOf(address1.address);
        expect(address1Balance).to.equal(100);
        const address2Balance = await OceanToken.balanceOf(address2.address);
        expect(address2Balance).to.equal(50);
      });

      //i need to test the transfer the token to address 1 and address2
      // token are transfered correctly
      it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await OceanToken.balanceOf(owner.address);
        // Try to send 1 token from address1 (0 tokens) to owner (1000000 tokens).
        // `require` will evaluate false and revert the transaction.
        await expect(
          OceanToken.connect(address1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

        // Owner balance shouldn't have changed.
        expect(await OceanToken.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });
      it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await OceanToken.balanceOf(owner.address);

        // Transfer 100 tokens from owner to address1.
        await OceanToken.transfer(address1.address, 100);

        // Transfer another 50 tokens from owner to address2.
        await OceanToken.transfer(address2.address, 50);

        // Check balances.
        const finalOwnerBalance = await OceanToken.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

        const address1Balance = await OceanToken.balanceOf(address1.address);
        expect(address1Balance).to.equal(100);

        const address2Balance = await OceanToken.balanceOf(address2.address);
        expect(address2Balance).to.equal(50);
      });
    });
  });
});
