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
// const HWMGeneticsOnlyAngels = artifacts.require("HWMGeneticsOnlyAngels");
// const HWMGeneticsZeroGenome = artifacts.require("HWMGeneticsZeroGenome");
// const TestToken = artifacts.require("TestToken");
// const LinkToken = artifacts.require("LinkToken");
// const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock");

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
//     angelMinter2,
//     angelMinter3,
//     angelMinter4,
//     otherAngelMinter,
//     devilMinter,
//     devilMinter2,
//     devilMinter3,
//     devilMinter4,
//     otherDevilMinter,
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

//   it("Can change multisig address from multisig", async function () {
//     await hwm.setMultisig(newMultisig, { from: multisig });
//     expect(await hwm.MULTISIG()).to.equal(newMultisig);
//   });

//   it("Cannot change multisig address with non multisig", async function () {
//     await expectRevert(
//       hwm.setMultisig(newMultisig, { from: treasury }),
//       "Only the multisig can change the multisig"
//     );
//   });

//   it("Can change treasury address", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     expect(await hwm.TREASURY()).to.equal(treasury);
//   });

//   it("Cannot change treasury address from multisig with non multisig", async function () {
//     await expectRevert(
//       hwm.setTreasuryFromMultisig(treasury, { from: newMultisig }),
//       "Only the multisig can change the treasury"
//     );
//   });

//   it("Can change treasury address", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await hwm.setTreasury(newTreasury, { from: treasury });
//     expect(await hwm.TREASURY()).to.equal(newTreasury);
//   });

//   it("Cannot change treasury address from treasury without treasury", async function () {
//     await expectRevert(
//       hwm.setTreasury(treasury, { from: newMultisig }),
//       "This function is restricted to the contract's tresury"
//     );
//   });

//   it("Cannot change treasury address from multisig with non multisig", async function () {
//     await expectRevert(
//       hwm.setTreasuryFromMultisig(treasury, { from: newMultisig }),
//       "Only the multisig can change the treasury"
//     );
//   });

//   it("Can change dons address", async function () {
//     await hwm.setDons(newDons, { from: dons });
//     expect(await hwm.DONS()).to.equal(newDons);
//   });

//   it("Cannot change dons address with non don", async function () {
//     await expectRevert(
//       hwm.setDons(dons, { from: newDons }),
//       "Only the dons can change the dons"
//     );
//   });

//   it("Can set genome setter capability and genome setter can set genomes", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await hwm.setGenomeSetterCapability(genomeSetter, true, { from: treasury });
//     var devilIds = [];
//     var devilGenomes = [
//       "0x1234123412341234123412341234123412341234123412341234123412341234",
//       "0x43214321231234123412341324132453232adeb3583247985783453234bbe3e5",
//       "0x123412341234123412341234123b41234123412a3412341234123412abce8943",
//       "0x432143212312aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa34123412341",
//       "0x432143212312aaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbaaaaa34123412341",
//     ];
//     for (var i = 0; i < 5; i++) {
//       var devilMintTx = await hwm.purchaseGen0Devil(1, {
//         from: accounts[6 + i],
//         value: devilMintingFee,
//       });
//       let requestId = devilMintTx.logs[0].args.requestId;
//       var fullfillRandomnessTx =
//         await vrfCoordinatorMock.callBackWithRandomness(
//           requestId,
//           "777",
//           hwm.address,
//           { from: owner }
//         );
//       var claimDevilsTx = await hwm.claimGen0Devil(accounts[6 + i]);
//       devilIds.push(claimDevilsTx.logs[0].args.id);
//     }

