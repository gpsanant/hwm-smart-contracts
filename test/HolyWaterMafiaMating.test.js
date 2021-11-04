// // test/StateTransferrer.test.js
// // Load dependencies
// // Import utilities from Test Helpers
// const {
//   BN,
//   expectEvent,
//   expectRevert,
//   time,
// } = require("@openzeppelin/test-helpers");

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
//     hwm = await HolyWaterMafia.new(
//       linkToken.address,
//       vrfCoordinatorMock.address,
//       dons,
//       multisig,
//       testToken.address,
//       {
//         from: owner,
//       }
//     );
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

//   it("Can mate and angel with a devil", async function () {
//     var angelMintTx = await hwm.purchaseGen0Angel({
//       from: angelMinter,
//       value: angelMintingFee,
//     });
//     let requestId = angelMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "787",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx = await hwm.claimGen0Angel(angelMinter);
//     var angelId = claimAngelsTx.logs[0].args.id;
//     var devilMintTx = await hwm.purchaseGen0Devil(1, {
//       from: devilMinter,
//       value: devilMintingFee,
//     });
//     requestId = devilMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimDevilsTx = await hwm.claimGen0Devil(devilMinter);
//     var devilId = claimDevilsTx.logs[0].args.id;
//     var approveToBreedTx = await hwm.setApprovedToBreed(
//       angelMinter,
//       devilId,
//       angelId,
//       { from: angelMinter }
//     );
//     var breedTx = await hwm.breed(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//     requestId = breedTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );

//     await time.increase(
//       new BN((await hwm.getDevil(devilId)).breedingCooldown).sub(
//         await time.latest()
//       )
//     );
//     var giveBirthTx = await hwm.giveBirth(devilMinter, devilId);
//   });

//   it("Can breed devil with angel with all checks", async function () {
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
//     var angelId = claimAngelsTx.logs[0].args.id;

//     var devilMintTx = await hwm.purchaseGen0Devil(1, {
//       from: devilMinter,
//       value: devilMintingFee,
//     });
//     requestId = devilMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimDevilsTx = await hwm.claimGen0Devil(devilMinter);
//     var devilId = claimDevilsTx.logs[0].args.id;

//     var initialDonsBalance = new BN(await hwm.payments(dons));
//     var preBreedDevilDividends = new BN(await hwm.dividendBalance(devilId));
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     var breedingTx = await hwm.breed(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//     requestId = breedingTx.logs[0].args.requestId;
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());
//     var postBreedDevilDividends = new BN(await hwm.dividendBalance(devilId));
//     var angelParent = await hwm.angels(angelId);
//     var devilParent = await hwm.devils(devilId);

//     expect((await testToken.balanceOf(dons)).toString()).to.equal(
//       breedingFee.div(three).toString()
//     );
//     var devilDividentDifference = postBreedDevilDividends
//       .sub(preBreedDevilDividends)
//       .sub(
//         breedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(devilParent.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );

//     expect(
//       devilDividentDifference.lte(one) && devilDividentDifference.gte(zero)
//     ).to.equal(true);

//     await time.increase(
//       new BN((await hwm.getDevil(devilId)).breedingCooldown).sub(
//         await time.latest()
//       )
//     );
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//         requestId,
//         "777",
//         hwm.address,
//         { from: owner }
//       );
//     var giveBirthTx = await hwm.giveBirth(devilMinter, devilId);
//     expectEvent(giveBirthTx, "TransferSingle", {
//       value: one,
//       to: devilMinter,
//       id: new BN(10000000002),
//     });

//     var birthedDevil = await hwm.devils(giveBirthTx.logs[0].args.id);

//     expectDevil(
//       postBreedTotalShares,
//       preBreedTotalShares,
//       postBreedTotalDividendPoints,
//       preBreedTotalDividendPoints,
//       breedingFee,
//       pointMultiplier,
//       angelId,
//       angelParent,
//       devilId,
//       devilParent,
//       birthedDevil
//     );
//   });
// });

// function expectDevil(
//   postBreedTotalShares,
//   preBreedTotalShares,
//   postBreedTotalDividendPoints,
//   preBreedTotalDividendPoints,
//   breedingFee,
//   pointMultiplier,
//   angelId,
//   angelParent,
//   devilId,
//   devilParent,
//   birthedDevil
// ) {
//   console.log(birthedDevil.shares)
//   expect(postBreedTotalShares.toString()).to.equal(
//     preBreedTotalShares.add(new BN(birthedDevil.shares)).toString()
//   );
//   // // POINT_MULTIPLIER * BREEDING_FEE * 2 * HELLS_SHARE / 3000 / totalShares
//   expect(postBreedTotalDividendPoints.toString()).to.equal(
//     preBreedTotalDividendPoints
//       .add(
//         pointMultiplier
//           .mul(two)
//           .mul(hellsShare)
//           .mul(breedingFee)
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       )
//       .toString()
//   );
//   var angelParentGeneration = new BN(angelParent.generation);
//   var devilParentGeneration = new BN(devilParent.generation);
//   expect(birthedDevil.generation.toString()).to.equal(
//     angelParentGeneration.lt(devilParentGeneration)
//       ? devilParentGeneration.add(one).toString()
//       : angelParentGeneration.add(one).toString()
//   );
//   expect(birthedDevil.angelParent.toString()).to.equal(angelId.toString());
//   expect(birthedDevil.devilParent.toString()).to.equal(devilId.toString());
//   expect(birthedDevil.breedingCooldown.toString()).to.equal("0");
//   expect(birthedDevil.numChildren.toString()).to.equal("0");
//   expect(birthedDevil.shares.toString()).to.equal(
//     two.pow(sixtySix.sub(new BN(birthedDevil.generation))).toString()
//   );
//   expect(birthedDevil.lastDividendPoints.toString()).to.equal(
//     postBreedTotalDividendPoints.toString()
//   );
// }
