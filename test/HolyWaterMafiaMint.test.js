// // test/StateTransferrer.test.js
// // Load dependencies
// // Import utilities from Test Helpers
// const {
//   BN,
//   expectEvent,
//   expectRevert,
//   time,
// } = require("@openzeppelin/test-helpers");
// const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");

// const { expect } = require("chai");
// // Load compiled artifacts

// const HolyWaterMafia = artifacts.require("HolyWaterMafia");
// const LinkToken = artifacts.require("LinkToken");
// const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock");
// const TestToken = artifacts.require("TestToken");

// const zero = new BN(0);
// const one = new BN(1);
// const two = new BN(2);
// const three = new BN(3);
// const threeThousand = new BN(3000);
// const sixtySix = new BN(66);
// var hellsShare;
// // Start test block
// contract("HolyWaterMafia", function (accounts) {
//   const [
//     owner,
//     angelMinter,
//     devilMinter,
//     dons,
//     multisig,
//     treasury,
//     newDons,
//     newMultisig,
//     newTreasury,
//     genomeSetter,
//     fakeGenomeSetter,
//   ] = accounts;
//   var angelMintingFee;
//   var devilMintingFee;
//   var breedingFee;
//   var pointMultiplier;
//   var hwm;
//   var testToken;

//   beforeEach(async function () {
//     keyhash =
//       "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
//     fee = "1000000000000000000";
//     linkToken = await LinkToken.new({ from: owner });
//     vrfCoordinatorMock = await VRFCoordinatorMock.new(linkToken.address, {
//       from: owner,
//     });
//     testToken = await TestToken.new(
//       "Test",
//       "TST",
//       new BN(
//         "100000000000000000000000000000000000000000000000000000000000000000"
//       ),
//       { from: owner }
//     );
//     hwm = await HolyWaterMafia.new(linkToken.address, vrfCoordinatorMock.address, dons, multisig, testToken.address, {
//       from: owner,
//     });
//     linkToken.transfer(hwm.address, new BN("10000000000000000000000000"));
//     angelMintingFee = new BN("100000000000000000");
//     devilMintingFee = new BN("50000000000000000");
//     breedingFee = new BN(await hwm.BREEDING_FEE());
//     pointMultiplier = new BN(await hwm.POINT_MULTIPLIER());
//     hellsShare = new BN(await hwm.HELLS_SHARE());
//     await testToken.transfer(devilMinter, breedingFee.mul(three), {
//       from: owner,
//     });
//     await testToken.approve(
//       hwm.address,
//       "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
//       { from: devilMinter }
//     );
//   });

// it("Can mint Gen0 Devil with all checks", async function () {
//     expect((await hwm.payments(dons)).toString().toString()).to.equal("0");
//     var devilMintTx = await hwm.purchaseGen0Devil(1, {
//       from: devilMinter,
//       value: devilMintingFee,
//     });
//     let requestId = devilMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimDevilsTx = await hwm.claimGen0Devil(devilMinter);
//     expect((await hwm.payments(dons)).toString()).to.equal(
//       devilMintingFee.toString()
//     );
//     expectEvent(claimDevilsTx, "TransferSingle", {
//       value: one,
//       to: devilMinter,
//       id: new BN(10000000001),
//     });
//     var devilId = claimDevilsTx.logs[0].args.id;
//     var mintedDevil = await hwm.devils(devilId);
//     expect(mintedDevil.generation.toString().toString()).to.equal("0");
//     expect(mintedDevil.angelParent.toString().toString()).to.equal("0");
//     expect(mintedDevil.devilParent.toString().toString()).to.equal("0");
//     expect(mintedDevil.breedingCooldown.toString().toString()).to.equal("0");
//     expect(mintedDevil.numChildren.toString().toString()).to.equal("0");
//     expect(mintedDevil.shares.toString().toString()).to.equal(
//       "73786976294838206464"
//     );
//     expect(mintedDevil.lastDividendPoints.toString().toString()).to.equal("0");
//   });

//   it("Cannot mint Gen0 Devil if minting price incorrect", async function () {
//     await expectRevert(
//       hwm.purchaseGen0Devil(1, {
//         from: devilMinter,
//         value: devilMintingFee - 5,
//       }),
//       "Minting price is incorrect"
//     );
//   });

//   it("Can mint Gen0 Angel with all checks", async function () {
//     expect((await hwm.payments(dons)).toString().toString()).to.equal("0");
//     var angelMintTx = await hwm.purchaseGen0Angel({
//       from: angelMinter,
//       value: angelMintingFee,
//     });
//     let requestId = angelMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx = await hwm.claimGen0Angel(angelMinter);
//     expect((await hwm.payments(dons)).toString()).to.equal(
//       angelMintingFee.toString()
//     );
//     expectEvent(claimAngelsTx, "TransferSingle", {
//       value: one,
//       to: angelMinter,
//       id: one,
//     });
//     var angelId = claimAngelsTx.logs[0].args.id;
//     var mintedAngel = await hwm.angels(angelId);
//     expect(mintedAngel.generation.toString()).to.equal("0");
//     expect(mintedAngel.angelParent.toString()).to.equal("0");
//     expect(mintedAngel.devilParent.toString()).to.equal("0");
//     expect(mintedAngel.breedingCooldown.toString()).to.equal("0");
//     expect(mintedAngel.numChildren.toString()).to.equal("0");
//     expect(mintedAngel.approvedDevilIdToBreed.toString()).to.equal("0");
//     expect(mintedAngel.setApprovedToBreedCooldown.toString()).to.equal("0");
//   });

//   it("Cannot mint Gen0 Angel if minting price incorrect", async function () {
//     await expectRevert(
//       hwm.purchaseGen0Angel({
//         from: angelMinter,
//         value: angelMintingFee - 10,
//       }),
//       "Minting price is incorrect"
//     );
//   });
// });
