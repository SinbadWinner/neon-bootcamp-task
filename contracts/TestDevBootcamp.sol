// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract TestDevBootcamp {
    function getNeonAddress(address addr) public pure returns (bytes memory) {
        return abi.encodePacked(addr);
    }

    function batchExecute(bytes[] calldata instructions, uint64[] calldata seeds) external payable {}
}
