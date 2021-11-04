// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./HolyWaterMafia.sol";

contract HWMMatingAuction is
    ERC1155Holder,
    ReentrancyGuard
{
    using ECDSA for bytes32;
    using Address for address payable;
    HolyWaterMafia hwm;
    IERC20 TOKEN;
    mapping(uint256 => bool) public nonceIsUsed;
    event Recovered(address recovered);
    event Number(uint256 number);

    constructor(HolyWaterMafia _hwm, IERC20 _token) {
        hwm = _hwm;
        TOKEN = _token;
    }

    function fixedPriceMating(
        uint256 angelId,
        uint256 devilId,
        uint256 price,
        uint256 expiry,
        uint256 nonce,
        bytes memory signature
    ) external payable nonReentrant {
        require(
            nonceIsUsed[nonce] == false,
            "Order has already been executed"
        );
        require(block.timestamp < expiry, "Expiry time has passed");
        address angelOwner = keccak256(
            abi.encodePacked(
                angelId,
                price,
                expiry,
                nonce
            )
        ).toEthSignedMessageHash().recover(signature);
        hwm.setApprovedToBreed(angelOwner, devilId, angelId);
        hwm.breed(msg.sender, devilId, angelId);
        TOKEN.transferFrom(msg.sender, angelOwner, price);
        nonceIsUsed[nonce] = true;
    }

    function dutchAuctionMating(
        uint256 angelId,
        uint256 devilId,
        uint256 startPrice,
        uint256 endPrice,
        uint256 startTime,
        uint256 endTime,
        uint256 nonce,
        bytes memory signature
    ) external payable nonReentrant {
        require(
            nonceIsUsed[nonce] == false,
            "Order has already been executed"
        );
        require(block.timestamp < endTime && block.timestamp > startTime, "Not in valid time range");
        address angelOwner = keccak256(
            abi.encodePacked(
                angelId,
                startPrice,
                endPrice,
                startTime,
                endTime,
                nonce
            )
        ).toEthSignedMessageHash().recover(signature);
        hwm.setApprovedToBreed(angelOwner, devilId, angelId);
        hwm.breed(msg.sender, devilId, angelId);
        TOKEN.transferFrom(msg.sender, angelOwner, startPrice - ((block.timestamp - startTime) * (startPrice - endPrice) / (endTime - startTime)));
        nonceIsUsed[nonce] = true;
    }

    function biddingAuctionMating(
        uint256 angelId,
        uint256 devilId,
        uint256 bid,
        uint256 expiry,
        uint256 nonce,
        bytes memory signature
    ) external payable nonReentrant {
        require(
            nonceIsUsed[nonce] == false,
            "Order has already been executed"
        );
        require(block.timestamp < expiry, "Expiry time has passed");
        address devilOwner = keccak256(
            abi.encodePacked(
                "angelId",
                angelId,
                "devilId",
                devilId,
                "bid",
                bid,
                "expiry",
                expiry,
                "nonce",
                nonce
            )
        ).toEthSignedMessageHash().recover(signature);
        hwm.setApprovedToBreed(msg.sender, devilId, angelId);
        hwm.breed(devilOwner, devilId, angelId);
        TOKEN.transferFrom(msg.sender, msg.sender, bid);
        nonceIsUsed[nonce] = true;
    }
}
