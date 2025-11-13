// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EUTToken is ERC20, Ownable {
    uint256 public feeBasisPoints = 20; // 0.2% fee (20 basis points)
    address public feeRecipient;

    constructor() ERC20("EUT Token", "EUT") {
        feeRecipient = msg.sender;
        _mint(msg.sender, 1000000000 * 10 ** decimals()); // mint 1B tokens for deployment
    }

    function setFee(uint256 _basisPoints) external onlyOwner {
        require(_basisPoints <= 500, "Fee too high"); // max 5.00%
        feeBasisPoints = _basisPoints;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        if (feeBasisPoints > 0 && feeRecipient != address(0)) {
            uint256 fee = amount * feeBasisPoints / 10000;
            super._transfer(sender, feeRecipient, fee);
            amount -= fee;
        }
        super._transfer(sender, recipient, amount);
    }
}
