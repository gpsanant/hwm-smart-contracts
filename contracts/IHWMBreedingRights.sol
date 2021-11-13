// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Context.sol";

interface IHWMBreedingRights is IERC1155 {    

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;
    function resetBreedingRights(uint256 id) external;
}
