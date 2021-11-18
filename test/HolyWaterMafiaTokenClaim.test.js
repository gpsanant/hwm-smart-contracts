// test/StateTransferrer.test.js
// Load dependencies
// Import utilities from Test Helpers
const {
  BN,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");

const { expect } = require("chai");
const { artifacts } = require("hardhat");
const { sha256 } = require("js-sha256");
// Load compiled artifacts

const HolyWaterMafia = artifacts.require("HolyWaterMafia");
const HWMRedemptionToken = artifacts.require("HWMRedemptionToken");
const HWMBreedingFeeSplitter = artifacts.require("HWMBreedingFeeSplitter");
const HWMBreedingRights = artifacts.require("HWMBreedingRights");
const HWMAssigner = artifacts.require("HWMAssigner");
const HWMGeneticsOnlyAngels = artifacts.require("HWMGeneticsOnlyAngels");
const HWMGeneticsZeroGenome = artifacts.require("HWMGeneticsZeroGenome");
const TestToken = artifacts.require("TestToken");
const LinkToken = artifacts.require("LinkToken");
const VRFCoordinatorMock = artifacts.require("VRFCoordinatorMock");

const zero = new BN(0);
const one = new BN(1);
const two = new BN(2);
const three = new BN(3);
const threeThousand = new BN(3000);
const sixtySix = new BN(66);
var hellsShare;
// Start test block
contract("HolyWaterMafia", function (accounts) {
  const [
    owner,
    minter2,
    minter22,
    minter23,
    minter24,
    otherminter2,
    minter1,
    minter12,
    minter13,
    minter14,
    otherminter1,
    dons,
    multisig,
    treasury,
    newDons,
    newMultisig,
    newTreasury,
    genomeSetter,
    fakeGenomeSetter,
    team,
  ] = accounts;
  var angelMintingFee;
  var devilMintingFee;
  var breedingFee;
  var pointMultiplier;
  var hwm;
  var redemptionToken;
  var assigner;
  var testToken;
  var bfs;
  var brt;

  beforeEach(async function () {
    keyhash =
      "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
    fee = "1000000000000000000";
    linkToken = await LinkToken.new({ from: owner });
    vrfCoordinatorMock = await VRFCoordinatorMock.new(linkToken.address, {
      from: owner,
    });
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

    assigner = await HWMAssigner.new(
      linkToken.address,
      vrfCoordinatorMock.address,
      "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
      (0.0001 * 10) ^ 18,
      redemptionToken.address,
      {
        from: dons,
      }
    );
    hwm = await HolyWaterMafia.new(
      linkToken.address,
      vrfCoordinatorMock.address,
      dons,
      testToken.address,
      redemptionToken.address,
      assigner.address,
      {
        from: owner,
      }
    );
    linkToken.transfer(hwm.address, new BN("10000000000000000000000000"));
    linkToken.transfer(assigner.address, new BN("10000000000000000000000000"));
    angelMintingFee = new BN("100000000000000000");
    devilMintingFee = new BN("50000000000000000");
    await testToken.transfer(minter1, "10000000000000000000000000000000000", {
      from: owner,
    });
    await testToken.approve(
      hwm.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: minter1 }
    );
    await testToken.approve(
      redemptionToken.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: minter1 }
    );
    await testToken.transfer(minter2, "10000000000000000000000000000000000", {
      from: owner,
    });
    await testToken.approve(
      hwm.address,
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      { from: minter2 }
    );

    bfs = await HWMBreedingFeeSplitter.new(hwm.address, {
      from: owner,
    });

    brt = await HWMBreedingRights.new(
      "https://hwm.gg/api/breeding/tokens/metadata/",
      "https://hwm.gg/api/breeding/contract/metadata/",
      hwm.address,
      bfs.address,
      {
        from: owner,
      }
    );

    await hwm.setBreedingRightsToken(brt.address, { from: owner });
    await hwm.setBreedingFeeSplitter(bfs.address, { from: owner });

    await redemptionToken.mint(minter1, "1869", 1, "0x", { from: dons });
    await redemptionToken.mint(minter1, "435", 1, "0x", { from: dons });
    await redemptionToken.mint(minter1, "334", 1, "0x", { from: dons });
    await redemptionToken.bounce("1869", minter1, { from: minter1 });

    await redemptionToken.mint(minter2, "434", 1, "0x", { from: dons });
    await redemptionToken.mint(minter2, "336", 1, "0x", { from: dons });
    await redemptionToken.mint(minter2, "6969", 1, "0x", { from: dons });
    await redemptionToken.bounce("6969", minter2, { from: minter1 });
    await redemptionToken.bounce("6969", minter2, { from: minter1 });
    await redemptionToken.bounce("6969", minter2, { from: minter1 });

    var assignTx = await assigner.assign([
      "1869",
      "434",
      "435",
      "6969",
      "334",
      "336",
    ]);
    for (var i = 0; i < assignTx.logs.length; i++) {
      await vrfCoordinatorMock.callBackWithRandomness(
        assignTx.logs[i].args.requestId.toString(),
        i % 2 ? 1 : 2,
        assigner.address,
        { from: owner }
      );
    }

    await redemptionToken.setApprovalForAll(hwm.address, true, {
      from: minter1,
    });
    await redemptionToken.setApprovalForAll(hwm.address, true, {
      from: minter2,
    });
  });

  it("Can claim angels and devils successfully", async function () {
    var firstMinter1TokenBalance = await testToken.balanceOf(minter1);
    var minter1MintTx = await hwm.mintTokens(minter1, ["1869", "334", "435"], {
      from: minter1,
    });
    var secondMinter1TokenBalance = await testToken.balanceOf(minter1);
    expect(secondMinter1TokenBalance.toString()).to.equal(
      firstMinter1TokenBalance
        .sub(
          await redemptionToken.bouncePricePercentile(
            await hwm.angelRedemptionTokenPricePercentile()
          )
        )
        .toString()
    );
    var requestIds = [];
    requestIds.push(await hwm.devilMintRequestIds(minter1, "0"));
    requestIds.push(await hwm.angelMintRequestIds(minter1, "0"));
    requestIds.push(await hwm.angelMintRequestIds(minter1, "1"));
    await expectRevert.unspecified(hwm.devilMintRequestIds(minter1, "1"));
    await expectRevert.unspecified(hwm.angelMintRequestIds(minter1, "2"));

    var minter2MintTx = await hwm.mintTokens(minter2, ["6969", "434", "336"], {
      from: minter2,
    });
    var secondMinter1TokenBalance = await testToken.balanceOf(minter1);
    expect(secondMinter1TokenBalance.toString()).to.equal(
      firstMinter1TokenBalance
        .sub(
          await redemptionToken.bouncePricePercentile(
            await hwm.angelRedemptionTokenPricePercentile()
          )
        )
        .toString()
    );

    requestIds.push(await hwm.devilMintRequestIds(minter2, "0"));
    requestIds.push(await hwm.devilMintRequestIds(minter2, "1"));
    requestIds.push(await hwm.angelMintRequestIds(minter2, "0"));
    await expectRevert.unspecified(hwm.devilMintRequestIds(minter2, "2"));
    await expectRevert.unspecified(hwm.angelMintRequestIds(minter2, "1"));

    for (let index = 0; index < requestIds.length; index++) {
      const requestId = requestIds[index];
      await vrfCoordinatorMock.callBackWithRandomness(
        requestId,
        new BN(sha256(index.toString())),
        hwm.address,
        { from: owner }
      );
    }

    var minter1ClaimTx = await hwm.claimTokens(minter1, { from: minter1 });
    var minter2ClaimTx = await hwm.claimTokens(minter2, { from: minter2 });

    console.log(minter1ClaimTx);
    expectEvent(minter1ClaimTx, "DevilBirth", {
      owner: minter1,
      id: 1,
      generation: 0,
      angelParent: 0,
      devilParent: 0,
    });
    console.log(minter2ClaimTx);
    expectEvent(minter2ClaimTx, "AngelBirth", {});
  });

  // it("Can set up", async function () {
  //   console.log("happened")
  // })
});