//     var angelIds = [];
//     var angelGenomes = [
//       "0x123412341234123412341234123415324fc23513e123432f89898c48734abccc",
//       "0x4321432123aaaaaffffb341324132453232adeb3583247985783453234bbe3e5",
//       "0x123412341234123412341bbbabfebcabffbbf12a3412341234123412abce8943",
//       "0x432143212312aaaaaaaaaaaaaaaabbbbbbccceeebbbcbeaaaaaaa34123412341",
//       "0x432143212312aaaabbbbbbbeeeeeeeeeeeeeebbbbbbbbbbbaaaaa34123412341",
//     ];
//     for (var i = 0; i < 5; i++) {
//       var angelMintTx = await hwm.purchaseGen0Angel({
//         from: accounts[1 + i],
//         value: angelMintingFee,
//       });
//       let requestId = angelMintTx.logs[0].args.requestId;
//       var fullfillRandomnessTx =
//         await vrfCoordinatorMock.callBackWithRandomness(
//           requestId,
//           "777",
//           hwm.address,
//           { from: owner }
//         );
//       var claimAngelsTx = await hwm.claimGen0Angel(accounts[1 + i]);
//       angelIds.push(claimAngelsTx.logs[0].args.id);
//     }

//     await hwm.setGenomes(devilIds, devilGenomes, angelIds, angelGenomes, {
//       from: genomeSetter,
//     });
//     for (var i = 0; i < devilIds.length; i++) {
//       expect((await hwm.devils(devilIds[i])).genome).to.equal(devilGenomes[i]);
//     }

//     for (var i = 0; i < angelIds.length; i++) {
//       expect((await hwm.angels(angelIds[i])).genome).to.equal(angelGenomes[i]);
//     }
//   });

//   it("Cannot change genome setter capability without treasury", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await expectRevert(
//       hwm.setGenomeSetterCapability(genomeSetter, true, { from: newTreasury }),
//       "This function is restricted to the contract's tresury"
//     );
//   });

//   it("Can change genome setter capability mutilple times", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await hwm.setGenomeSetterCapability(genomeSetter, true, { from: treasury });
//     var devilIds = [];
//     var devilGenomes = [
//       "0x1234123412341234123412341234123412341234123412341234123412341234",
//     ];
//     for (var i = 0; i < 1; i++) {
//       var devilMintTx = await hwm.purchaseGen0Devil(1, {
//         from: devilMinter,
//         value: devilMintingFee,
//       });
//       let requestId = devilMintTx.logs[0].args.requestId;
//       var fullfillRandomnessTx =
//         await vrfCoordinatorMock.callBackWithRandomness(
//           requestId,
//           "777",
//           hwm.address,
//           { from: owner }
//         );
//       var claimDevilsTx = await hwm.claimGen0Devil(devilMinter);
//       devilIds.push(claimDevilsTx.logs[0].args.id);
//     }

//     var angelIds = [];
//     var angelGenomes = [
//       "0x123412341234123412341234123415324fc23513e123432f89898c48734abccc",
//     ];
//     for (var i = 0; i < 1; i++) {
//       var angelMintTx = await hwm.purchaseGen0Angel({
//         from: angelMinter,
//         value: angelMintingFee,
//       });
//       let requestId = angelMintTx.logs[0].args.requestId;
//       var fullfillRandomnessTx =
//         await vrfCoordinatorMock.callBackWithRandomness(
//           requestId,
//           "777",
//           hwm.address,
//           { from: owner }
//         );
//       var claimAngelsTx = await hwm.claimGen0Angel(angelMinter);
//       angelIds.push(claimAngelsTx.logs[0].args.id);
//     }
//     var newDevilGenomes = [
//       "0x0000000000000000000000000000000000000000000000000000000000000000",
//     ];
//     var newAngelGenomes = [
//       "0x0000000000000000000000000000000000000000000000000000000000000000",
//     ];

//     await hwm.setGenomes(devilIds, devilGenomes, angelIds, angelGenomes, {
//       from: genomeSetter,
//     });
//     await hwm.setGenomeSetterCapability(genomeSetter, false, {
//       from: treasury,
//     });
//     await expectRevert(
//       hwm.setGenomes(devilIds, newDevilGenomes, angelIds, newAngelGenomes, {
//         from: genomeSetter,
//       }),
//       "Must be a genome setter to set genomes"
//     );
//   });

