// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "./Holy.sol";

interface IHWMGenetics is Holy {
    function getChild(
        Devil memory devil,
        Angel memory angel,
        uint256 randomness
    )
        external
        payable
        returns (
            bool,
            Angel memory,
            Devil memory,
            bytes32,
            uint8
        );

    function getGen0AngelGenome(uint256 angelId, uint256 randomness) external returns (bytes32);

    function getGen0DevilGenome(uint256 devilId, uint256 randomness) external returns (bytes32);
}
