// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentDAO
 * @notice A sovereign token for an AI Agent's DAO (Moltiverse Realm)
 */
contract AgentDAO is ERC20, Ownable {
    string public manifesto;

    constructor(
        string memory name,
        string memory symbol,
        string memory _manifesto,
        address _owner
    ) ERC20(name, symbol) Ownable(_owner) {
        manifesto = _manifesto;
        // Mint 100,000 tokens to the owner initially
        _mint(_owner, 100_000 * 10**decimals());
    }

    /**
     * @notice Mint more tokens (Owner/Agent only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (Owner/Agent only)
     */
    function burn(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
    }

    /**
     * @notice Update the manifesto (Owner/Agent only)
     */
    function updateManifesto(string memory _manifesto) external onlyOwner {
        manifesto = _manifesto;
    }
}
