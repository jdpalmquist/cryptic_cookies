const PaymentMGR = artifacts.require("PaymentMGR");
const Secrets = require("../.secret.js");

module.exports = function(deployer) {

    //deploy the payment manager first
    deployer.deploy(PaymentMGR, Secrets.payees, Secrets.shares);

};