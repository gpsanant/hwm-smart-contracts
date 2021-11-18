// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./IHWMGenetics.sol";
import "./IHWMBreedingFeeSplitter.sol";
import "./IHWMBreedingRights.sol";
import "./HWMGenetics.sol";
import "./HWMRedemptionToken.sol";
import "./HWMAssigner.sol";
import "./Holy.sol";

contract HolyWaterMafia is
    ERC1155,
    ReentrancyGuard,
    Holy,
    VRFConsumerBase,
    Ownable
{
    using Address for address payable;
    using ECDSA for bytes32;
    uint256 public devilRedemptionTokenPricePercentile = 0;
    uint256 public angelRedemptionTokenPricePercentile = 67;
    uint256 public angelTokenId = 0;
    uint256 public devilTokenId = 10000000000;
    IHWMGenetics public GENOMICS;
    uint256 public BREEDING_FEE = 25000000000000000;
    uint256[] private BREEDING_COOLDOWNS = [
        60,
        300,
        600,
        1800,
        3600,
        7200,
        21600,
        43200,
        86400,
        172800,
        604800,
        1209600
    ];
    uint256 private breedingDealine;
    uint256 public totalShares = 0;
    mapping(address => bool) public CAN_SET_GENOME;
    address public DONS;
    uint256 public POINT_MULTIPLIER = 10e40;
    IERC20 public BREEDING_TOKEN;
    HWMRedemptionToken public redemptionToken;
    HWMAssigner public assginer;
    IHWMBreedingFeeSplitter public feeSplitter;
    IHWMBreedingRights public breedingRights;
    address public burn = 0x6c6179724C61626F7261746F7269657346747721;

    mapping(bytes32 => bool) public alreadyMated;
    mapping(uint256 => Devil) public devils;
    mapping(uint256 => Angel) public angels;
    mapping(bytes32 => uint256) public requestIdToRandomness;

    mapping(uint256 => bool) public alreadyRedeemed;
    mapping(address => bytes32[]) public devilMintRequestIds;
    mapping(address => bytes32[]) public angelMintRequestIds;
    mapping(bytes32 => bytes32) public matingHashToRequestId;
    mapping(bytes32 => uint256) public matingHashToAncestorDividend;
    // angel id => child index => child id
    mapping(uint256 => mapping(uint256 => uint256)) public angelIdToChildIndexToChildId;
    // Token Id => Current Owner
    mapping(uint256 => address) public ownerOf;

    bytes32 internal keyHash;
    uint256 internal fee;
    event BreedingApproval(uint256 angelId, uint256 devilId);
    event Stuff(bytes32 requestId, uint256 i);
    event Pregnancy(
        address owner,
        uint256 devilId,
        uint256 angelId,
        bytes32 requestId
    );
    event DevilMint(
        address owner,
        uint256 id
    );
    event AngelMint(
        address owner,
        uint256 id
    );
    event DevilBirth(
        address owner,
        uint256 id,
        bytes32 genome,
        uint8 generation,
        uint256 angelParent,
        uint256 devilParent,
        uint104 shares
    );
    event AngelBirth(
        address owner,
        uint256 id,
        bytes32 genome,
        uint8 generation,
        uint256 angelParent,
        uint256 devilParent
    );

    constructor(
        address linkToken,
        address _vrfCoordinator,
        address dons,
        IERC20 token,
        HWMRedemptionToken _redemptionToken,
        HWMAssigner _assigner
    )
        ERC1155("https://game.example/api/item/{id}.json")
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        breedingDealine = block.timestamp + 604800;
        DONS = dons;
        GENOMICS = new HWMGenetics();
        BREEDING_TOKEN = token;
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.0001 * 10**18;
        redemptionToken = _redemptionToken;
        assginer = _assigner;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        requestIdToRandomness[requestId] = randomness;
    }

    function mintTokens(address owner, uint256[] memory ids)
        external
        nonReentrant
    {
        require(
            owner == msg.sender ||
                redemptionToken.isApprovedForAll(owner, msg.sender),
            "Only the owner and approved can redeem the redemption tokens"
        );
        require(
            LINK.balanceOf(address(this)) >= ids.length * fee,
            "Not enough LINK - fill contract with faucet"
        );
        uint256[] memory amounts = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            require(!alreadyRedeemed[ids[i]], "This token has already redeemed a token");
            require(
                redemptionToken.balanceOf(owner, ids[i]) == 1,
                "Owner does not own said redemptionTokens"
            );
            bytes32 requestId = requestRandomness(keyHash, fee);
            // if angel, add request id to angelMintRequestIds else add to devilMintRequestIds
            // if this was an unbouncable token, take their tokens now. 
            // if devil 0% percentile of the bounce token price
            // if angel 66% percentile of the bounce token price 
            // add it to the requestId arrays for the user
            bool isAngel = assginer.species(ids[i]) == 2;
            if (isAngel) {
                if(ids[i] <= redemptionToken.numUnbouncableTokens()){
                    redemptionToken.saleToken().transferFrom(msg.sender, DONS, redemptionToken.bouncePricePercentile(angelRedemptionTokenPricePercentile));
                }
                angelMintRequestIds[msg.sender].push(requestId);
                emit AngelMint(owner, ids[i]);
            } else {
                if(ids[i] <= redemptionToken.numUnbouncableTokens()){
                    redemptionToken.saleToken().transferFrom(msg.sender, DONS, redemptionToken.bouncePricePercentile(devilRedemptionTokenPricePercentile));
                }
                devilMintRequestIds[msg.sender].push(requestId);
                emit DevilMint(owner, ids[i]);
            }
            amounts[i] = 1;
            // set as already redeemed
            alreadyRedeemed[ids[i]] = true;
        }
    }

    function claimTokens(address owner) external nonReentrant {
        require(
            owner == msg.sender || isApprovedForAll(owner, msg.sender),
            "Only the owner and approved can claim tokens"
        );
        // mint devils
        for (uint256 i = 0; i < devilMintRequestIds[owner].length; i++) {
            // get randomness
            uint256 randomness = requestIdToRandomness[
                devilMintRequestIds[owner][i]
            ];
            require(randomness != uint256(0), "Randomness must be set");
            // get genome from genomics module
            bytes32 devilGenome = GENOMICS.getGen0DevilGenome(
                devilTokenId,
                randomness
            );
            _mintDevil(owner, devilGenome, 0, 0, 0);
        }
        delete devilMintRequestIds[owner];
        // mint angels
        for (uint256 i = 0; i < angelMintRequestIds[owner].length; i++) {
            // get randomness
            uint256 randomness = requestIdToRandomness[
                angelMintRequestIds[owner][i]
            ];
            require(randomness != uint256(0), "Randomness must be set");
            // get genome from genomics module
            bytes32 angelGenome = GENOMICS.getGen0AngelGenome(
                angelTokenId,
                randomness
            );
            _mintAngel(owner, angelGenome, 0, 0, 0);
        }
        delete angelMintRequestIds[owner];
    }

    function setApprovedToBreed(
        address owner,
        uint256 devilId,
        uint256 angelId
    ) external {
        require(
            balanceOf(owner, devilId) == 1 &&
                (msg.sender == owner || isApprovedForAll(owner, msg.sender)),
            "User is not authorized to modify angel"
        );
        require(
            block.timestamp > angels[angelId].setApprovedToBreedCooldown,
            "Devil must be given ample time to breed"
        );
        // allow devil 1 day to breed with angel
        angels[angelId].setApprovedToBreedCooldown = block.timestamp + 86400;
        // set devil to breed
        angels[angelId].approvedDevilIdToBreed = devilId;
        emit BreedingApproval(angelId, devilId);
    }

    function breed(
        address owner,
        uint256 devilId,
        uint256 angelId
    ) external nonReentrant {
        require(angelId <= angelTokenId, "Angel id is invalid");
        require(
            devilId > 10000000000 && devilId <= devilTokenId,
            "Devil id is invalid"
        );
        require(
            balanceOf(owner, devilId) == 1 &&
                (msg.sender == owner || isApprovedForAll(owner, msg.sender)),
            "User is not authorized to breed devil"
        );
        Devil storage devil = devils[devilId];
        Angel storage angel = angels[angelId];
        bytes32 matingHash = keccak256(abi.encodePacked(devilId, angelId));
        require(
            angel.approvedDevilIdToBreed == devilId,
            "Devil is not approved to breed with angel"
        );
        require(
            devil.angelParent != angelId,
            "Devil cannot mate with their angel parent"
        );
        require(
            angel.devilParent != devilId,
            "Angel cannot mate with their devil parent"
        );
        require(!alreadyMated[matingHash], "This pair has already mated");
        require(
            block.timestamp > devil.breedingCooldown,
            "You must wait until the cooldown time is reached to breed the devil"
        );
        require(
            block.timestamp > angel.breedingCooldown,
            "You must wait until the cooldown time is reached to breed the angel"
        );
        require(devil.matingWith == 0, "You cannot mate a pregnant devil");
        require(breedingRights.balanceOf(owner, angelId) == 1 || breedingRights.balanceOf(msg.sender, angelId) == 1, "Must own breeding rights to breed with this angel");
        breedingRights.resetBreedingRights(angelId);
        alreadyMated[matingHash] = true;
        bytes32 requestId = requestRandomness(keyHash, fee);
        uint256 newAngelCooldown;
        if (angel.numChildren > 11) {
            newAngelCooldown = 1209600;
        } else {
            newAngelCooldown = BREEDING_COOLDOWNS[angel.numChildren];
        }
        uint256 newDevilCooldown;
        if (devil.numChildren > 11) {
            newDevilCooldown = 1209600;
        } else {
            newDevilCooldown = BREEDING_COOLDOWNS[angel.numChildren];
        }
        angels[angelId].breedingCooldown = block.timestamp + newAngelCooldown;
        devils[devilId].breedingCooldown = block.timestamp + newDevilCooldown;
        devils[devilId].matingWith = angelId;
        emit Pregnancy(owner, devilId, angelId, requestId);
    }

    function giveBirth(address owner, uint256 devilId) external {
        require(
            balanceOf(owner, devilId) == 1 &&
                (msg.sender == owner || isApprovedForAll(owner, msg.sender)),
            "User is not authorized to breed devil"
        );
        Devil storage devil = devils[devilId];
        uint256 angelId = devil.matingWith;
        require(angelId != 0, "You cannot mate a pregnant angel");
        devil.matingWith = 0;
        Angel storage angel = angels[angelId];
        require(
            block.timestamp > devil.breedingCooldown,
            "You must wait until the cooldown time is reached to give birth"
        );
        bytes32 matingHash = keccak256(abi.encodePacked(devilId, angelId));
        uint256 randomness = requestIdToRandomness[
            matingHashToRequestId[matingHash]
        ];

        require(randomness != uint256(0), "Randomness must be set");
        (
            bool isAngel,
            Angel memory newAngelParent,
            Devil memory newDevilParent,
            bytes32 newGenome,
            uint8 generation
        ) = GENOMICS.getChild(devil, angel, randomness);
        angels[angelId] = newAngelParent;
        devils[devilId] = newDevilParent;
        if (isAngel) {
            angelTokenId++;
            feeSplitter.setChildId(
                angelTokenId,
                angelId,
                newAngelParent.numChildren,
                false
            );
            angelIdToChildIndexToChildId[angelId][getAngelNumChildren(angelId) - 1] = angelTokenId;
            _mintAngel(owner, newGenome, generation, angelId, devilId);
        } else {
            devilTokenId++;
            feeSplitter.setChildId(
                devilTokenId,
                angelId,
                newAngelParent.numChildren,
                true
            );
            angelIdToChildIndexToChildId[angelId][getAngelNumChildren(angelId) - 1] = devilTokenId;
            _mintDevil(owner, newGenome, generation, angelId, devilId);
        }
    }

    function _mintDevil(
        address owner,
        bytes32 genome,
        uint8 generation,
        uint256 angelParentId,
        uint256 devilParentId
    ) internal {
        uint104 shares = uint104(2**(66 - generation));
        totalShares += shares;
        uint256[] storage devilAncestors = devils[devilParentId].devilAncestors;
        if (devilParentId != 0) {
            devilAncestors.push(devilParentId);
        }
        devils[devilTokenId] = Devil(
            genome,
            generation,
            angelParentId,
            devilParentId,
            0,
            0,
            shares,
            0,
            devilAncestors
        );
        _mint(owner, devilTokenId, 1, "");
        emit DevilBirth(
            owner,
            devilTokenId,
            genome,
            generation,
            angelParentId,
            devilParentId,
            shares
        );
    }

    function _mintAngel(
        address owner,
        bytes32 genome,
        uint8 generation,
        uint256 angelParentId,
        uint256 devilParentId
    ) internal {
        angels[angelTokenId] = Angel(
            genome,
            generation,
            angelParentId,
            devilParentId,
            0,
            0,
            0,
            0
        );
        _mint(owner, angelTokenId, 1, "");
        emit AngelBirth(
            owner,
            angelTokenId,
            genome,
            generation,
            angelParentId,
            devilParentId
        );
    }

    function getShares(uint256 devilId) public view returns (uint256) {
        return devils[devilId].shares;
    }

    function getAncestor(uint256 devilId, uint256 ancestorIndex)
        public
        view
        returns (uint256)
    {
        return devils[devilId].devilAncestors[ancestorIndex];
    }

    function getGeneration(uint256 devilId) public view returns (uint256) {
        return devils[devilId].generation;
    }

    function getDevilNumChildren(uint256 devilId) public view returns (uint256) {
        return devils[devilId].numChildren;
    }

    function getAngelNumChildren(uint256 angelId) public view returns (uint256) {
        return angels[angelId].numChildren;
    }

    function getDevil(uint256 devilId) public view returns (Devil memory) {
        return devils[devilId];
    }

    function getAngel(uint256 angelId) public view returns (Angel memory) {
        return angels[angelId];
    }

    function setDons(address dons) external {
        require(msg.sender == DONS, "Only the dons can change the dons");
        DONS = dons;
    }

    function setBreedingRightsToken(IHWMBreedingRights _breedingRights) external onlyOwner {
        require(address(breedingRights) == address(0), "Breeding rights token has already been set");
        breedingRights = _breedingRights;
    }

    function setBreedingFeeSplitter(IHWMBreedingFeeSplitter _feeSplitter) external onlyOwner {
        require(address(feeSplitter) == address(0), "Breeding rights token has already been set");
        feeSplitter = _feeSplitter;
    }

    function setGenomics(IHWMGenetics _genomics) external onlyOwner {
        GENOMICS = _genomics;
    }

    function setBreedingToken(IERC20 _token) external onlyOwner {
        BREEDING_TOKEN = _token;
    }

    function setGenomeSetterCapability(address genomeSetter, bool canSetGenomes)
        external
        onlyOwner
    {
        CAN_SET_GENOME[genomeSetter] = canSetGenomes;
    }

    function setGenomes(
        uint256[] memory devilIds,
        bytes32[] memory devilGenomes,
        uint256[] memory angelIds,
        bytes32[] memory angelGenomes
    ) external {
        require(
            CAN_SET_GENOME[msg.sender] == true,
            "Must be a genome setter to set genomes"
        );
        uint256 numDevils = devilIds.length;
        require(
            numDevils == devilGenomes.length,
            "Must be 1 genome for every devil"
        );
        uint256 numAngels = angelIds.length;
        require(
            numDevils == angelGenomes.length,
            "Must be 1 genome for every devil"
        );
        for (uint256 i = 0; i < numDevils; i++) {
            devils[devilIds[i]].genome = devilGenomes[i];
        }
        for (uint256 i = 0; i < numAngels; i++) {
            angels[angelIds[i]].genome = angelGenomes[i];
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            ownerOf[ids[i]] = to;
        }
    }
}
