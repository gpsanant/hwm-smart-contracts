// contracts/AngelsAndDevils.sol
// PROPERTY OF BIG BUDDHA LLC. NOT FOR USE OUTSIDE OF THE HOLY WATER MAFIA NFT PROJECT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./HWMRedemptionToken.sol";

contract HWMAssigner is VRFConsumerBase {
    mapping(uint256 => uint8) public species;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    uint256 internal modulus = 1000;
    uint256 internal threshold = 306;
    bytes32 internal keyHash;
    uint256 internal fee;
    event AssignRequest(bytes32 requestId, uint256 id);
    HWMRedemptionToken public redemptionToken;

    constructor(
        address linkToken,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _fee,
        HWMRedemptionToken _redemptionToken
    )
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        keyHash = _keyHash; //0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = _fee; //0.0001 * 10**18;
        redemptionToken = _redemptionToken;
    }

    function assign(uint256[] memory ids) external {
        for(uint i = 0; i < ids.length; i++){
            uint256 id = ids[i];
            require(species[id] == 0, "This token has already been assigned");
            if(id < redemptionToken.numUnbouncableAngels()){
                species[id] = 2;
            } else if (id < redemptionToken.numUnbouncableAngels() + redemptionToken.numUnbouncableDevils()){
                species[id] = 1;
            } else {
                bytes32 requestId = requestRandomness(keyHash, fee);
                requestIdToTokenId[requestId] = id;
                emit AssignRequest(requestId, id);
            }
        }
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        if((randomness % modulus) < threshold){
            species[requestIdToTokenId[requestId]] = 2;
        } else {
            species[requestIdToTokenId[requestId]] = 1;
        }
    }

}
