// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HolyWaterMafia.sol";

contract HWMBreedingFeeSplitter {
    HolyWaterMafia public hwm;
    uint256 public A_BIG_NUMBER = 10e40;
    uint256 public hellsShare = 5000;
    uint256 public owedDividends = 0;
    uint256 public totalDividendPoints = 0;
    uint256 public treasuryDividends;
    mapping(uint256 => uint256) public lastDividendPoints;

    modifier onlyTreasury() {
        require(
            msg.sender == hwm.TREASURY(),
            "This function is restricted to HWM's tresury"
        );
        _;
    }

    constructor(HolyWaterMafia _hwm) {
        hwm = _hwm;
    }

    function setHellsShare(uint256 _hellsShare) external onlyTreasury {
        require(
            _hellsShare <= 10000 && _hellsShare >= 0,
            "Hells share has to be a valid number of basis points"
        );
        hellsShare = _hellsShare;
    }

    function splitBreedingFee(
        uint256 fee,
        uint256 devilId,
        uint256 angelId
    ) external onlyTreasury {
        require(msg.sender == address(hwm), "Only HWM can send fees");
        IERC20 breedingToken = hwm.BREEDING_TOKEN();
        address treasury = hwm.TREASURY();
        uint256 hellsShareOfFee = (fee * hellsShare) / 10000;
        if (treasury != address(0)) {
            breedingToken.transferFrom(
                address(this),
                treasury,
                fee - hellsShareOfFee
            );
        } else {
            treasuryDividends += fee - hellsShareOfFee;
        }
        totalDividendPoints +=
            (A_BIG_NUMBER * fee * hellsShare) /
            10000 /
            hwm.totalShares();
    }

    function dividends(uint256[] memory ids) external returns(uint256) {
        uint256 dividendsOwed;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            dividendsOwed += hwm.getShares(id) * (totalDividendPoints - lastDividendPoints[id]) / A_BIG_NUMBER;
            lastDividendPoints[id] = totalDividendPoints;
        }
        return dividendsOwed;
    }

    function withdrawDividends(address owner, uint256[] memory ids) external returns(uint256) {
        uint256 dividendsOwed;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(
                balanceOf(owner, devilId) == 1 &&
                    (msg.sender == owner ||
                        isApprovedForAll(owner, msg.sender)),
                "Not authorizeds to withdraw dividends"
            );
            dividendsOwed += hwm.getShares(id) * (totalDividendPoints - lastDividendPoints[id]) / A_BIG_NUMBER;
            lastDividendPoints[id] = totalDividendPoints;
        }
        hwm.BREEDING_TOKEN().transfer(owner, dividendsOwed);
        return dividendsOwed;
    }
}