//   it("Cannot breeding fee without treasury", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await expectRevert(
//       hwm.setBreedingFee(new BN("10000000000000000"), { from: newTreasury }),
//       "This function is restricted to the contract's tresury"
//     );
//   });

//   it("Cannot change hells share without treasury", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await expectRevert(
//       hwm.setHellsShare(new BN("10"), { from: newTreasury }),
//       "This function is restricted to the contract's tresury"
//     );
//   });

//   it("Can mint Gen0 Devil with all checks", async function () {
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

//   it("Can set devil to breed with with fresh angel", async function () {
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
//     var devilId = "10000000001";
//     var breedingApprovalTx = await hwm.setApprovedToBreed(
//       angelMinter,
//       devilId,
//       angelId,
//       { from: angelMinter }
//     );
//     expectEvent(breedingApprovalTx, "BreedingApproval", {
//       angelId,
//       devilId: new BN(devilId),
//     });
//     var mintedAngel = await hwm.angels(angelId);
//     expect(mintedAngel.setApprovedToBreedCooldown.toString()).to.equal(
//       (
//         (await web3.eth.getBlock(breedingApprovalTx.receipt.blockNumber))
//           .timestamp + 86400000
//       ).toString()
//     );
//     expect(mintedAngel.approvedDevilIdToBreed.toString()).to.equal(devilId);
//     await time.increase(86400001);
//     breedingApprovalTx = await hwm.setApprovedToBreed(
//       angelMinter,
//       devilId - 1,
//       angelId,
//       { from: angelMinter }
//     );
//     expectEvent(breedingApprovalTx, "BreedingApproval", {
//       angelId,
//       devilId: new BN(devilId - 1),
//     });
//     mintedAngel = await hwm.angels(angelId);
//     expect(mintedAngel.setApprovedToBreedCooldown.toString()).to.equal(
//       (
//         (await web3.eth.getBlock(breedingApprovalTx.receipt.blockNumber))
//           .timestamp + 86400000
//       ).toString()
//     );
//     expect(mintedAngel.approvedDevilIdToBreed.toString()).to.equal(
//       (devilId - 1).toString()
//     );
//   });

//   it("Cannot set devil to breed if unauthorized", async function () {
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
//     var devilId = 10000000001;
//     await expectRevert(
//       hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//         from: devilMinter,
//       }),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot set devil to breed before deadline", async function () {
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
//     var devilId = 10000000001;
//     var breedingApprovalTx = await hwm.setApprovedToBreed(
//       angelMinter,
//       devilId,
//       angelId,
//       { from: angelMinter }
//     );
//     time.increase(86400000 - 10);
//     await expectRevert(
//       hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//         from: angelMinter,
//       }),
//       "Devil must be given ample time to breed"
//     );
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       devilId,
//       angelId,
//       { from: devilMinter }
//     );
//     expectEvent(breedingTx, "TransferSingle", {
//       value: one,
//       to: devilMinter,
//       id: new BN(10000000002),
//     });
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());
//     var postBreedDevilDividends = new BN(await hwm.dividendBalance(devilId));
//     var angelParent = await hwm.angels(angelId);
//     var devilParent = await hwm.devils(devilId);
//     var birthedDevil = await hwm.devils(breedingTx.logs[0].args.id);
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
//   });

//   it("Can breed devil with angel for multiple generations with all checks", async function () {
//     await testToken.transfer(devilMinter, breedingFee.mul(two), {
//       from: owner,
//     });
//     await testToken.approve(
//       hwm.address,
//       "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
//       { from: devilMinter }
//     );

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

