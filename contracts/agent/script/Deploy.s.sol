// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Agent} from "../src/Agent.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {


        uint256 deployerPrivkey = vm.envUint("DEPLOYER_PRIV_KEY");
        string memory baseUrl = vm.envString("BASE_URL");

        vm.startBroadcast(deployerPrivkey);
        Agent agent = new Agent();
        agent.setBaseURI(baseUrl);
        vm.stopBroadcast();
        console.log("Agent deployed at");
        console.log(address(agent));
        console.log("Base URI set to");
        console.log(agent.baseTokenURI());
    }
}
