// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";


contract HWMAssigner is VRFConsumerBase {
    mapping(uint256 => bool) public alreadyAssigned;
    mapping(uint256 => bool) public isAngel;
    mapping(bytes32 => uint256) public requestIdToTokenId;

    bytes32 internal keyHash;
    uint256 internal fee;

    constructor(
        address linkToken,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _fee
    )
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        keyHash = _keyHash; //0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = _fee; //0.0001 * 10**18;
    }

    function assign(uint256[] memory ids) external {
        for(uint i = 0; i < ids.length; i++){
            uint256 id = ids[i];
            require(!alreadyAssigned[id], "This token has already been assigned");
            requestIdToTokenId[requestRandomness(keyHash, fee)] = id;
        }
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        alreadyAssigned[requestIdToTokenId[requestId]] = true;
        isAngel[requestIdToTokenId[requestId]] = (randomness % 3) == 0;
    }

}
