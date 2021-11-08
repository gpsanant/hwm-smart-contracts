// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

interface Holy {
    struct Angel {
        bytes32 genome;
        uint8 generation;
        uint256 angelParent;
        uint256 devilParent;
        uint256 breedingCooldown;
        uint256 numChildren;
        uint256 approvedDevilIdToBreed;
        uint256 setApprovedToBreedCooldown;
    }

    struct Devil {
        bytes32 genome;
        uint8 generation;
        uint256 angelParent;
        uint256 devilParent;
        uint256 breedingCooldown;
        uint256 numChildren;
        uint104 shares;
        uint256 matingWith;
        uint256[] devilLineage;
    }
}