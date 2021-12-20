// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract HWMRedemptionToken is Context, ERC1155 {
    address public dons;
    address private team;
    uint256 public constant initialPrice = 1000000;
    uint256 public constant A_BIG_NUMBER = 10e50;
    uint256 public constant numUnbouncableTokens = 733;
    uint256 public constant numUnbouncableAngels = 533;
    uint256 public constant numUnbouncableDevils = 200;
    IERC20 public immutable saleToken;

    string private _uri;
    string public contractURI;
    // Token Id => Time it was first bounced
    mapping(uint256 => uint256) public timeOfFirstBounce;
    // Token Id => Current Owner
    mapping(uint256 => address) public ownerOf;
    // Token Id => Number of times has been sold
    mapping(uint256 => uint8) public numBounces;
    // Token Id => Time of last Bounce
    mapping(uint256 => uint256) public lastBounceTime;
    // Owner => Token Id => How long they held for
    mapping(address => mapping(uint256 => uint256)) public ownerTimeShares;
    // Token Id => Cummulative amount of dividends awarded past holders
    mapping(uint256 => uint256) public pastHolderDividends;
    // Token Id => The amount of dividends that the token had accumulated when the past owner last redeemed
    mapping(uint256 => mapping(address => uint256))
        public pastHolderLastDividends;
    // Address => The ids of the tokens the address has owned in the past and currently
    mapping(address => uint256[]) public tokensHeld;
    // Token Id => Last price the token was sold for
    mapping(uint256 => uint256) public lastBouncePrice;
    // Different price
    uint256[] public bouncePrices;
    // Price => Number of tokens bounced at that price
    mapping(uint256 => uint256) public tokensAtPrice;

    mapping(address => bool) public isLegitReferrer;

    bool public bouncing = false;
    mapping(address => uint256) public claimedDividends;
    uint256 public totalDividends;
    uint256 public totalUnclaimedDividends;
    uint256 public totalNumBounces;

    event Bounce(uint256 tokenId, address from, address to, uint256 dividends);
    event DividendsClaimed(address owner, uint256 dividends);
    event Mint(address to, uint256[] ids);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor(
        string memory uri,
        string memory _contractUri,
        IERC20 _saleToken,
        address _team
    ) ERC1155(uri) {
        _uri = uri;
        isLegitReferrer[address(0)] = true;
        contractURI = _contractUri;
        saleToken = _saleToken;
        dons = _msgSender();
        team = _team;
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

    function changeTeam(address newTeam) external onlyDons {
        team = newTeam;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external virtual onlyDons {
        _mint(to, id, amount, data);
        emit Mint(to, _elementToArray(id));
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external virtual onlyDons {
        _mintBatch(to, ids, amounts, data);
        emit Mint(to, ids);
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
                require(id > 0 && id < 10000, "Id must be in valid range");
                require(
                    ownerOf[id] == address(0),
                    "Token has already been minted"
                );
                require(amounts[i] == 1, "Can only mint one token per id");
                if (id > numUnbouncableTokens) {
                    lastBounceTime[id] = block.timestamp;
                }
                ownerOf[id] = to;
            }
        } else {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                ownerOf[id] = to;
                if (id > numUnbouncableTokens) {
                    require(bouncing, "Can only bounce gaseous tokens");
                    totalNumBounces++;
                    lastBounceTime[id] = block.timestamp;
                }
            }
            if (bouncing) {
                bouncing = false;
            }
        }
    }

    function bounce(uint256 id, address newOwner, address referrer) external {
        require(id > numUnbouncableTokens, "Token is not gaseuous");
        require(isLegitReferrer[referrer], "Refferer is not approved");
        address owner = ownerOf[id];
        require(owner != address(0), "Token has not been minted");
        uint8 numBouncesForToken = numBounces[id];
        if (numBouncesForToken != 0) {
            // Transfer owner their past dividends so their new shares only count going forward
            if (ownerTimeShares[owner][id] > 0) {
                uint256 ownerPastDividendsOwed = (ownerTimeShares[owner][id] *
                    (pastHolderDividends[id] -
                        pastHolderLastDividends[id][owner])) / A_BIG_NUMBER;
                saleToken.transfer(owner, ownerPastDividendsOwed);
                claimedDividends[owner] += ownerPastDividendsOwed;
                pastHolderLastDividends[id][owner] = pastHolderDividends[id];
                emit DividendsClaimed(owner, ownerPastDividendsOwed);
                totalUnclaimedDividends -= ownerPastDividendsOwed;
            }
            // Give owner the price they paid plus half of the 30% premium
            // Give the dons 50% of the premium
            // Give the past owners 20% of the premium
            uint256 growthRate = 15;
            if (numBounces[id] > 20) {
                growthRate = 11;
            } else if (numBounces[id] > 15) {
                growthRate = 13;
            }
            uint256 lastPrice = lastBouncePrice[id];
            uint256 price = (lastPrice * growthRate) / 10;
            lastBouncePrice[id] = price;
            uint256 twentiethOfIncrease = (price - lastPrice) / 20;
            saleToken.transferFrom(
                msg.sender,
                owner,
                lastPrice + 6 * twentiethOfIncrease
            );
            saleToken.transferFrom(
                msg.sender,
                address(this),
                4 * twentiethOfIncrease
            );
            totalDividends += 4 * twentiethOfIncrease;
            totalUnclaimedDividends += 4 * twentiethOfIncrease;
            saleToken.transferFrom(msg.sender, team, 9 * twentiethOfIncrease);
            saleToken.transferFrom(msg.sender, referrer, 1 * twentiethOfIncrease);
            // Update total dividends
            pastHolderDividends[id] +=
                (4 * A_BIG_NUMBER * twentiethOfIncrease) /
                (block.timestamp - timeOfFirstBounce[id]);
            // Update owners shares
            ownerTimeShares[owner][id] += block.timestamp - lastBounceTime[id];
            if (tokensAtPrice[price] == 0) {
                bouncePrices.push(price);
            }
            tokensAtPrice[price]++;
            tokensAtPrice[lastPrice]--;
            emit Bounce(id, owner, newOwner, 4 * twentiethOfIncrease);
        } else {
            // If first sale, give the owner the initial price

            lastBouncePrice[id] = initialPrice;
            saleToken.transferFrom(msg.sender, owner, initialPrice*9/10);
            saleToken.transferFrom(msg.sender, referrer, initialPrice/10);
            if (tokensAtPrice[initialPrice] == 0) {
                bouncePrices.push(initialPrice);
            }
            tokensAtPrice[initialPrice]++;
            timeOfFirstBounce[id] = block.timestamp;
            emit Bounce(id, owner, newOwner, 0);
        }

        // Add current token to tokensHeld of new owner if they havent held it before
        if (ownerTimeShares[newOwner][id] == 0) {
            tokensHeld[newOwner].push(id);
        } else {
            //If they have held it before, send them their dividends so they don't lose them!
            uint256 newOwnerPastDividendsOwed = (ownerTimeShares[newOwner][id] *
                (pastHolderDividends[id] -
                    pastHolderLastDividends[id][newOwner])) / A_BIG_NUMBER;
            saleToken.transfer(newOwner, newOwnerPastDividendsOwed);
            claimedDividends[newOwner] += newOwnerPastDividendsOwed;
            emit DividendsClaimed(newOwner, newOwnerPastDividendsOwed);
            totalUnclaimedDividends -= newOwnerPastDividendsOwed;
        }

        numBounces[id]++;
        // New owner cannot have share in past dividendss
        pastHolderLastDividends[id][newOwner] = pastHolderDividends[id];
        bouncing = true;
        _safeTransferFrom(owner, newOwner, id, 1, "");
    }

    function dividendsSpecific(address owner, uint256[] memory ids)
        external
        view
        returns (uint256)
    {
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            dividendsOwed +=
                (ownerTimeShares[owner][id] *
                    (pastHolderDividends[id] -
                        pastHolderLastDividends[id][owner])) /
                A_BIG_NUMBER;
        }
        return dividendsOwed;
    }

    function dividends(address owner) external view returns (uint256) {
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < tokensHeld[owner].length; i++) {
            uint256 id = tokensHeld[owner][i];
            dividendsOwed +=
                (ownerTimeShares[owner][id] *
                    (pastHolderDividends[id] -
                        pastHolderLastDividends[id][owner])) /
                A_BIG_NUMBER;
        }
        return dividendsOwed;
    }

    function withdrawDividendsSpecific(address owner, uint256[] memory ids)
        external
    {
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "User is not authorized to withdraw for address"
        );
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            dividendsOwed +=
                (ownerTimeShares[owner][id] *
                    (pastHolderDividends[id] -
                        pastHolderLastDividends[id][owner])) /
                A_BIG_NUMBER;
            pastHolderLastDividends[id][owner] = pastHolderDividends[id];
        }
        claimedDividends[owner] += dividendsOwed;
        saleToken.transfer(owner, dividendsOwed);
        emit DividendsClaimed(owner, dividendsOwed);
        totalUnclaimedDividends -= dividendsOwed;
    }

    function withdrawDividends(address owner) external {
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "User is not authorized to withdraw for address"
        );
        uint256 dividendsOwed = 0;
        for (uint256 i = 0; i < tokensHeld[owner].length; i++) {
            uint256 id = tokensHeld[owner][i];
            dividendsOwed +=
                (ownerTimeShares[owner][id] *
                    (pastHolderDividends[id] -
                        pastHolderLastDividends[id][owner])) /
                A_BIG_NUMBER;
            pastHolderLastDividends[id][owner] = pastHolderDividends[id];
        }
        claimedDividends[owner] += dividendsOwed;
        saleToken.transfer(owner, dividendsOwed);
        emit DividendsClaimed(owner, dividendsOwed);
        totalUnclaimedDividends -= dividendsOwed;
    }

    function setReferrers(address[] memory referrers, bool[] memory referrerApproved) external onlyDons {
        for(uint i = 0; i < referrers.length; i++) {
            isLegitReferrer[referrers[i]] = referrerApproved[i];
        }
    }

    function bouncePricePercentile(uint256 percentile)
        external
        view
        returns (uint256)
    {
        require(
            percentile <= 100 && percentile >= 0,
            "Invalid percentile: 0 <= percentile <= 100 must be true"
        );
        uint256 numLeft = (totalNumBounces * percentile) / 100;
        uint8 index = 0;
        uint256 bouncePrice;
        while (numLeft > 0) {
            bouncePrice = bouncePrices[index];
            if(numLeft < tokensAtPrice[bouncePrice]) return bouncePrice;
            numLeft -= tokensAtPrice[bouncePrice];
            index++;
        }
        return bouncePrice;
    }
}
