// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "./IHWMGenetics.sol";

contract HWMGeneticsZeroGenome is IHWMGenetics {
    uint256[] private breedingCooldowns = [
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
    event Genome(bytes32 genome);
    event Allele(uint16 allele);
    
    constructor() {}

    function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
        }
        return expandedValues;
    }

    function getChild(
        Devil memory devil,
        Angel memory angel,
        uint256 randomness
    ) external override payable virtual returns(bool, Angel memory, Devil memory, bytes32, uint8){
        require(
            block.timestamp > devil.breedingCooldown,
            "You must wait until the cooldown time is reached to breed the devil"
        );
        require(
            block.timestamp > angel.breedingCooldown,
            "You must wait until the cooldown time is reached to breed the angel"
        );
        uint8 generation;
        if (angel.generation < devil.generation) {
            generation = devil.generation + 1;
        } else {
            generation = angel.generation + 1;
        }
        require(generation < 67, "Parents are max generation");
        
        Angel memory newAngelParent = angel;
        Devil memory newDevilParent = devil;

        newAngelParent.approvedDevilIdToBreed = 0;
        newAngelParent.numChildren += 1;
        newAngelParent.setApprovedToBreedCooldown = 0;
        newAngelParent.breedingCooldown = 0;
        newDevilParent.numChildren += 1;
        newDevilParent.breedingCooldown = 0;
        uint256[] memory randomNumbers = expand(randomness, 3);
        if (
            uint8(
                randomNumbers[0]
            ) < 13
        ) {
            bytes32 angelChildGenome = getAngelChildGenome(
                devil.genome,
                angel.genome,
                randomNumbers[1],
                randomNumbers[2]
            );
            return (true, newAngelParent, newDevilParent, angelChildGenome, generation);
        } else {
            bytes32 devilChildGenome = getDevilChildGenome(
                devil.genome,
                angel.genome,
                randomNumbers[1],
                randomNumbers[2]
            );
            // emit Genome(devilChildGenome);
            return (false, newAngelParent, newDevilParent, devilChildGenome, generation);
        }
    }

    function getGen0DevilGenome(uint256 devilId, uint256 randomness) public override virtual returns (bytes32) {
        uint256[] memory randomNumbers = expand(randomness, 4);
        bytes memory genomeBytes = 
            abi.encodePacked(
                getGenesFromRandomness(randomNumbers[0]),
                getGenesFromRandomness(randomNumbers[1]),
                getGenesFromRandomness(randomNumbers[2]),
                getGenesFromRandomness(randomNumbers[3])
            );
        bytes32 genome;
        assembly {
            genome := mload(add(genomeBytes, 0x20))
        }
        return genome;
    }

    function getGenesFromRandomness(uint256 randomness)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory genes = abi.encodePacked(
            getGeneFromSeeds(
                uint16(randomness),
                uint16(randomness >> 16),
                uint16(randomness >> 32),
                uint16(randomness >> 48)
            ),
            getGeneFromSeeds(
                uint16(randomness >> 64),
                uint16(randomness >> 80),
                uint16(randomness >> 96),
                uint16(randomness >> 112)
            ),
            getGeneFromSeeds(
                uint16(randomness >> 128),
                uint16(randomness >> 144),
                uint16(randomness >> 160),
                uint16(randomness >> 176)
            ),
            getGeneFromSeeds(
                uint16(randomness >> 192),
                uint16(randomness >> 208),
                uint16(randomness >> 224),
                uint16(randomness >> 240)
            )
        );
        return genes;
    }

    function getGeneFromSeeds(
        uint16 alleleSeed1,
        uint16 alleleSeed2,
        uint16 alleleSeed3,
        uint16 alleleSeed4
    ) internal pure returns (uint16) {
        uint16 allele = getGeneIndexFromSeed(alleleSeed1) |
            (getGeneIndexFromSeed(alleleSeed2) << 4) |
            (getGeneIndexFromSeed(alleleSeed3) << 8) |
            (getGeneIndexFromSeed(alleleSeed4) << 12);

        return allele;
    }

    function getGeneIndexFromSeed(uint16 alleleSeed)
        internal
        pure
        returns (uint16)
    {
        if (alleleSeed < 16384) {
            return 0;
        } else if (alleleSeed < 29491) {
            return 1;
        } else if (alleleSeed < 39321) {
            return 2;
        } else if (alleleSeed < 47185) {
            return 3;
        } else if (alleleSeed < 53673) {
            return 4;
        } else if (alleleSeed < 58915) {
            return 5;
        } else if (alleleSeed < 62191) {
            return 6;
        } else if (alleleSeed < 64157) {
            return 7;
        } else if (alleleSeed < 65533) {
            return 8;
        } else {
            return 9;
        }
    }

    function getGen0AngelGenome(uint256 angelId, uint256 randomness) public override virtual returns (bytes32) {
        return getGen0DevilGenome(angelId, randomness);
    }

    function getAllelesFromGenome(bytes32 genome)
        internal
        pure
        returns (uint8[64] memory)
    {
        uint8[64] memory alleles;
        for (uint256 i = 0; i < 32; i++) {
            uint8 twoAlleles = uint8(uint256(genome) >> (8 * i));
            alleles[2 * i] = twoAlleles & 0xF;
            alleles[2 * i + 1] = twoAlleles >> 4;
        }
        return alleles;
    }

    function getGenomeFromAlleles(uint8[64] memory alleles)
        public
        pure
        returns (bytes32)
    {
        uint256 genomeInt;
        for (uint256 i = 0; i < 64; i++) {
            genomeInt = genomeInt | (uint256(alleles[i]) << (4 * i));
        }
        return bytes32(genomeInt);
    }

    function getDevilChildGenome(bytes32 devilGenome, bytes32 angelGenome, uint256 randomnessForSwaps, uint256 randomnessForInheritanceAndMutations)
        public
        returns (bytes32)
    {
                return bytes32(0x0000000000000000000000000000000000000000000000000000000000000000);
    }

    function getAngelChildGenome(bytes32 devilGenome, bytes32 angelGenome, uint256 randomnessForSwaps, uint256 randomnessForInheritanceAndMutations)
        public
        returns (bytes32)
    {
        return bytes32(0x0000000000000000000000000000000000000000000000000000000000000000);
    }
}
