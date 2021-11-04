// // test/StateTransferrer.test.js
// // Load dependencies
// // Import utilities from Test Helpers
// const {
//   BN,
//   expectEvent,
//   expectRevert,
//   time,
// } = require("@openzeppelin/test-helpers");
// const { web3 } = require("@openzeppelin/test-helpers/src/setup");
// const brorand = require("brorand");
// const { expect } = require("chai");

// // Load compiled artifact
// const HolyWaterMafia = artifacts.require("HolyWaterMafia");
// const HWMMatingAuction = artifacts.require("HWMMatingAuction");
// const TestToken = artifacts.require("TestToken");
// const LinkToken = artifacts.require("LinkToken");
// const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock");

// const zero = new BN(0);
// const one = new BN(1);
// const two = new BN(2);
// const three = new BN(3);
// const threeThousand = new BN(3000);
// const sixtySix = new BN(66);
// const price = new BN("100000000000000000000000000000000");
// const finalPrice = new BN("10000000000000000000000000000000");
// const duration = new BN("20");

// // Start test block
// contract("HWMMatingAuction", function (accounts) {
//   const [owner, angelMinter, devilMinter, dons, multisig, randomImposter] =
//     accounts;
//   var angelMintingFee;
//   var devilMintingFee;
//   var hwm;
//   var testToken;
//   var breedingFee;
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
//     hwmAuction = await HWMMatingAuction.new(hwm.address, testToken.address, {
//       from: owner,
//     });
//     angelMintingFee = new BN("100000000000000000");
//     devilMintingFee = new BN("50000000000000000");
//     breedingFee = new BN(await hwm.BREEDING_FEE());
//     await testToken.transfer(
//       devilMinter,
//       "1200000000000000000000000000000000",
//       {
//         from: owner,
//       }
//     );
//     // await testToken.transfer(devilMinter, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", {
//     //     from: owner,
//     //   });
//     await testToken.approve(
//       hwm.address,
//       "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
//       { from: devilMinter }
//     );
//     await testToken.approve(
//       hwmAuction.address,
//       "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
//       { from: devilMinter }
//     );
//   });

//   it("Can successfully conduct a fixed price mating", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);
//     var initialDevilOwnerTokenBalance = await testToken.balanceOf(devilMinter);
//     var initialAngelOwnerTokenBalance = await testToken.balanceOf(angelMinter);

//     var mateTx = await hwmAuction.fixedPriceMating(
//       angelId,
//       devilId,
//       price,
//       expiry,
//       nonce,
//       SIGNED_AUCTION,
//       {
//         from: devilMinter,
//       }
//     );
//     expect((await testToken.balanceOf(devilMinter)).toString()).to.equal(
//       initialDevilOwnerTokenBalance.sub(price).sub(breedingFee).toString()
//     );
//     expect((await testToken.balanceOf(angelMinter)).toString()).to.equal(
//       initialAngelOwnerTokenBalance.add(price).toString()
//     );
//     var mints = await hwm.getPastEvents("TransferSingle", {
//       fromBlock: mateTx.receipt.blockNumber,
//     });
//     var mint = mints[0].args;
//     expect(mint.from).to.equal("0x0000000000000000000000000000000000000000");
//     expect(mint.to).to.equal(devilMinter);
//     expect(mint.id.toString()).to.equal(new BN("10000000002").toString());
//     expect(mint.value.toString()).to.equal(new BN("1").toString());
//   });

//   it("Cannot conduct fixed price mating signed by non angel owner", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, randomImposter);
//     if (SIGNED_AUCTION.substring(SIGNED_AUCTION.length - 2) == "01") {
//       SIGNED_AUCTION =
//         SIGNED_AUCTION.substring(0, SIGNED_AUCTION.length - 2) + "1c";
//     } else {
//       SIGNED_AUCTION = SIGNED_AUCTION;
//     }
//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct fixed price mating with insufficient token balance", async function () {
//     await testToken.transfer(
//       "0x0000000000000000000000000000000000000001",
//       (await testToken.balanceOf(devilMinter)).sub(price).add(new BN("1")),
//       {
//         from: devilMinter,
//       }
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "ERC20: transfer amount exceeds balance"
//     );
//   });

//   it("Cannot conduct fixed price mating with different than signed price", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price.sub(new BN("1")),
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct fixed price mating with different than signed nonce", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry,
//         nonce.sub(new BN("1")),
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct fixed price mating with different than signed angelId", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId.sub(new BN("1")),
//         devilId,
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct fixed price mating with different than signed expiry", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry.sub(new BN("1")),
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct fixed price mating with non owned devil", async function () {
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
//     var throwawayDevilMintTx = await hwm.purchaseGen0Devil(1, {
//       from: randomImposter,
//       value: devilMintingFee,
//     });
//     requestId = throwawayDevilMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var throwawayClaimDevilsTx = await hwm.claimGen0Devil(randomImposter);
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId.add(new BN("1")),
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to breed devil"
//     );
//   });

//   it("Cannot reuse same signature twice in a fixed price mating", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     var mateTx = await hwmAuction.fixedPriceMating(
//       angelId,
//       devilId,
//       price,
//       expiry,
//       nonce,
//       SIGNED_AUCTION,
//       {
//         from: devilMinter,
//       }
//     );
//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "Order has already been executed"
//     );
//   });

//   it("Cannot reuse same signature twice in a fixed price mating", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });

//     var expiry = (await time.latest()).add(new BN("100"));
//     var nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256"],
//         [angelId, price, expiry, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);
//     await time.increase(101);
//     await expectRevert(
//       hwmAuction.fixedPriceMating(
//         angelId,
//         devilId,
//         price,
//         expiry,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "Expiry time has passed"
//     );
//   });

