// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
const util = require("util");

const {
  BN,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");
// Load compiled artifacts

const HWMRedemptionToken = artifacts.require("HWMRedemptionToken");
const TestToken = artifacts.require("TestToken");

const negativeOne = new BN("-1");
const zero = new BN(0);
const one = new BN(1);
const fifteen = new BN(15);
const ten = new BN(10);
const two = new BN(2);
const three = new BN(3);
const four = new BN(4);
const threeThousand = new BN(3000);
const sixtySix = new BN(66);
// Start test block
contract("HolyWaterMafiaRedemptionToken", function (accounts) {
  const [purchaser, repurchaser, otherRepurchaser, dons, owner, team] =
    accounts;
  var redemptionToken;
  var testToken;

  beforeEach(async function () {
    testToken = await TestToken.new(
      "Test",
      "TST",
      new BN(
        "100000000000000000000000000000000000000000000000000000000000000000"
      ),
      { from: owner }
    );
    redemptionToken = await HWMRedemptionToken.new(
      "https://hwm.gg/api/redemption/tokens/metadata/",
      "https://hwm.gg/api/redemption/metadata",
      testToken.address,
      team,
      {
        from: dons,
      }
    );
    await testToken.transfer(
      purchaser,
      "10000000000000000000000000000000000000000",
      {
        from: owner,
      }
    );
    await testToken.transfer(
      repurchaser,
      "10000000000000000000000000000000000000000",
      {
        from: owner,
      }
    );
    await testToken.transfer(
      otherRepurchaser,
      "10000000000000000000000000000000000000000",
      {
        from: owner,
      }
    );
    await testToken.approve(
      redemptionToken.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: purchaser }
    );
    await testToken.approve(
      redemptionToken.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: repurchaser }
    );
    await testToken.approve(
      redemptionToken.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: otherRepurchaser }
    );
  });

  // it("Cannot change don if not don", async function () {
  //   await expectRevert(
  //     redemptionToken.changeDons(owner, {
  //       from: owner,
  //     }),
  //     "Only dons can change dons"
  //   );
  // });

  // it("Can change don", async function () {
  //   await redemptionToken.changeDons(owner, {
  //     from: dons,
  //   });
  //   expect(await redemptionToken.dons()).to.equal(owner);
  //   await redemptionToken.mint(dons, 1, 1, "0x", {
  //     from: owner,
  //   });
  //   await expectRevert(
  //     redemptionToken.mint(dons, 1, 1, "0x", {
  //       from: dons,
  //     }),
  //     "Must have minter role to mint"
  //   );
  // });

  // it("Cannot mint if not don", async function () {
  //   await expectRevert(
  //     redemptionToken.mint(dons, 1, 1, "0x", {
  //       from: owner,
  //     }),
  //     "Must have minter role to mint"
  //   );

  //   await expectRevert(
  //     redemptionToken.mintBatch(
  //       dons,
  //       [1, 123213, 123, 123412, 1234],
  //       [1, 1, 1, 1, 1],
  //       "0x",
  //       {
  //         from: owner,
  //       }
  //     ),
  //     "Must have minter role to mint"
  //   );
  // });

  // it("Cannot mint the same token twice", async function () {
  //   await redemptionToken.mint(dons, 1, 1, "0x", {
  //     from: dons,
  //   });
  //   await expectRevert(
  //     redemptionToken.mint(dons, 1, 1, "0x", {
  //       from: dons,
  //     }),
  //     "Token has already been minted"
  //   );
  //   await redemptionToken.mintBatch(
  //     dons,
  //     [10, 1233, 1230, 1220, 1240],
  //     [1, 1, 1, 1, 1],
  //     "0x",
  //     {
  //       from: dons,
  //     }
  //   ),
  //     await expectRevert(
  //       redemptionToken.mintBatch(
  //         dons,
  //         [1, 1233, 123, 1212, 1234],
  //         [1, 1, 1, 1, 1],
  //         "0x",
  //         {
  //           from: dons,
  //         }
  //       ),
  //       "Token has already been minted"
  //     );
  // });

  // it("Cannot mint more than one token per id", async function () {
  //   await expectRevert(
  //     redemptionToken.mint(dons, 1, 2, "0x", {
  //       from: dons,
  //     }),
  //     "Can only mint one token per id"
  //   );

  //   await expectRevert(
  //     redemptionToken.mintBatch(
  //       dons,
  //       [1, 1233, 123, 1412, 124],
  //       [1, 2, 2, 1, 1],
  //       "0x",
  //       {
  //         from: dons,
  //       }
  //     ),
  //     "Can only mint one token per id"
  //   );
  // });

  // it("Cannot mint token with invalid id", async function () {
  //   await expectRevert(
  //     redemptionToken.mint(dons, 0, 1, "0x", {
  //       from: dons,
  //     }),
  //     "Id must be in valid range"
  //   );

  //   await expectRevert(
  //     redemptionToken.mintBatch(
  //       dons,
  //       [1, 1233, 10000, 1412, 124],
  //       [1, 1, 1, 1, 1],
  //       "0x",
  //       {
  //         from: dons,
  //       }
  //     ),
  //     "Id must be in valid range"
  //   );
  // });

  // it("Cannot bounce non-purely liquid token", async function () {
  //   await redemptionToken.mint(dons, 1, 1, "0x", {
  //     from: dons,
  //   });

  //   await expectRevert(
  //     redemptionToken.bounce(1, { from: purchaser }),
  //     "Token is not gaseuous"
  //   );

  //   await redemptionToken.mint(dons, 1500, 1, "0x", {
  //     from: dons,
  //   });

  //   await expectRevert(
  //     redemptionToken.bounce(1500, { from: purchaser }),
  //     "Token is not gaseuous"
  //   );
  // });

  // it("Cannot bounce non existant token", async function () {
  //   await expectRevert(
  //     redemptionToken.bounce(1501, { from: purchaser }),
  //     "Token has not been minted"
  //   );
  // });

  // it("Can mint token", async function () {
  //   var mintTx = await redemptionToken.mint(team, "1501", 1, "0x", {
  //     from: dons,
  //   });

  //   expect((await redemptionToken.timeOfCreation("1501")).toString()).to.equal(
  //     (await time.latest()).toString()
  //   );
  //   expect((await redemptionToken.ownerOf("1501")).toString()).to.equal(team);
  // });

  // it("Can bounce gaseous token", async function () {
  //   var mintTx = await redemptionToken.mint(team, "1501", 1, "0x", {
  //     from: dons,
  //   });
  //   var initialPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var initialTeamTokenBalance = await testToken.balanceOf(team);
  //   var initialContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );
  //   var initialPrice = await redemptionToken.initialPrice();
  //   await time.increase("1000");
  //   var bounceTx = await redemptionToken.bounce("1501", purchaser, {
  //     from: purchaser,
  //   });
  //   var secondPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var secondTeamTokenBalance = await testToken.balanceOf(team);
  //   var secondContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   expect((await redemptionToken.lastBouncePrice("1501")).toString()).to.equal(
  //     initialPrice.toString()
  //   );
  //   expect(
  //     (await redemptionToken.bouncesAtPrice(initialPrice)).toString()
  //   ).to.equal("1");

  //   expect(secondPurchaserTokenBalance.toString()).to.equal(
  //     initialPurchaserTokenBalance.sub(initialPrice).toString()
  //   );

  //   expect(secondTeamTokenBalance.toString()).to.equal(
  //     initialTeamTokenBalance.add(initialPrice).toString()
  //   );

  //   expect(initialContractTokenBalance.toString()).to.equal(
  //     secondContractTokenBalance.toString()
  //   );
  // });

  // it("Can bounce gaseous token multiple times", async function () {
  //   var mintTx = await redemptionToken.mint(team, "1501", 1, "0x", {
  //     from: dons,
  //   });
  //   var holdTime1 = new BN("1000");
  //   var holdTime2 = new BN("2000");
  //   var holdTime3 = new BN("100");
  //   var initialPrice = await redemptionToken.initialPrice();

  //   var bounceTx = await redemptionToken.bounce("1501", purchaser, {
  //     from: purchaser,
  //   });
  //   var bounce1Time = await time.latest();
  //   var firstRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var firstPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var firstTeamTokenBalance = await testToken.balanceOf(team);
  //   var firstContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   await time.increaseTo((await time.latest()).add(holdTime1));

  //   var bounceTx2 = await redemptionToken.bounce("1501", repurchaser, {
  //     from: repurchaser,
  //   });
  //   var bounce2Time = await time.latest();
  //   var secondOtherRepurchaserTokenBalance = await testToken.balanceOf(
  //     otherRepurchaser
  //   );
  //   var secondRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var secondPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var secondTeamTokenBalance = await testToken.balanceOf(team);
  //   var secondContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   expect((await redemptionToken.numBounces("1501")).toString()).to.equal(
  //     two.toString()
  //   );

  //   var secondBouncePrice = initialPrice.mul(fifteen).div(ten);
  //   expect((await redemptionToken.lastBouncePrice("1501")).toString()).to.equal(
  //     secondBouncePrice.toString()
  //   );

  //   expect(
  //     (await redemptionToken.bouncesAtPrice(secondBouncePrice)).toString()
  //   ).to.equal("1");

  //   expect(secondRepurchaserTokenBalance.toString()).to.equal(
  //     firstRepurchaserTokenBalance.sub(secondBouncePrice).toString()
  //   );

  //   expect(secondTeamTokenBalance.toString()).to.equal(
  //     firstTeamTokenBalance
  //       .add(secondBouncePrice.sub(initialPrice).div(two))
  //       .toString()
  //   );

  //   expect(secondContractTokenBalance.toString()).to.equal(
  //     firstContractTokenBalance
  //       .add(secondBouncePrice.sub(initialPrice).mul(two).div(ten))
  //       .toString()
  //   );

  //   expect(secondPurchaserTokenBalance.toString()).to.equal(
  //     firstPurchaserTokenBalance
  //       .add(
  //         secondBouncePrice
  //           .sub(initialPrice)
  //           .mul(three)
  //           .div(ten)
  //           .add(initialPrice)
  //       )
  //       .toString()
  //   );

  //   expect(secondPurchaserTokenBalance.toString()).to.equal(
  //     firstPurchaserTokenBalance
  //       .add(
  //         secondBouncePrice
  //           .sub(initialPrice)
  //           .mul(three)
  //           .div(ten)
  //           .add(initialPrice)
  //       )
  //       .toString()
  //   );

  //   var secondPurchaserDividendBalance = await redemptionToken.dividends(
  //     purchaser
  //   );
  //   var diffBetweenUnroundedDividendsPurchaser1 =
  //     secondPurchaserDividendBalance.sub(
  //       secondBouncePrice.sub(initialPrice).mul(two).div(ten)
  //     );

  //   expect(
  //     diffBetweenUnroundedDividendsPurchaser1.gte(negativeOne) &&
  //       diffBetweenUnroundedDividendsPurchaser1.lte(zero)
  //   ).to.equal(true);

  //   await time.increaseTo((await time.latest()).add(holdTime2));

  //   var bounceTx3 = await redemptionToken.bounce("1501", otherRepurchaser, {
  //     from: otherRepurchaser,
  //   });
  //   var thirdOtherRepurchaserTokenBalance = await testToken.balanceOf(
  //     otherRepurchaser
  //   );
  //   var thirdRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var thirdPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var thirdTeamTokenBalance = await testToken.balanceOf(team);
  //   var thirdContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   expect((await redemptionToken.numBounces("1501")).toString()).to.equal(
  //     three.toString()
  //   );

  //   var thirdBouncePrice = initialPrice
  //     .mul(fifteen)
  //     .div(ten)
  //     .mul(fifteen)
  //     .div(ten);
  //   expect((await redemptionToken.lastBouncePrice("1501")).toString()).to.equal(
  //     thirdBouncePrice.toString()
  //   );

  //   expect(
  //     (await redemptionToken.bouncesAtPrice(thirdBouncePrice)).toString()
  //   ).to.equal("1");

  //   expect(thirdOtherRepurchaserTokenBalance.toString()).to.equal(
  //     secondOtherRepurchaserTokenBalance.sub(thirdBouncePrice).toString()
  //   );

  //   expect(thirdTeamTokenBalance.toString()).to.equal(
  //     secondTeamTokenBalance
  //       .add(thirdBouncePrice.sub(secondBouncePrice).div(two))
  //       .toString()
  //   );

  //   expect(thirdContractTokenBalance.toString()).to.equal(
  //     secondContractTokenBalance
  //       .add(thirdBouncePrice.sub(secondBouncePrice).mul(two).div(ten))
  //       .toString()
  //   );

  //   expect(thirdRepurchaserTokenBalance.toString()).to.equal(
  //     secondRepurchaserTokenBalance
  //       .add(
  //         thirdBouncePrice
  //           .sub(secondBouncePrice)
  //           .mul(three)
  //           .div(ten)
  //           .add(secondBouncePrice)
  //       )
  //       .toString()
  //   );

  //   var thirdPurchaserDividendBalance = await redemptionToken.dividends(
  //     purchaser
  //   );
  //   var newPurchaserDividends = thirdPurchaserDividendBalance.sub(
  //     secondPurchaserDividendBalance
  //   );
  //   var thirdRepurchaserDividendBalance = await redemptionToken.dividends(
  //     repurchaser
  //   );
  //   var repurchaserDividendMinusDoublenewPurchaserDividends =
  //     thirdRepurchaserDividendBalance.sub(newPurchaserDividends.mul(two)).abs();

  //   expect(
  //     repurchaserDividendMinusDoublenewPurchaserDividends.lte(
  //       newPurchaserDividends.div(new BN("100"))
  //     )
  //   ).to.equal(true);

  //   var differenceBetweenNewDividendsAndNewTokensInContract =
  //     newPurchaserDividends
  //       .add(thirdRepurchaserDividendBalance)
  //       .sub(thirdBouncePrice.sub(secondBouncePrice).mul(two).div(ten));

  //   expect(
  //     differenceBetweenNewDividendsAndNewTokensInContract.gte(negativeOne) &&
  //       differenceBetweenNewDividendsAndNewTokensInContract.lte(zero)
  //   ).to.equal(true);

  //   await time.increaseTo((await time.latest()).add(holdTime3));
  // });

  // it("Can bounce gaseous token if owner held before mechanics", async function () {
  //   const tokenId = new BN("1501");
  //   var mintTx = await redemptionToken.mint(team, tokenId, 1, "0x", {
  //     from: dons,
  //   });
  //   var holdTime1 = new BN("1000");
  //   var holdTime2 = new BN("2000");
  //   var holdTime3 = new BN("100");
  //   var initialPrice = await redemptionToken.initialPrice();

  //   var bounceTx = await redemptionToken.bounce(tokenId, purchaser, {
  //     from: purchaser,
  //   });
  //   var bounce1Time = await time.latest();

  //   await time.increaseTo((await time.latest()).add(holdTime1));

  //   var bounceTx2 = await redemptionToken.bounce(tokenId, repurchaser, {
  //     from: repurchaser,
  //   });
  //   var secondBouncePrice = initialPrice.mul(fifteen).div(ten);

  //   await time.increaseTo((await time.latest()).add(holdTime2));

  //   var bounce2Time = await time.latest();
  //   var secondRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var secondPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var secondTeamTokenBalance = await testToken.balanceOf(team);
  //   var secondContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );
  //   var secondPurchaserDividends = await redemptionToken.dividends(purchaser);

  //   var bounceTx3 = await redemptionToken.bounce(tokenId, purchaser, {
  //     from: purchaser,
  //   });

  //   var thirdPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var thirdRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var thirdTeamTokenBalance = await testToken.balanceOf(team);
  //   var thirdContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   expect((await redemptionToken.numBounces(tokenId)).toString()).to.equal(
  //     three.toString()
  //   );

  //   var thirdBouncePrice = initialPrice
  //     .mul(fifteen)
  //     .div(ten)
  //     .mul(fifteen)
  //     .div(ten);
  //   expect(
  //     (await redemptionToken.lastBouncePrice(tokenId)).toString()
  //   ).to.equal(thirdBouncePrice.toString());

  //   expect(
  //     (await redemptionToken.bouncesAtPrice(thirdBouncePrice)).toString()
  //   ).to.equal("1");

  //   var newPurchaserDividends = (
  //     await redemptionToken.ownerTimeShares(purchaser, tokenId)
  //   )
  //     .mul(thirdBouncePrice.sub(secondBouncePrice).mul(two).div(ten))
  //     .div(
  //       (await time.latest()).sub(
  //         await redemptionToken.timeOfFirstBounce(tokenId)
  //       )
  //     );

  //   expect(
  //     thirdPurchaserTokenBalance
  //       .sub(
  //         secondPurchaserTokenBalance
  //           .sub(thirdBouncePrice)
  //           .add(secondPurchaserDividends)
  //           .add(newPurchaserDividends)
  //       )
  //       .abs()
  //       .lte(one)
  //   ).to.equal(true);

  //   expect(thirdTeamTokenBalance.toString()).to.equal(
  //     secondTeamTokenBalance
  //       .add(thirdBouncePrice.sub(secondBouncePrice).div(two))
  //       .toString()
  //   );

  //   expect(
  //     thirdContractTokenBalance
  //       .sub(
  //         secondContractTokenBalance
  //           .add(thirdBouncePrice.sub(secondBouncePrice).mul(two).div(ten))
  //           .sub(secondPurchaserDividends)
  //           .sub(newPurchaserDividends)
  //       )
  //       .abs()
  //       .lte(one)
  //   ).to.equal(true);

  //   expect(thirdRepurchaserTokenBalance.toString()).to.equal(
  //     secondRepurchaserTokenBalance
  //       .add(
  //         thirdBouncePrice
  //           .sub(secondBouncePrice)
  //           .mul(three)
  //           .div(ten)
  //           .add(secondBouncePrice)
  //       )
  //       .toString()
  //   );

  //   var thirdRepurchaserDividendBalance = await redemptionToken.dividends(
  //     repurchaser
  //   );

  //   expect(
  //     thirdRepurchaserDividendBalance
  //       .sub(
  //         two
  //           .mul(thirdBouncePrice.sub(secondBouncePrice))
  //           .mul(two)
  //           .div(ten)
  //           .div(three)
  //       )
  //       .lte(thirdRepurchaserDividendBalance.div(new BN("100")))
  //   ).to.equal(true);

  //   await time.increaseTo((await time.latest()).add(holdTime3));

  //   var thirdRepurchaserDividends = await redemptionToken.dividends(
  //     repurchaser
  //   );

  //   var bounceTx4 = await redemptionToken.bounce(tokenId, repurchaser, {
  //     from: repurchaser,
  //   });

  //   var fourthPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var fourthRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var fourthTeamTokenBalance = await testToken.balanceOf(team);
  //   var fourthContractTokenBalance = await testToken.balanceOf(
  //     redemptionToken.address
  //   );

  //   expect((await redemptionToken.numBounces(tokenId)).toString()).to.equal(
  //     four.toString()
  //   );

  //   var fourthBouncePrice = initialPrice
  //     .mul(fifteen)
  //     .div(ten)
  //     .mul(fifteen)
  //     .div(ten)
  //     .mul(fifteen)
  //     .div(ten);

  //   expect(
  //     (await redemptionToken.lastBouncePrice(tokenId)).toString()
  //   ).to.equal(fourthBouncePrice.toString());

  //   expect(
  //     (await redemptionToken.bouncesAtPrice(fourthBouncePrice)).toString()
  //   ).to.equal("1");

  //   var newRepurchaserDividends = (
  //     await redemptionToken.ownerTimeShares(repurchaser, tokenId)
  //   )
  //     .mul(fourthBouncePrice.sub(thirdBouncePrice).mul(two).div(ten))
  //     .div(
  //       (await time.latest()).sub(
  //         await redemptionToken.timeOfFirstBounce(tokenId)
  //       )
  //     );

  //   var newSecondPurchaserDividends = (
  //     (await redemptionToken.ownerTimeShares(purchaser, tokenId)).sub(holdTime3)
  //   )
  //     .mul(fourthBouncePrice.sub(thirdBouncePrice).mul(two).div(ten))
  //     .div(
  //       (await time.latest()).sub(
  //         await redemptionToken.timeOfFirstBounce(tokenId)
  //       )
  //     );

  //   expect(
  //     fourthRepurchaserTokenBalance
  //       .sub(
  //         thirdRepurchaserTokenBalance
  //           .sub(fourthBouncePrice)
  //           .add(thirdRepurchaserDividends)
  //           .add(newRepurchaserDividends)
  //       )
  //       .abs()
  //       .lte(one)
  //   ).to.equal(true);

  //   expect(fourthTeamTokenBalance.toString()).to.equal(
  //     thirdTeamTokenBalance
  //       .add(fourthBouncePrice.sub(thirdBouncePrice).div(two))
  //       .toString()
  //   );

  //   console.log(fourthContractTokenBalance.toString());
  //   console.log(thirdContractTokenBalance.toString());
  //   console.log(
  //     fourthBouncePrice.sub(thirdBouncePrice).mul(two).div(ten).toString()
  //   );
  //   console.log(thirdRepurchaserDividends.toString());
  //   console.log(newRepurchaserDividends.toString());
  //   console.log(newSecondPurchaserDividends.toString());
  //   console.log(fourthContractTokenBalance.sub(thirdContractTokenBalance
  //     .add(fourthBouncePrice.sub(thirdBouncePrice).mul(two).div(ten))
  //     .sub(thirdRepurchaserDividends)
  //     .sub(newRepurchaserDividends)
  //     .sub(newSecondPurchaserDividends)).toString())

  //   expect(
  //     fourthContractTokenBalance
  //       .sub(
  //         thirdContractTokenBalance
  //           .add(fourthBouncePrice.sub(thirdBouncePrice).mul(two).div(ten))
  //           .sub(thirdRepurchaserDividends)
  //           .sub(newRepurchaserDividends)
  //           .sub(newSecondPurchaserDividends)
  //       )
  //       .abs()
  //       .lte(one)
  //   ).to.equal(true);

  //   expect(thirdRepurchaserTokenBalance.toString()).to.equal(
  //     secondRepurchaserTokenBalance
  //       .add(
  //         thirdBouncePrice
  //           .sub(secondBouncePrice)
  //           .mul(three)
  //           .div(ten)
  //           .add(secondBouncePrice)
  //       )
  //       .toString()
  //   );

  //   var thirdRepurchaserDividendBalance = await redemptionToken.dividends(
  //     repurchaser
  //   );

  //   expect(
  //     thirdRepurchaserDividendBalance
  //       .sub(
  //         two
  //           .mul(thirdBouncePrice.sub(secondBouncePrice))
  //           .mul(two)
  //           .div(ten)
  //           .div(three)
  //       )
  //       .lte(thirdRepurchaserDividendBalance.div(new BN("100")))
  //   ).to.equal(true);

  //   await time.increaseTo((await time.latest()).add(holdTime3));
  // });

  it("Can bounce gaseous token multiple times", async function () {
    var mintTx = await redemptionToken.mint(team, "1501", 1, "0x", {
      from: dons,
    });
    var holdTime1 = new BN("1000");
    var holdTime2 = new BN("2000");
    var holdTime3 = new BN("100");
    var initialPrice = await redemptionToken.initialPrice();

    var firstRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
    var firstPurchaserTokenBalance = await testToken.balanceOf(purchaser);
    var firstTeamTokenBalance = await testToken.balanceOf(team);
    var firstPurchaserDividendsTokenBalance = await redemptionToken.dividends(
      purchaser
    );
    var firstRepurchaserDividendsTokenBalance = await redemptionToken.dividends(
      repurchaser
    );
    var firstContractTokenBalance = await testToken.balanceOf(
      redemptionToken.address
    );

    var bounceTx = await redemptionToken.bounce("1501", purchaser, {
      from: purchaser,
    });
    var bounce1Time = await time.latest();
    var secondRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
    var secondPurchaserTokenBalance = await testToken.balanceOf(purchaser);
    var secondTeamTokenBalance = await testToken.balanceOf(team);
    var secondPurchaserDividendsTokenBalance = await redemptionToken.dividends(
      purchaser
    );
    var secondRepurchaserDividendsTokenBalance =
      await redemptionToken.dividends(repurchaser);
    var secondContractTokenBalance = await testToken.balanceOf(
      redemptionToken.address
    );

    await time.increaseTo((await time.latest()).add(holdTime1));

    var bounceTx2 = await redemptionToken.bounce("1501", repurchaser, {
      from: repurchaser,
    });
    var bounce2Time = await time.latest();
    var thirdRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
    var thirdPurchaserTokenBalance = await testToken.balanceOf(purchaser);
    var thirdTeamTokenBalance = await testToken.balanceOf(team);
    var thirdPurchaserDividendsTokenBalance = await redemptionToken.dividends(
      purchaser
    );
    var thirdRepurchaserDividendsTokenBalance = await redemptionToken.dividends(
      repurchaser
    );
    var thirdContractTokenBalance = await testToken.balanceOf(
      redemptionToken.address
    );

    await time.increaseTo((await time.latest()).add(holdTime2));

    var bounceTx3 = await redemptionToken.bounce("1501", purchaser, {
      from: purchaser,
    });
    var bounce3Time = await time.latest();
    var fourthRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
    var fourthPurchaserTokenBalance = await testToken.balanceOf(purchaser);
    var fourthTeamTokenBalance = await testToken.balanceOf(team);
    var fourthPurchaserDividendsTokenBalance = await redemptionToken.dividends(
      purchaser
    );
    var fourthRepurchaserDividendsTokenBalance =
      await redemptionToken.dividends(repurchaser);
    var fourthContractTokenBalance = await testToken.balanceOf(
      redemptionToken.address
    );

    await time.increaseTo((await time.latest()).add(holdTime3));

    var bounceTx4 = await redemptionToken.bounce("1501", repurchaser, {
      from: repurchaser,
    });
    var bounce4Time = await time.latest();
    var fifthRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
    var fifthPurchaserTokenBalance = await testToken.balanceOf(purchaser);
    var fifthTeamTokenBalance = await testToken.balanceOf(team);
    var fifthPurchaserDividendsTokenBalance = await redemptionToken.dividends(
      purchaser
    );
    var fifthRepurchaserDividendsTokenBalance = await redemptionToken.dividends(
      repurchaser
    );
    var fifthContractTokenBalance = await testToken.balanceOf(
      redemptionToken.address
    );

    // console.log(
    //   "PURCHASER",
    //   firstPurchaserTokenBalance.sub(firstPurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "PURCHASER DIVIDENDS",
    //   firstPurchaserDividendsTokenBalance
    //     .sub(firstPurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "REPURCHASER",
    //   firstRepurchaserTokenBalance.sub(firstRepurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "REPURCHASER DIVIDENDS",
    //   firstRepurchaserDividendsTokenBalance
    //     .sub(firstRepurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "TEAM",
    //   firstTeamTokenBalance.sub(firstTeamTokenBalance).toString()
    // );
    // console.log(
    //   "CONTRACT",
    //   firstContractTokenBalance.sub(firstContractTokenBalance).toString()
    // );
    // console.log();
    // console.log(
    //   "PURCHASER",
    //   secondPurchaserTokenBalance.sub(firstPurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "PURCHASER DIVIDENDS",
    //   secondPurchaserDividendsTokenBalance
    //     .sub(firstPurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "REPURCHASER",
    //   secondRepurchaserTokenBalance.sub(firstRepurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "REPURCHASER DIVIDENDS",
    //   secondRepurchaserDividendsTokenBalance
    //     .sub(firstRepurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "TEAM",
    //   secondTeamTokenBalance.sub(firstTeamTokenBalance).toString()
    // );
    // console.log(
    //   "CONTRACT",
    //   secondContractTokenBalance.sub(firstContractTokenBalance).toString()
    // );
    // console.log();
    // console.log(
    //   "PURCHASER",
    //   thirdPurchaserTokenBalance.sub(firstPurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "PURCHASER DIVIDENDS",
    //   thirdPurchaserDividendsTokenBalance
    //     .sub(firstPurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "REPURCHASER",
    //   thirdRepurchaserTokenBalance.sub(firstRepurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "REPURCHASER DIVIDENDS",
    //   thirdRepurchaserDividendsTokenBalance
    //     .sub(firstRepurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "TEAM",
    //   thirdTeamTokenBalance.sub(firstTeamTokenBalance).toString()
    // );
    // console.log(
    //   "CONTRACT",
    //   thirdContractTokenBalance.sub(firstContractTokenBalance).toString()
    // );
    // console.log();
    // console.log(
    //   "PURCHASER",
    //   fourthPurchaserTokenBalance.sub(firstPurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "PURCHASER DIVIDENDS",
    //   fourthPurchaserDividendsTokenBalance
    //     .sub(firstPurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "REPURCHASER",
    //   fourthRepurchaserTokenBalance.sub(firstRepurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "REPURCHASER DIVIDENDS",
    //   fourthRepurchaserDividendsTokenBalance
    //     .sub(firstRepurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "TEAM",
    //   fourthTeamTokenBalance.sub(firstTeamTokenBalance).toString()
    // );
    // console.log(
    //   "CONTRACT",
    //   fourthContractTokenBalance.sub(firstContractTokenBalance).toString()
    // );
    // console.log();
    // console.log(
    //   "PURCHASER",
    //   fifthPurchaserTokenBalance.sub(firstPurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "PURCHASER DIVIDENDS",
    //   fifthPurchaserDividendsTokenBalance
    //     .sub(firstPurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "REPURCHASER",
    //   fifthRepurchaserTokenBalance.sub(firstRepurchaserTokenBalance).toString()
    // );
    // console.log(
    //   "REPURCHASER DIVIDENDS",
    //   fifthRepurchaserDividendsTokenBalance
    //     .sub(firstRepurchaserDividendsTokenBalance)
    //     .toString()
    // );
    // console.log(
    //   "TEAM",
    //   fifthTeamTokenBalance.sub(firstTeamTokenBalance).toString()
    // );
    // console.log(
    //   "CONTRACT",
    //   fifthContractTokenBalance.sub(firstContractTokenBalance).toString()
    // );
    // console.log();
    // console.log(
    //   "TOTAL DIVIDENDS",
    //   (await redemptionToken.totalDividends()).toString()
    // );
    // console.log(
    //   "PURCHASER CLAIMED DIVIDENDS",
    //   (await redemptionToken.claimedDividends(purchaser)).toString()
    // );
    // console.log(
    //   "REPURCHASER CLAIMED DIVIDENDS",
    //   (await redemptionToken.claimedDividends(repurchaser)).toString()
    // );

    // bounceTx4.logs.filter(log => log.event == 'Here').forEach(log => {
    //   console.log("a", log.args.a.toString())
    //   console.log("b", log.args.b.toString())
    //   console.log("c", log.args.c.toString())

    // });

    // var thirdBouncePrice = initialPrice.mul(fifteen).div(ten);
    // expect((await redemptionToken.lastBouncePrice("1501")).toString()).to.equal(
    //   thirdBouncePrice.toString()
    // );

    // expect(
    //   (await redemptionToken.bouncesAtPrice(secondBouncePrice)).toString()
    // ).to.equal("1");

    // console.log(await redemptionToken.uri("1501"));
  });

  it("Can bounce purely liquid token", async function () {

    // console.log(await redemptionToken.uri("1501"));
    await redemptionToken.setURI("https://xyz.xyz/urmom/", {from: dons})
    // console.log(await redemptionToken.uri("1501"));

  });

  // it("Can bounce purely liquid token", async function () {
  //   await redemptionToken.mint(dons, "1501", 1, "0x", {
  //     from: dons,
  //   });

  //   var intialPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var intialDonsTokenBalance = await testToken.balanceOf(dons);
  //   var initialPrice = await redemptionToken.initialPrice();

  //   var buyTx = await redemptionToken.bounce("1501", { from: purchaser });
  //   expectEvent(buyTx, "TransferSingle", {
  //     value: one,
  //     to: purchaser,
  //     id: "1501",
  //   });

  //   var finalPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var finalDonsTokenBalance = await testToken.balanceOf(dons);

  //   expect(finalPurchaserTokenBalance.toString()).to.equal(
  //     intialPurchaserTokenBalance.sub(initialPrice).toString()
  //   );
  //   expect(finalDonsTokenBalance.toString()).to.equal(
  //     intialDonsTokenBalance.add(initialPrice).toString()
  //   );
  // });

  // it("Can bounce purely liquid token many times", async function () {
  //   await redemptionToken.mint(dons, "1501", 1, "0x", {
  //     from: dons,
  //   });

  //   var intialPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var intialDonsTokenBalance = await testToken.balanceOf(dons);
  //   var initialPrice = await redemptionToken.initialPrice();

  //   var buyTx = await redemptionToken.bounce("1501", { from: purchaser });
  //   expectEvent(buyTx, "TransferSingle", {
  //     value: one,
  //     to: purchaser,
  //     id: "1501",
  //   });

  //   var secondRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var secondPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var secondDonsTokenBalance = await testToken.balanceOf(dons);

  //   expect(secondPurchaserTokenBalance.toString()).to.equal(
  //     intialPurchaserTokenBalance.sub(initialPrice).toString()
  //   );
  //   expect(secondDonsTokenBalance.toString()).to.equal(
  //     intialDonsTokenBalance.add(initialPrice).toString()
  //   );

  //   var buyTx2 = await redemptionToken.bounce("1501", { from: repurchaser });
  //   expectEvent(buyTx2, "TransferSingle", {
  //     value: one,
  //     to: repurchaser,
  //     id: "1501",
  //   });

  //   var thirdRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var thirdPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var thirdDonsTokenBalance = await testToken.balanceOf(dons);

  //   expect(thirdRepurchaserTokenBalance.toString()).to.equal(
  //     secondRepurchaserTokenBalance
  //       .sub(initialPrice.mul(fifteen).div(ten))
  //       .toString()
  //   );

  //   expect(thirdDonsTokenBalance.toString()).to.equal(
  //     secondDonsTokenBalance.add(initialPrice.div(new BN(4))).toString()
  //   );

  //   expect(thirdPurchaserTokenBalance.toString()).to.equal(
  //     secondPurchaserTokenBalance
  //       .add(initialPrice.mul(new BN(5)).div(new BN(4)))
  //       .toString()
  //   );

  //   var buyTx3 = await redemptionToken.bounce("1501", { from: purchaser });
  //   expectEvent(buyTx3, "TransferSingle", {
  //     value: one,
  //     to: purchaser,
  //     id: "1501",
  //   });

  //   var fourthRepurchaserTokenBalance = await testToken.balanceOf(repurchaser);
  //   var fourthPurchaserTokenBalance = await testToken.balanceOf(purchaser);
  //   var fourthDonsTokenBalance = await testToken.balanceOf(dons);

  //   expect(fourthPurchaserTokenBalance.toString()).to.equal(
  //     thirdPurchaserTokenBalance
  //       .sub(initialPrice.mul(fifteen).div(ten).mul(fifteen).div(ten))
  //       .toString()
  //   );

  //   expect(fourthDonsTokenBalance.toString()).to.equal(
  //     thirdDonsTokenBalance
  //       .add(
  //         initialPrice
  //           .mul(fifteen)
  //           .div(ten)
  //           .mul(fifteen)
  //           .div(ten)
  //           .sub(initialPrice.mul(fifteen).div(ten))
  //           .div(two)
  //       )
  //       .toString()
  //   );

  //   expect(fourthRepurchaserTokenBalance.toString()).to.equal(
  //     thirdRepurchaserTokenBalance
  //       .add(
  //         initialPrice
  //           .mul(fifteen)
  //           .div(ten)
  //           .mul(fifteen)
  //           .div(ten)
  //           .sub(initialPrice.mul(fifteen).div(ten))
  //           .div(two).add(initialPrice.mul(fifteen).div(ten))
  //       )
  //       .toString()
  //   );
  // });
});
