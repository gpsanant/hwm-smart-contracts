// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

interface IHWMBreedingFeeSplitter {
    function splitBreedingFee(
        uint256 fee,
        uint256 angelId
    ) external returns (uint256);

    function withdrawDividends(address owner, uint256[] memory ids) external;

    function setChildId(uint256 id, uint256 angelParentId, uint256 childIndex, bool isDevil) external;
}
