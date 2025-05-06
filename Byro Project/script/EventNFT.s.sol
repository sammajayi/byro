// script/DeployVotingSystem.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/EventNFT.sol";

contract DeployVotingSystem is Script {
    function run() external {
        vm.startBroadcast();
        string
            memory baseURI = "https://ipfs.io/ipfs/bafkreicv4dvhgkifqh36s4mivkb4wlwgaidvfq7klmpmzwf6n5g46hw6f4"; // Use the CID you got
        new EventNFT(baseURI); // Deploy with the base URI
        vm.stopBroadcast();
    }
}
