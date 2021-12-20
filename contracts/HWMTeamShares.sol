// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HWMTeamShares is ERC1155 {
    mapping(address => uint256[]) private tokensEverHeld;
    mapping(address => mapping(uint256 => bool)) public everHeldToken;
    mapping(address => mapping(uint256 => bool)) public currentlyHoldingToken;
    uint256 public totalRecieved;
    mapping(address => uint256) public amountRecieved;
    uint256 public totalWithdrawn;
    mapping(address => uint256) public amountWithdrawn;
    IERC20 public immutable saleToken;
    uint256 public constant totalShares = 1000;

    constructor(IERC20 _saleToken) public ERC1155("") {
        saleToken = _saleToken;
        _mint(msg.sender, 0, totalShares, "0x");
    }

    function withdraw(
        address holder,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(msg.sender == holder || isApprovedForAll(holder, msg.sender));
        uint256 totalSharesRedeemed;
        uint256 newReceived = saleToken.balanceOf(address(this)) -
            totalRecieved +
            totalWithdrawn;
        uint256 owed;
        if (newReceived > 0) {
            totalRecieved += newReceived;
        }
        //token id is the amount of received saleToken when that token was last withdrawn
        for (uint256 i = 0; i < ids.length; i++) {
            owed += (amounts[i] * (totalRecieved - ids[i])) / totalShares;
            totalSharesRedeemed += amounts[i];
        }
        uint256[] memory newIds = new uint256[](0);
        newIds[0] = totalRecieved;
        uint256[] memory newAmounts = new uint256[](0);
        newAmounts[0] = totalSharesRedeemed;

        _burnBatch(holder, ids, amounts);
        _mintBatch(holder, newIds, newAmounts, "0x");
        saleToken.transfer(holder, owed);
    }

    function currentlyHeldTokens(address holder)
        public
        view
        returns (uint256[] memory)
    {
        uint256 tokenLength = tokensEverHeld[holder].length;
        uint256[] memory currentTokens = new uint256[](0);
        for (uint256 i = 0; i < tokenLength; i++) {
            if (currentlyHoldingToken[holder][tokensEverHeld[holder][i]]) {
                currentTokens[currentTokens.length - 1] = tokensEverHeld[
                    holder
                ][i];
            }
        }
        return currentTokens;
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
            uint256 id = ids[i];
            if (balanceOf(to, id) == 0) {
                if (!currentlyHoldingToken[to][id]) {
                    currentlyHoldingToken[to][id] = true;
                }
                if (!everHeldToken[to][id]) {
                    everHeldToken[to][id] = true;
                    tokensEverHeld[to].push(id);
                }
            }
            if (amounts[i] == balanceOf(from, id)) {
                currentlyHoldingToken[to][id] = false;
            }
        }
    }
}
