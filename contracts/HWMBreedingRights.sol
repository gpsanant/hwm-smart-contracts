// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./HolyWaterMafia.sol";
import "./IHWMBreedingFeeSplitter.sol";

contract HWMBreedingRights is Context, ERC1155 {
    address public dons;
    uint256 public constant initialPrice = 1000000;
    uint256 public constant A_BIG_NUMBER = 10e50;
    HolyWaterMafia public hwm;
    IHWMBreedingFeeSplitter public feeSplitter;

    string private _uri;
    string public contractURI;
    // Token Id => Current Owner
    mapping(uint256 => address) public ownerOf;
    // Token Id => Number of times has been sold
    mapping(uint256 => uint8) public numBounces;
    // Token Id => Last price the token was sold for
    mapping(uint256 => uint256) public lastBouncePrice;
    // Different price
    uint256[] public bouncePrices;
    // Price => Number of tokens bounced at that price
    mapping(uint256 => uint256) public bouncesAtPrice;

    bool public bouncing = false;
    bool public reseting = false;
    mapping(uint256 => uint256) public unclaimedMatingDividends;
    mapping(uint256 => uint256) public claimedMatingDividends;
    uint256 public totalMatingDividends;
    uint256 public totalNumBounces;

    event Bounce(uint256 tokenId, address from, address to);
    event Mint(address to, uint256[] ids);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor(
        string memory uri,
        string memory _contractUri,
        HolyWaterMafia _hwm,
        IHWMBreedingFeeSplitter _feeSplitter
    ) ERC1155(uri) {
        _uri = uri;
        contractURI = _contractUri;
        dons = _msgSender();
        hwm = _hwm;
        feeSplitter = _feeSplitter;
    }

    modifier onlyDons() {
        require(msg.sender == dons, "This function is restricted to the dons");
        _;
    }

    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function uri(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked(_uri, uint2str(_tokenId)));
    }

    function setURI(string memory _newURI) external onlyDons {
        _uri = _newURI;
    }

    function setContractURI(string memory _newContractURI) external onlyDons {
        contractURI = _newContractURI;
    }

    function _elementToArray(uint256 element)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](1);
        array[0] = element;
        return array;
    }

    function changeDons(address newDons) external onlyDons {
        dons = newDons;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external virtual onlyDons {
        require(
            msg.sender == address(hwm),
            "Only the HolyWaterMafia contract can mint breeding rights tokens"
        );
        _mint(to, id, 1, data);
        emit Mint(to, _elementToArray(id));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
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
        // If being minted
        if (from == address(0)) {
            // Make sure a token id doesn't have more than 2 tokens
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                require(
                    ownerOf[id] == address(0),
                    "Token has already been minted"
                );
                ownerOf[id] = to;
            }
        } else {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                ownerOf[id] = to;
                require(bouncing, "Can only bounce gaseous tokens");
                totalNumBounces++;
                emit Bounce(id, from, to);
            }
            bouncing = false;
        }
    }

    function bounce(uint256 id, address newOwner) external {
        IERC20 breedingToken = hwm.BREEDING_TOKEN();
        address owner = ownerOf[id];
        require(owner != address(0), "Token has not been minted");
        uint8 numBouncesForToken = numBounces[id];
        if (numBouncesForToken != 0) {
            // Give owner the price they paid plus half of the 30% premium
            // Give the dons 50% of the premium
            // Give the past owners 20% of the premium
            uint256 growthRate = 15;
            if (numBounces[id] > 20) {
                growthRate = 11;
            } else if (numBounces[id] > 15) {
                growthRate = 13;
            }
            uint256 price = (lastBouncePrice[id] * growthRate) / 10;
            uint256 lastPrice = lastBouncePrice[id];
            lastBouncePrice[id] = price;
            uint256 fiftiethOfIncrease = (price - lastPrice) / 50;
            unclaimedMatingDividends[id] += 25 * fiftiethOfIncrease;
            breedingToken.transferFrom(
                msg.sender,
                owner,
                lastPrice + 9 * fiftiethOfIncrease
            );
            breedingToken.transferFrom(
                msg.sender,
                address(feeSplitter),
                8 * fiftiethOfIncrease
            );
            feeSplitter.splitBreedingFee(8 * fiftiethOfIncrease, id);
            breedingToken.transferFrom(msg.sender, dons, 8 * fiftiethOfIncrease);
            if (bouncesAtPrice[price] == 0) {
                bouncePrices.push(price);
            }
            bouncesAtPrice[price]++;
        } else {
            // If first sale, give the owner the initial price
            lastBouncePrice[id] = initialPrice;
            breedingToken.transferFrom(msg.sender, owner, initialPrice);
            if (bouncesAtPrice[initialPrice] == 0) {
                bouncePrices.push(initialPrice);
            }
            bouncesAtPrice[initialPrice]++;
        }

        numBounces[id]++;
        bouncing = true;
        _safeTransferFrom(owner, newOwner, id, 1, "");
    }

    function matingDividends(address angelOwner, uint256[] memory ids)
        public
        view
        returns (uint256)
    {
        require(
            angelOwner == msg.sender ||
                hwm.isApprovedForAll(angelOwner, msg.sender),
            "Only the owner and approved can withdraw mating dividends"
        );
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(
                hwm.balanceOf(angelOwner, id) == 1,
                "Owner does not own said angels"
            );
            dividendsOwed += unclaimedMatingDividends[id];
        }
        return dividendsOwed;
    }

    function withdrawMatingDividends(address angelOwner, uint256[] memory ids)
        public
    {
        require(
            angelOwner == msg.sender ||
                hwm.isApprovedForAll(angelOwner, msg.sender),
            "Only the owner and approved can withdraw mating dividends"
        );
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(
                hwm.balanceOf(angelOwner, id) == 1,
                "Owner does not own said angels"
            );
            dividendsOwed += unclaimedMatingDividends[id];
            claimedMatingDividends[id] += unclaimedMatingDividends[id];
            unclaimedMatingDividends[id] = 0;
        }
        totalMatingDividends += dividendsOwed;
        hwm.BREEDING_TOKEN().transfer(angelOwner, dividendsOwed);
    }

    function resetBreedingRights(uint256 id) public {
        require(
            msg.sender == address(hwm),
            "Only the HolyWaterMafia contract can reset breeding rights tokens"
        );
        numBounces[id] = 0;
        lastBouncePrice[id] = initialPrice;
        bouncing = true;
        _safeTransferFrom(ownerOf[id], hwm.ownerOf(id), id, 1, "0x");
    }
}