//     var angelMintTx2 = await hwm.purchaseGen0Angel({
//       from: otherAngelMinter,
//       value: angelMintingFee,
//     });
//     requestId = angelMintTx2.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx2 = await hwm.claimGen0Angel(otherAngelMinter);
//     var angel2Id = claimAngelsTx2.logs[0].args.id;
//     await hwm.safeTransferFrom(otherAngelMinter, angelMinter, angel2Id, 1, "0x", { from: otherAngelMinter })

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
//     var gen0DevilId = claimDevilsTx.logs[0].args.id;

//     var initialDonsBalance = new BN(await hwm.payments(dons));
//     await hwm.setApprovedToBreed(angelMinter, gen0DevilId, angelId, {
//       from: angelMinter,
//     });
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen0DevilId,
//       angelId,
//       { from: devilMinter }
//     );
//     var gen1DevilId = breedingTx.logs[0].args.id;
//     var preBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var preBreedGen1DevilIdDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());

//     await hwm.setApprovedToBreed(angelMinter, gen1DevilId, angel2Id, {
//       from: angelMinter,
//     });
//     breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen1DevilId,
//       angel2Id,
//       { from: devilMinter }
//     );

//     var postBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var postBreedGen1DevilDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());

//     var angel2 = await hwm.angels(angel2Id);
//     var gen0Devil = await hwm.devils(gen0DevilId);
//     var gen1Devil = await hwm.devils(gen1DevilId);
//     var gen2Devil = await hwm.devils(breedingTx.logs[0].args.id);

//     expectDevil(
//       postBreedTotalShares,
//       preBreedTotalShares,
//       postBreedTotalDividendPoints,
//       preBreedTotalDividendPoints,
//       breedingFee,
//       pointMultiplier,
//       angel2Id,
//       angel2,
//       gen1DevilId,
//       gen1Devil,
//       gen2Devil
//     );

//     expect((await testToken.balanceOf(dons)).toString()).to.equal(
//       breedingFee.div(three).mul(two).toString()
//     );
//     var gen0DevilDividendDifference = postBreedGen0DevilDividends
//       .sub(preBreedGen0DevilDividends)
//       .sub(
//         breedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen0Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );
//     var gen1DevilDividendDifference = postBreedGen1DevilDividends
//       .sub(preBreedGen1DevilIdDividends)
//       .sub(
//         breedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen1Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );

//     expect(
//       gen0DevilDividendDifference.lte(one) &&
//         gen0DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//     expect(
//       gen1DevilDividendDifference.lte(one) &&
//         gen1DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//   });

//   it("Cannot breed devil with angel if unauthorized", async function () {
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//         from: angelMinter,
//       }),
//       "User is not authorized to breed devil"
//     );
//   });

//   it("Cannot breed devil with angel if not approved for breeding", async function () {
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
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//         from: devilMinter,
//       }),
//       "Devil is not approved to breed with angel"
//     );
//   });

