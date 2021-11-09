// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./HolyWaterMafia.sol";

contract HWMBreedingFeeSplitter {
    HolyWaterMafia public hwm;
    uint256 public A_BIG_NUMBER = 10e40;
    // basis points that all devils are entitled to
    uint256 public hellsShare = 2500;
    // basis points that devils in the ancestors are entitled to
    uint256 public ancestorsShare = 2500;
    // total dividends per share * a big number. used for calculation of hells share
    uint256 public totalDividendPoints = 0;
    // total dividends per share * a big number. used for calculation of hells share
    mapping(uint256 => uint256) public lastDividendPoints;
    uint256 public treasuryDividends;
    // address that treasury share should go to
    address public treasury;
    // how many dividends to be paid to the ancestors of given devil
    mapping(uint256 => uint256) public totalAncestorDividends;
    // Child token id => ancestor token id => whether they have claimed or not
    mapping(uint256 => mapping(uint256 => bool))
        public ancestorClaimedDividends;

    // limit modularity to be changed by hwm owner
    modifier onlyHWMOwner() {
        require(
            msg.sender == hwm.owner(),
            "This function is restricted to HWM's tresury"
        );
        _;
    }

    constructor(HolyWaterMafia _hwm) {
        hwm = _hwm;
    }

    function setHellsShare(uint256 _hellsShare) external onlyHWMOwner {
        require(
            _hellsShare <= 10000 && _hellsShare >= 0,
            "Hell's share has to be a valid number of basis points"
        );
        hellsShare = _hellsShare;
    }

    function setAncestorsShare(uint256 _ancestorsShare) external onlyHWMOwner {
        require(
            _ancestorsShare <= 10000 && _ancestorsShare >= 0,
            "Ancestor's share has to be a valid number of basis points"
        );
        ancestorsShare = _ancestorsShare;
    }

    function setTreasury(address _treasury) external onlyHWMOwner {
        treasury = _treasury;
    }

    // ancestor dividend must be set at birth because breeding fee and ancestor share
    // may change so ancestor dividend may be different for different offspring
    function setTotalAncestorDividends(uint256 id, uint256 ancestorDividends) external {
        require(msg.sender == address(hwm), "Only HWM can send fees");
        totalAncestorDividends[id] = ancestorDividends;
        // set lat claimed dividend to current dividends
        lastDividendPoints[id] = totalDividendPoints;
    }

    function splitBreedingFee(
        uint256 fee,
        uint256 devilId,
        uint256 angelId
    ) external returns (uint256) {
        require(msg.sender == address(hwm), "Only HWM can send fees");
        IERC20 breedingToken = hwm.BREEDING_TOKEN();
        // calculate how much of fee goes to hell (all devils) and the new being's ancestors
        uint256 hellsShareOfFee = (fee * hellsShare) / 10000;
        uint256 ancestorsShareOfFee = (fee * ancestorsShare) / 10000;
        // transfer rest of fee to treasury if they have been set
        if (treasury != address(0)) {
            breedingToken.transferFrom(
                address(this),
                treasury,
                fee - hellsShareOfFee - ancestorsShareOfFee
            );
        } else {
            // otherwise increase their share to be withdrawn later on
            treasuryDividends += fee - hellsShareOfFee - ancestorsShareOfFee;
        }
        // update total dividends
        totalDividendPoints +=
            (A_BIG_NUMBER * fee * hellsShare) /
            10000 /
            hwm.totalShares();
        return ancestorsShareOfFee;
    }

    function dividends(uint256[] memory ids) external view returns (uint256) {
        uint256 dividendsOwed;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            // calculate share of fee
            dividendsOwed +=
                (hwm.getShares(id) *
                    (totalDividendPoints - lastDividendPoints[id])) /
                A_BIG_NUMBER;
        }
        return dividendsOwed;
    }

    // withdraw dividends that were refelected to entire devil population
    function withdrawHellsDividends(address owner, uint256[] memory ids)
        external
        returns (uint256)
    {
        uint256 dividendsOwed;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(
                hwm.balanceOf(owner, id) == 1 &&
                    (msg.sender == owner ||
                        hwm.isApprovedForAll(owner, msg.sender)),
                "Not authorized to withdraw dividends"
            );
            // calculate share of fee
            dividendsOwed +=
                (hwm.getShares(id) *
                    (totalDividendPoints - lastDividendPoints[id])) /
                A_BIG_NUMBER;
            // update their last claim
            lastDividendPoints[id] = totalDividendPoints;
        }
        hwm.BREEDING_TOKEN().transfer(owner, dividendsOwed);
        return dividendsOwed;
    }

    // withdraw dividends that were refelected to offsprings lineage
    // ids is a list of ids of devils to withdraw ancestor dividends for
    //
    // allAncestorDividends is a list for each devil in *ids* stating which index 
    // the devil ancestor is within the offsprings "devilAncestors" property
    //
    // allDescendants is a list of offspring ids for each devil in ids
    function withdrawAncestorDividends(
        address owner,
        uint256[] memory ids,
        uint256[][] memory allAncestorIndexes,
        uint256[][] memory allDescendants
    ) external returns (uint256) {
        uint256 dividendsOwed;
        require(
            ids.length == allDescendants.length &&
                allAncestorIndexes.length == allDescendants.length,
            "Children need to be stated for each stated devil"
        );
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(
                hwm.balanceOf(owner, id) == 1 &&
                    (msg.sender == owner ||
                        hwm.isApprovedForAll(owner, msg.sender)),
                "Not authorizeds to withdraw dividends"
            );
            uint256[] memory descendants = allDescendants[i];
            uint256[] memory ancestorIndexes = allAncestorIndexes[i];
            require(
                ancestorIndexes.length == descendants.length,
                "Ancestor index need to be stated for each stated child"
            );
            for (uint256 j = 0; j < descendants.length; j++) {
                uint256 descendant = descendants[j];
                uint256 ancestorIndex = ancestorIndexes[j];
                require(
                    !ancestorClaimedDividends[descendant][ancestorIndex],
                    "Devil has already claimed ancestor dividends"
                );
                require(
                    hwm.getAncestor(descendant, ancestorIndex) == id,
                    "Devil must be the correct generation ancestor of given descendant"
                );
                uint256 ancestorDividend = totalAncestorDividends[descendant];
                require(ancestorDividend > 0, "Ancestor dividends must be set");
                // dividends are 1/2^(generation proximity from descendant)
                dividendsOwed +=
                    ancestorDividend /
                    (2**(hwm.getGeneration(id) - ancestorIndex - 1));
                // update claimed status
                ancestorClaimedDividends[descendant][ancestorIndex] = true;
            }
        }
        hwm.BREEDING_TOKEN().transfer(owner, dividendsOwed);
        return dividendsOwed;
    }
}
