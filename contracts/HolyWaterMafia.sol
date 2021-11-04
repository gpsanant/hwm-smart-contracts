// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./IHWMGenetics.sol";
import "./HWMGenetics.sol";
import "./Holy.sol";

contract HolyWaterMafia is
    ERC1155,
    ReentrancyGuard,
    PullPayment,
    Holy,
    VRFConsumerBase
{
    using Address for address payable;
    using ECDSA for bytes32;
    uint256 public angelTokenId = 0;
    uint256 public devilTokenId = 10000000000;
    uint256 public numGen0Devils = 0;
    uint256 public MAX_GEN0_DEVILS = 6666;
    uint256 public numGen0Angels = 0;
    uint256 public MAX_GEN0_ANGELS = 3333;
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
    uint256 public HELLS_SHARE = 500;
    uint256 private breedingDealine;
    uint256 public owedDividends = 0;
    uint256 public totalDividendPoints = 0;
    uint256 public totalShares = 0;
    mapping(address => bool) public CAN_SET_GENOME;
    address public DONS;
    address public MULTISIG;
    address public TREASURY;
    uint256 public POINT_MULTIPLIER = 10e40;
    IERC20 public TOKEN;

    mapping(bytes32 => bool) public alreadyMated;
    mapping(uint256 => Devil) public devils;
    mapping(uint256 => Angel) public angels;
    mapping(bytes32 => uint256) public requestIdToRandomness;

    mapping(address => bool) public hasPurchasedDevils;
    mapping(address => bool) public hasPurchasedAngels;
    mapping(address => bytes32[]) public devilMintRequestIds;
    mapping(address => bytes32[]) public angelMintRequestIds;
    mapping(bytes32 => bytes32) public matingHashToRequestId;

    bytes32 internal keyHash;
    uint256 internal fee;
    event BreedingApproval(uint256 angelId, uint256 devilId);
    event Stuff(bytes32 requestId, uint256 i);
    event DevilPurchase(
        address owner,
        bytes32 requestId
    );
    event AngelPurchase(
        address owner,
        bytes32 requestId
    );
    event Pregnancy(
        address owner,
        uint256 devilId, 
        uint256 angelId,
        bytes32 requestId
    );
    event DevilBirth(
        address owner,
        uint256 id,
        bytes32 genome,
        uint8 generation,
        uint256 angelParent,
        uint256 devilParent,
        uint104 shares,
        uint256 lastDividendPoints
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
        address multisig,
        IERC20 token
    )
        ERC1155("https://game.example/api/item/{id}.json")
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        breedingDealine = block.timestamp + 604800;
        DONS = dons;
        MULTISIG = multisig;
        GENOMICS = new HWMGenetics();
        TOKEN = token;
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.0001 * 10**18;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        requestIdToRandomness[requestId] = randomness;
    }

    function purchaseGen0Devil(uint8 amount) external payable nonReentrant {
        require(hasPurchasedDevils[msg.sender] != true, "User already purchased devils");
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        require(
            numGen0Devils < MAX_GEN0_DEVILS,
            "All Gen0 Devils have been minted"
        );
        require(msg.value == amount*50000000000000000, "Minting price is incorrect");
        require(amount < 4 && amount > 0, "Cannot purchase more than 3 devils");
        hasPurchasedDevils[msg.sender] = true;
        _asyncTransfer(DONS, amount*msg.value);
        for(uint i = 0; i < amount; i++){
            bytes32 requestId = requestRandomness(keyHash, fee);
            devilMintRequestIds[msg.sender].push(requestId);
            numGen0Devils++;
            emit DevilPurchase(msg.sender, requestId);
        }       
    }

    function claimGen0Devil(address owner) external payable nonReentrant {
        for (uint i = 0; i < devilMintRequestIds[owner].length; i++) {
            uint256 randomness = requestIdToRandomness[
                devilMintRequestIds[owner][i]
            ];
            require(randomness != uint256(0), "Randomness must be set");
            bytes32 devilGenome = GENOMICS.getGen0DevilGenome(
                devilTokenId,
                randomness
            );
            _mintDevil(owner, devilGenome, 0, 0, 0);
        }
        delete devilMintRequestIds[owner];
    }

    function purchaseGen0Angel() external payable nonReentrant {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        require(
            numGen0Angels < MAX_GEN0_ANGELS,
            "All Gen0 Angels have been minted"
        );
        require(msg.value == 100000000000000000, "Minting price is incorrect");
        _asyncTransfer(DONS, msg.value);
        bytes32 requestId = requestRandomness(keyHash, fee);
        angelMintRequestIds[msg.sender].push(requestId);
        numGen0Angels++;
        emit AngelPurchase(msg.sender, requestId);  
    }

    function claimGen0Angel(address owner) external payable nonReentrant {
        for (uint i = 0; i < angelMintRequestIds[owner].length; i++) {
            uint256 randomness = requestIdToRandomness[
                angelMintRequestIds[owner][i]
            ];
            require(randomness != uint256(0), "Randomness must be set");
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
            balanceOf(msg.sender, angelId) == 1 ||
                (balanceOf(owner, angelId) == 1 &&
                    isApprovedForAll(owner, msg.sender)),
            "User is not authorized to modify angel"
        );
        require(
            block.timestamp > angels[angelId].setApprovedToBreedCooldown,
            "Devil must be given ample time to breed"
        );
        angels[angelId].setApprovedToBreedCooldown = block.timestamp + 86400000;
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
            balanceOf(msg.sender, devilId) == 1 ||
                (balanceOf(owner, devilId) == 1 &&
                    isApprovedForAll(owner, msg.sender)),
            "User is not authorized to breed devil"
        );
        Devil storage devil = devils[devilId];
        Angel storage angel = angels[angelId];
        TOKEN.transferFrom(owner, DONS, BREEDING_FEE / 3);
        uint256 hellsShareOfFee = (BREEDING_FEE * 2 * HELLS_SHARE) / 3000;
        TOKEN.transferFrom(owner, address(this), hellsShareOfFee);
        if (TREASURY != address(0)) {
            TOKEN.transferFrom(
                owner,
                TREASURY,
                BREEDING_FEE - hellsShareOfFee - BREEDING_FEE / 3
            );
        } else {
            TOKEN.transferFrom(
                owner,
                address(this),
                BREEDING_FEE - hellsShareOfFee - BREEDING_FEE / 3
            );
        }
        totalDividendPoints +=
            (POINT_MULTIPLIER * BREEDING_FEE * 2 * HELLS_SHARE) /
            3000 /
            totalShares;
        owedDividends += (BREEDING_FEE * 2 * HELLS_SHARE) / 3000;
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
        require(
            devil.matingWith == 0,
            "You cannot mate a pregnant angel"
        );
        alreadyMated[matingHash] = true;
        bytes32 requestId = requestRandomness(keyHash, fee);
        matingHashToRequestId[matingHash] = requestId;
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
        // (
        //     bool isAngel,
        //     Angel memory newAngelParent,
        //     Devil memory newDevilParent,
        //     bytes32 newGenome,
        //     uint8 generation
        // ) = GENOMICS.getChild(devil, angel, uint256(blockhash(0)));
        // angels[angelId] = newAngelParent;
        // devils[devilId] = newDevilParent;
        // if (isAngel) {
        //     _mintAngel(owner, newGenome, generation, angelId, devilId);
        // } else {
        //     _mintDevil(owner, newGenome, generation, angelId, devilId);
        // }
    }

    function giveBirth(address owner, uint256 devilId) external {
        Devil storage devil = devils[devilId];
        uint angelId = devil.matingWith;
        require(
            angelId != 0,
            "You cannot mate a pregnant angel"
        );
        devil.matingWith = 0;
        Angel storage angel = angels[angelId];
        require(
            block.timestamp > devil.breedingCooldown,
            "You must wait until the cooldown time is reached to give birth"
        );
        uint256 randomness = requestIdToRandomness[
            matingHashToRequestId[keccak256(abi.encodePacked(devilId, angelId))]
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
            _mintAngel(owner, newGenome, generation, angelId, devilId);
        } else {
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
        devilTokenId++;
        uint104 shares = uint104(2**(66 - generation));
        totalShares += shares;
        devils[devilTokenId] = Devil(
            genome,
            generation,
            angelParentId,
            devilParentId,
            0,
            0,
            shares,
            totalDividendPoints,
            0
        );
        _mint(owner, devilTokenId, 1, "");
        emit DevilBirth(
            owner,
            devilTokenId,
            genome,
            generation,
            angelParentId,
            devilParentId,
            shares,
            totalDividendPoints
        );
    }

    function _mintAngel(
        address owner,
        bytes32 genome,
        uint8 generation,
        uint256 angelParentId,
        uint256 devilParentId
    ) internal {
        angelTokenId++;
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

    function getDevil(uint256 devilId) public view returns (Devil memory) {
        return devils[devilId];
    }

    function getAngel(uint256 angelId) public view returns (Angel memory) {
        return angels[angelId];
    }

    function dividendBalance(uint256 devilId) public view returns (uint256) {
        Devil storage devil = devils[devilId];
        return
            (devil.shares * (totalDividendPoints - devil.lastDividendPoints)) /
            POINT_MULTIPLIER;
    }

    function withdrawDividends(address payable owner, uint256 devilId)
        public
        nonReentrant
    {
        require(
            balanceOf(owner, devilId) == 1,
            "User is not authorized to withdraw for devil"
        );
        uint256 dividends = dividendBalance(devilId);
        devils[devilId].lastDividendPoints = totalDividendPoints;
        owedDividends -= dividends;
        TOKEN.transferFrom(address(this), owner, dividends);
    }

    modifier onlyTreasury() {
        require(
            msg.sender == TREASURY,
            "This function is restricted to the contract's tresury"
        );
        _;
    }

    function setTreasury(address treasury) external onlyTreasury {
        TREASURY = treasury;
    }

    function setTreasuryFromMultisig(address treasury) external {
        require(
            msg.sender == MULTISIG,
            "Only the multisig can change the treasury"
        );
        TREASURY = treasury;
    }

    function setMultisig(address multisig) external {
        require(
            msg.sender == MULTISIG,
            "Only the multisig can change the multisig"
        );
        MULTISIG = multisig;
    }

    function setDons(address dons) external {
        require(msg.sender == DONS, "Only the dons can change the dons");
        DONS = dons;
    }

    function setBreedingFee(uint256 breedingFee) external onlyTreasury {
        BREEDING_FEE = breedingFee;
    }

    function setHellsShare(uint256 hellsShare) external onlyTreasury {
        HELLS_SHARE = hellsShare;
    }

    function setGenomics(IHWMGenetics _genomics) external onlyTreasury {
        GENOMICS = _genomics;
    }

    function setToken(IERC20 _token) external onlyTreasury {
        TOKEN = _token;
    }

    function setGenomeSetterCapability(address genomeSetter, bool canSetGenomes)
        external
        onlyTreasury
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
}
