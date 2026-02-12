// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentDAO.sol";

contract Moltiverse {
    event RealmCreated(address indexed realmAddress, string name, string symbol, address indexed creator);

    struct Realm {
        address realmAddress;
        string name;
        string symbol;
        address creator;
        uint256 createdAt;
    }

    Realm[] public realms;
    mapping(address => bool) public hasRealm;

    function createRealm(string memory name, string memory symbol, string memory manifesto) external returns (address) {
        AgentDAO newRealm = new AgentDAO(name, symbol, manifesto, msg.sender);
        
        realms.push(Realm({
            realmAddress: address(newRealm),
            name: name,
            symbol: symbol,
            creator: msg.sender,
            createdAt: block.timestamp
        }));

        hasRealm[msg.sender] = true;

        emit RealmCreated(address(newRealm), name, symbol, msg.sender);

        return address(newRealm);
    }

    function getRealms() external view returns (Realm[] memory) {
        return realms;
    }

    function getRealmCount() external view returns (uint256) {
        return realms.length;
    }
}
