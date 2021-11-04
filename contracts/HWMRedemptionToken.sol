// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract HWMRedemptionToken is Context, ERC1155 {
    address public dons;
    address private team;
    uint256 public growthRate = 15;
    uint256 public initialPrice = 1000000;
    uint256 public A_BIG_NUMBER = 10e60;
    IERC20 public saleToken;

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
    mapping(uint256 => uint256) public bouncesAtPrice;
    // Token Id => Whether the token is an angel or not
    // mapping(uint256 => bool) public isAngel;
    // address public assigner;

    bool public bouncing = false;
    mapping(address => uint256) public claimedDividends;
    uint256 public totalDividends;

    event Bounced(uint256 tokenId, address from, address to, uint256 price);

    event Here(
        uint256 a,
        uint256 b,
        uint256 c,
        uint256 x,
        uint256 y,
        uint256 z
    );

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor(
        string memory uri,
        IERC20 _saleToken,
        address _team
    ) ERC1155(uri) {
        saleToken = _saleToken;
        dons = _msgSender();
        team = _team;
    }

    function changeDons(address newDons) external {
        require(_msgSender() == dons, "Only dons can change dons");
        dons = newDons;
    }

    function changeTeam(address newTeam) external {
        require(_msgSender() == dons, "Only dons can change dons");
        team = newTeam;
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external virtual {
        require(_msgSender() == dons, "Only dons can mint tokens");
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external virtual {
        require(_msgSender() == dons, "Only dons can mint tokens");
        _mintBatch(to, ids, amounts, data);
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
                if (id > 1500) {
                    lastBounceTime[id] = block.timestamp;
                }
                ownerOf[id] = to;
            }
        } else {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 id = ids[i];
                ownerOf[id] = to;
                if (id > 1500) {
                    require(bouncing, "Can only bounce gaseous tokens");
                    emit Bounced(id, from, to, lastBouncePrice[id]);
                    lastBounceTime[id] = block.timestamp;
                }
            }
            if (bouncing) {
                bouncing = false;
            }
        }
    }

    function bounce(uint256 id, address newOwner) external {
        require(id > 1500, "Token is not gaseuous");
        address owner = ownerOf[id];
        require(owner != address(0), "Token has not been minted");
        uint8 numBouncesForToken = numBounces[id];
        if (numBouncesForToken != 0) {
            // Transfer owner their past dividends so their new shares only count going forward
            if (ownerTimeShares[owner][id] > 0) {
                uint256 ownerPastDividendsOwed = (ownerTimeShares[owner][id] *
                        (pastHolderDividends[id] -
                            pastHolderLastDividends[id][owner])) / A_BIG_NUMBER;
                saleToken.transfer(
                    owner,
                    ownerPastDividendsOwed
                );
                claimedDividends[owner] += ownerPastDividendsOwed;
                pastHolderLastDividends[id][owner] = pastHolderDividends[id];
            }
            // Give owner the price they paid plus half of the 30% premium
            // Give the dons 50% of the premium
            // Give the past owners 20% of the premium
            uint256 price = (lastBouncePrice[id] * growthRate) / 10;
            uint256 lastPrice = lastBouncePrice[id];
            lastBouncePrice[id] = price;
            uint256 tenthOfIncrease = (price - lastPrice) / 10;
            saleToken.transferFrom(
                msg.sender,
                owner,
                lastPrice + 3 * tenthOfIncrease
            );
            saleToken.transferFrom(
                msg.sender,
                address(this),
                2 * tenthOfIncrease
            );
            totalDividends += 2 * tenthOfIncrease;
            saleToken.transferFrom(msg.sender, team, 5 * tenthOfIncrease);
            // Update total dividends
            pastHolderDividends[id] +=
                (2 * A_BIG_NUMBER * tenthOfIncrease) /
                (block.timestamp - timeOfFirstBounce[id]);
            // Update owners shares
            ownerTimeShares[owner][id] += block.timestamp - lastBounceTime[id];
            if (bouncesAtPrice[price] == 0) {
                bouncePrices.push(price);
            }
            bouncesAtPrice[price]++;
        } else {
            // If first sale, give the owner the initial price

            lastBouncePrice[id] = initialPrice;
            saleToken.transferFrom(msg.sender, owner, initialPrice);
            if (bouncesAtPrice[initialPrice] == 0) {
                bouncePrices.push(initialPrice);
            }
            bouncesAtPrice[initialPrice]++;
            timeOfFirstBounce[id] = block.timestamp;
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
        }

        numBounces[id]++;
        // New owner cannot have share in past dividendss
        pastHolderLastDividends[id][newOwner] = pastHolderDividends[id];
        bouncing = true;
        _safeTransferFrom(owner, newOwner, id, 1, "");
    }

    function dividends(address owner, uint256[] memory ids)
        public
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

    function dividends(address owner) public view returns (uint256) {
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

    function withdrawDividends(address owner, uint256[] memory ids) external {
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
        saleToken.transferFrom(address(this), owner, dividendsOwed);
        claimedDividends[owner] += dividendsOwed;
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
        saleToken.transferFrom(address(this), owner, dividendsOwed);
        claimedDividends[owner] += dividendsOwed;
    }
}
