const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("DemoPetStroker", function () {
    it("Should deploy DemoPetStroker", async function () {
      const DemoPetStroker = await ethers.getContractFactory("DemoPetStroker");

      myContract = await DemoPetStroker.deploy();
    });

    describe("strokeThePet()", function () {
      it("Should be able to set a new countPetStrokes", async function () {
        const newPetStrokes = "Test PetStrokes";

        await myContract.strokeThePet(newPetStrokes);
        expect(await myContract.countPetStrokes()).to.equal(newPetStrokes);
      });

      it("Should emit a PetJustStroked event ", async function () {
        const [owner] = await ethers.getSigners();

        const newPetStrokes = "Another Test PetStrokes";

        expect(await myContract.strokeThePet(newPetStrokes))
          .to.emit(myContract, "PetJustStroked")
          .withArgs(owner.address, newPetStrokes);
      });
    });
  });
});