//   it("Can successfully conduct a dutch auction mating", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     var initialDevilOwnerTokenBalance = await testToken.balanceOf(devilMinter);
//     var initialAngelOwnerTokenBalance = await testToken.balanceOf(angelMinter);

//     await time.increase(Math.floor(Math.random() * 98));

//     var mateTx = await hwmAuction.dutchAuctionMating(
//       angelId,
//       devilId,
//       startPrice,
//       endPrice,
//       startTime,
//       endTime,
//       nonce,
//       SIGNED_AUCTION,
//       {
//         from: devilMinter,
//       }
//     );
//     var lastBlockTimestamp = await time.latest();
//     // console.log("initial", initialDevilOwnerTokenBalance.toString())
//     // console.log("final", (await testToken.balanceOf(devilMinter)).toString())
//     // console.log("lastBlockTimestamp", lastBlockTimestamp.toString())
//     // console.log("startTime", startTime.toString())
//     // console.log("endTime", endTime.toString())
//     // console.log("startPrice", startPrice.toString())
//     // console.log("endPrice", endPrice.toString())
//     // console.log("breedingFee", breedingFee.toString())
//     var dutchAuctionPrice = startPrice.sub(
//       lastBlockTimestamp
//         .sub(startTime)
//         .mul(startPrice.sub(endPrice))
//         .div(endTime.sub(startTime))
//     );
//     expect((await testToken.balanceOf(devilMinter)).toString()).to.equal(
//       initialDevilOwnerTokenBalance
//         .sub(dutchAuctionPrice)
//         .sub(breedingFee)
//         .toString()
//     );

//     expect((await testToken.balanceOf(angelMinter)).toString()).to.equal(
//       initialAngelOwnerTokenBalance.add(dutchAuctionPrice).toString()
//     );
//     var mints = await hwm.getPastEvents("TransferSingle", {
//       fromBlock: mateTx.receipt.blockNumber,
//     });
//     var mint = mints[0].args;
//     expect(mint.from).to.equal("0x0000000000000000000000000000000000000000");
//     expect(mint.to).to.equal(devilMinter);
//     expect(mint.id.toString()).to.equal(new BN("10000000002").toString());
//     expect(mint.value.toString()).to.equal(new BN("1").toString());
//   });

//   it("Cannot conduct dutch auction mating signed by non angel owner", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, randomImposter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct dutch auction mating with insufficient token balance", async function () {
//     await testToken.transfer(
//       "0x0000000000000000000000000000000000000001",
//       (await testToken.balanceOf(devilMinter)).sub(price).add(new BN("1")),
//       {
//         from: devilMinter,
//       }
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "ERC20: transfer amount exceeds balance"
//     );
//   });

//   it("Cannot conduct dutch auction mating with different than signed price", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice.sub(new BN("1")),
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice.sub(new BN("1")),
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct dutch auction mating with different than signed nonce", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce.sub(new BN("1")),
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct dutch auction mating with different than signed angelId", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId.sub(new BN("1")),
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct dutch auction mating with different than signed times", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime.sub(new BN("1")),
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime.sub(new BN("1")),
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to modify angel"
//     );
//   });

//   it("Cannot conduct dutch auction mating with non owned devil", async function () {
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
//     var throwawayDevilMintTx = await hwm.purchaseGen0Devil(1, {
//       from: randomImposter,
//       value: devilMintingFee,
//     });
//     requestId = throwawayDevilMintTx.logs[0].args.requestId;
//     var fullfillRandomnessTx = await vrfCoordinatorMock.callBackWithRandomness(
//       requestId,
//       "777",
//       hwm.address,
//       { from: owner }
//     );
//     var throwawayClaimDevilsTx = await hwm.claimGen0Devil(randomImposter);

//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId.add(new BN("1")),
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "User is not authorized to breed devil"
//     );
//   });

//   it("Cannot reuse same signature twice in a dutch auction mating", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });
//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     var mateTx = await hwmAuction.dutchAuctionMating(
//       angelId,
//       devilId,
//       startPrice,
//       endPrice,
//       startTime,
//       endTime,
//       nonce,
//       SIGNED_AUCTION,
//       {
//         from: devilMinter,
//       }
//     );
//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "Order has already been executed"
//     );
//   });

//   it("Cannot execute dutch auction mating after endTime", async function () {
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
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: angelMinter,
//     });
//     await hwm.setApprovalForAll(hwmAuction.address, true, {
//       from: devilMinter,
//     });

//     const startTime = await time.latest();
//     const endTime = (await time.latest()).add(new BN("100"));
//     const startPrice = price;
//     const endPrice = price.sub(new BN("1000000"));
//     const nonce = new BN(brorand(32));
//     const AUCTION = web3.utils.sha3(
//       web3.eth.abi.encodeParameters(
//         ["uint256", "uint256", "uint256", "uint256", "uint256", "uint256"],
//         [angelId, startPrice, endPrice, startTime, endTime, nonce]
//       )
//     );
//     var SIGNED_AUCTION = await web3.eth.sign(AUCTION, angelMinter);

//     await time.increase(101);
//     await expectRevert(
//       hwmAuction.dutchAuctionMating(
//         angelId,
//         devilId,
//         startPrice,
//         endPrice,
//         startTime,
//         endTime,
//         nonce,
//         SIGNED_AUCTION,
//         {
//           from: devilMinter,
//         }
//       ),
//       "Not in valid time range"
//     );
//   });
// });
