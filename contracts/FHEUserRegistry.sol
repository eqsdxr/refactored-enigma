// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint256, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title An contract that is used in Zauth for handing users' social media info
contract FHEUserRegistry is SepoliaConfig {

    mapping(address => euint256) users;

    /// @notice Return a number containing data about connected services and social media to a given address
    function getUserSocialMediaIndicator(address inputAddr) external view returns (euint256) {
        return users[inputAddr];
    }

    /// @notice Add new address and related info or overwrite old ones
    function registerUser(address inputAddr, externalEuint256 externalInputValue, bytes calldata inputProof) external {
        require(inputAddr == msg.sender, "not your address");
        euint256 encryptedInputValue = FHE.fromExternal(externalInputValue, inputProof);

        FHE.allowThis(encryptedInputValue);
        FHE.allow(encryptedInputValue, inputAddr);

        users[inputAddr] = encryptedInputValue;
    }
}
