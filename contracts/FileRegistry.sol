pragma solidity ^0.8.20;

contract FileRegistry {

    mapping(address => string[]) private userFiles;

    function storeFile(string memory cid) public {
        userFiles[msg.sender].push(cid);
    }

    function getUserFiles(address user) public view returns (string[] memory) {
        return userFiles[user];
    }
}