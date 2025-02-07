// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AgentNFT} from "../src/AgentNFT.sol";


contract Deploy is Script {

    function run() external {
        console.log("Deploying Agent NFT");
 
        vm.startBroadcast();
        AgentNFT agentNFT = new AgentNFT();
        vm.stopBroadcast();
    }
}

//forge script ./script/Deploy.s.sol --sig "run()"    --broadcast --rpc-url --private-key 
//forge script ./script/Deploy.s.sol \
//   --rpc-url \
//   --private-key  \
//   --broadcast \
//   --verify \
//   --verifier blockscout \
//   --verifier-url https://base-sepolia.blockscout.com/api/