//   it("Cannot breed devil with angel if angel is parent", async function () {
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       devilId,
//       angelId,
//       { from: devilMinter }
//     );
//     var gen1DevilId = breedingTx.logs[0].args.id;
//     await hwm.setApprovedToBreed(angelMinter, gen1DevilId, angelId, {
//       from: angelMinter,
//     });
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, gen1DevilId, angelId, {
//         from: devilMinter,
//       }),
//       "Devil cannot mate with their angel parent"
//     );
//   });

//   it("Cannot breed the same devil with the same angel twice", async function () {
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//         from: devilMinter,
//       }),
//       "This pair has already mated"
//     );
//   });

//   it("Cannot breed devil with angel if devil breeding cooldown has not passed", async function () {
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

//     var angelMintTx2 = await hwm.purchaseGen0Angel({
//       from: otherAngelMinter,
//       value: angelMintingFee,
//     });
//     requestId = angelMintTx2.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx2 = await hwm.claimGen0Angel(otherAngelMinter);
//     var angel2Id = claimAngelsTx2.logs[0].args.id;
//     await hwm.safeTransferFrom(otherAngelMinter, angelMinter, angel2Id, 1, "0x", { from: otherAngelMinter })

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
    
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//     await hwm.setApprovedToBreed(angelMinter, devilId, angel2Id, {
//       from: angelMinter,
//     });
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, devilId, angel2Id, {
//         from: devilMinter,
//       }),
//       "You must wait until the cooldown time is reached to breed the devil"
//     );
//   });

//   it("Cannot breed devil with angel if angel breeding cooldown has not passed", async function () {
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

//     var devilMintTx2 = await hwm.purchaseGen0Devil(1, {
//       from: otherDevilMinter,
//       value: devilMintingFee,
//     });
//     requestId = devilMintTx2.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimDevilsTx2 = await hwm.claimGen0Devil(otherDevilMinter);
//     var devil2Id = claimDevilsTx2.logs[0].args.id;
//     await hwm.safeTransferFrom(otherDevilMinter, devilMinter, devil2Id, 1, "0x", { from: otherDevilMinter })

//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//     await hwm.setApprovedToBreed(angelMinter, devil2Id, angelId, {
//       from: angelMinter,
//     });
//     await expectRevert(
//       hwm.breedDevilWithAngel(devilMinter, devil2Id, angelId, {
//         from: devilMinter,
//       }),
//       "You must wait until the cooldown time is reached to breed the angel"
//     );
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     await hwm.breedDevilWithAngel(devilMinter, devilId, angelId, {
//       from: devilMinter,
//     });
//   });

//   it("Can change and charge breeding fee with all checks", async function () {
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
    
//     var angelMintTx2 = await hwm.purchaseGen0Angel({
//       from: otherAngelMinter,
//       value: angelMintingFee,
//     });
//     requestId = angelMintTx2.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx2 = await hwm.claimGen0Angel(otherAngelMinter);
//     var angel2Id = claimAngelsTx2.logs[0].args.id;
//     await hwm.safeTransferFrom(otherAngelMinter, angelMinter, angel2Id, 1, "0x", { from: otherAngelMinter })

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
//     var gen0DevilId = claimDevilsTx.logs[0].args.id;
//     var initialDonsBalance = new BN(await hwm.payments(dons));
//     await hwm.setApprovedToBreed(angelMinter, gen0DevilId, angelId, {
//       from: angelMinter,
//     });
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen0DevilId,
//       angelId,
//       { from: devilMinter }
//     );
//     var gen1DevilId = breedingTx.logs[0].args.id;
//     var preBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var preBreedGen1DevilIdDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());

//     await hwm.setApprovedToBreed(angelMinter, gen1DevilId, angel2Id, {
//       from: angelMinter,
//     });
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await hwm.setBreedingFee("10000000000000000", { from: treasury });
//     var newBreedingFee = await hwm.BREEDING_FEE();
//     breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen1DevilId,
//       angel2Id,
//       { from: devilMinter }
//     );

//     var postBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var postBreedGen1DevilIdDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());

//     var angel2 = await hwm.angels(angel2Id);
//     var gen0Devil = await hwm.devils(gen0DevilId);
//     var gen1Devil = await hwm.devils(gen1DevilId);
//     var gen2Devil = await hwm.devils(breedingTx.logs[0].args.id);

//     expectDevil(
//       postBreedTotalShares,
//       preBreedTotalShares,
//       postBreedTotalDividendPoints,
//       preBreedTotalDividendPoints,
//       newBreedingFee,
//       pointMultiplier,
//       angel2Id,
//       angel2,
//       gen1DevilId,
//       gen1Devil,
//       gen2Devil
//     );

//     expect((await testToken.balanceOf(dons)).toString()).to.equal(
//       breedingFee.div(three).add(newBreedingFee.div(three)).toString()
//     );
//     var gen0DevilDividendDifference = postBreedGen0DevilDividends
//       .sub(preBreedGen0DevilDividends)
//       .sub(
//         newBreedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen0Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );
//     var gen1DevilDividendDifference = postBreedGen1DevilIdDividends
//       .sub(preBreedGen1DevilIdDividends)
//       .sub(
//         newBreedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen1Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );
//     expect(
//       gen0DevilDividendDifference.lte(one) &&
//         gen0DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//     expect(
//       gen1DevilDividendDifference.lte(one) &&
//         gen1DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//   });

//   it("Can change and split hells share with all checks", async function () {
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

//     var angelMintTx2 = await hwm.purchaseGen0Angel({
//       from: otherAngelMinter,
//       value: angelMintingFee,
//     });
//     requestId = angelMintTx2.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var claimAngelsTx2 = await hwm.claimGen0Angel(otherAngelMinter);
//     var angel2Id = claimAngelsTx2.logs[0].args.id;
//     await hwm.safeTransferFrom(otherAngelMinter, angelMinter, angel2Id, 1, "0x", { from: otherAngelMinter })

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
//     var gen0DevilId = claimDevilsTx.logs[0].args.id;
//     var initialDonsBalance = new BN(await hwm.payments(dons));
//     await hwm.setApprovedToBreed(angelMinter, gen0DevilId, angelId, {
//       from: angelMinter,
//     });
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen0DevilId,
//       angelId,
//       { from: devilMinter }
//     );
//     var gen1DevilId = breedingTx.logs[0].args.id;
//     var preBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var preBreedGen1DevilIdDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());

//     await hwm.setApprovedToBreed(angelMinter, gen1DevilId, angel2Id, {
//       from: angelMinter,
//     });
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     await hwm.setHellsShare("100", { from: treasury });
//     hellsShare = await hwm.HELLS_SHARE();
//     breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       gen1DevilId,
//       angel2Id,
//       { from: devilMinter }
//     );

//     var postBreedGen0DevilDividends = new BN(
//       await hwm.dividendBalance(gen0DevilId)
//     );
//     var postBreedGen1DevilIdDividends = new BN(
//       await hwm.dividendBalance(gen1DevilId)
//     );
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());

//     var angel2 = await hwm.angels(angel2Id);
//     var gen0Devil = await hwm.devils(gen0DevilId);
//     var gen1Devil = await hwm.devils(gen1DevilId);
//     var gen2Devil = await hwm.devils(breedingTx.logs[0].args.id);

//     expectDevil(
//       postBreedTotalShares,
//       preBreedTotalShares,
//       postBreedTotalDividendPoints,
//       preBreedTotalDividendPoints,
//       breedingFee,
//       pointMultiplier,
//       angel2Id,
//       angel2,
//       gen1DevilId,
//       gen1Devil,
//       gen2Devil
//     );

//     expect((await testToken.balanceOf(dons)).toString()).to.equal(
//       breedingFee.div(three).add(breedingFee.div(three)).toString()
//     );
//     var gen0DevilDividendDifference = postBreedGen0DevilDividends
//       .sub(preBreedGen0DevilDividends)
//       .sub(
//         breedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen0Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );
//     var gen1DevilDividendDifference = postBreedGen1DevilIdDividends
//       .sub(preBreedGen1DevilIdDividends)
//       .sub(
//         breedingFee
//           .mul(hellsShare)
//           .mul(two)
//           .mul(new BN(gen1Devil.shares))
//           .div(preBreedTotalShares)
//           .div(threeThousand)
//       );
//     expect(
//       gen0DevilDividendDifference.lte(one) &&
//         gen0DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//     expect(
//       gen1DevilDividendDifference.lte(one) &&
//         gen1DevilDividendDifference.gte(zero)
//     ).to.equal(true);
//   });

//   it("Can change genomics with treasury to only angel", async function () {
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     const hwmGeneticsOnlyAngels = await HWMGeneticsOnlyAngels.new({
//       from: owner,
//     });
//     await hwm.setGenomics(hwmGeneticsOnlyAngels.address, { from: treasury });
//     expect(await hwm.GENOMICS()).to.equal(hwmGeneticsOnlyAngels.address);
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       devilId,
//       angelId,
//       { from: devilMinter }
//     );
//     expectEvent(breedingTx, "TransferSingle", {
//       value: one,
//       to: devilMinter,
//       id: two,
//     });
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());
//     var postBreedDevilDividends = new BN(await hwm.dividendBalance(devilId));
//     var angelParent = await hwm.angels(angelId);
//     var devilParent = await hwm.devils(devilId);
//     var birthedAngel = await hwm.angels(breedingTx.logs[0].args.id);
//     expectAngel(
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
//       birthedAngel
//     );
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
//   });

//   it("Can change genomics with treasury to zero genome", async function () {
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
//     await hwm.setApprovedToBreed(angelMinter, devilId, angelId, {
//       from: angelMinter,
//     });
//     var preBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var preBreedTotalShares = new BN(await hwm.totalShares());
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     const hwmGeneticsZeroGenome = await HWMGeneticsZeroGenome.new({
//       from: owner,
//     });
//     await hwm.setGenomics(hwmGeneticsZeroGenome.address, { from: treasury });
//     expect(await hwm.GENOMICS()).to.equal(hwmGeneticsZeroGenome.address);
//     var breedingTx = await hwm.breedDevilWithAngel(
//       devilMinter,
//       devilId,
//       angelId,
//       { from: devilMinter }
//     );
//     expectEvent(breedingTx, "TransferSingle", {
//       value: one,
//       to: devilMinter,
//       id: new BN(10000000002),
//     });
//     var postBreedTotalDividendPoints = new BN(await hwm.totalDividendPoints());
//     var postBreedTotalShares = new BN(await hwm.totalShares());
//     var postBreedDevilDividends = new BN(await hwm.dividendBalance(devilId));
//     var angelParent = await hwm.angels(angelId);
//     var devilParent = await hwm.devils(devilId);
//     var birthedDevil = await hwm.devils(breedingTx.logs[0].args.id);
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

//     expect(birthedDevil.genome.toString()).to.equal(
//       "0x0000000000000000000000000000000000000000000000000000000000000000"
//     );
//     expect(devilParent.breedingCooldown.toString()).to.equal("0");
//     expect(angelParent.breedingCooldown.toString()).to.equal("0");
//   });

//   it("Can change genomics with treasury to zero genome", async function () {
//     await hwm.setTreasuryFromMultisig(treasury, { from: multisig });
//     const hwmGeneticsZeroGenome = await HWMGeneticsZeroGenome.new({
//       from: owner,
//     });
//     await expectRevert(
//       hwm.setGenomics(hwmGeneticsZeroGenome.address, { from: newTreasury }),
//       "This function is restricted to the contract's tresury"
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

// function expectAngel(
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
//   birthedAngel
// ) {
//   expect(postBreedTotalShares.toString()).to.equal(
//     preBreedTotalShares.toString()
//   );
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
//   expect(birthedAngel.generation.toString()).to.equal(
//     angelParentGeneration.lt(devilParentGeneration)
//       ? devilParentGeneration.add(one).toString()
//       : angelParentGeneration.add(one).toString()
//   );
//   expect(birthedAngel.angelParent.toString()).to.equal(angelId.toString());
//   expect(birthedAngel.devilParent.toString()).to.equal(devilId.toString());
//   expect(birthedAngel.breedingCooldown.toString()).to.equal("0");
//   expect(birthedAngel.numChildren.toString()).to.equal("0");
//   expect(birthedAngel.setApprovedToBreedCooldown.toString()).to.equal("0");
//   expect(birthedAngel.approvedDevilIdToBreed.toString()).to.equal("0");
// }
