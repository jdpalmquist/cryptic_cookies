//SPDX-License-Identifier: 0BSD
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract PaymentMGR is PaymentSplitter {

    constructor(address[] memory payees, uint256[] memory shares_) PaymentSplitter(payees,shares_) {}

    function addrPaymentMGR() external view returns (address) {
        return address(this);
    }


}