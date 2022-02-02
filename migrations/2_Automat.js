const Automat = artifacts.require("Automat");
const PaymentMGR = artifacts.require("PaymentMGR");

const fortunes = require('../fortunes.js');

module.exports = async function (deployer) {

    // Payment Splitter parameters
    /*
        address[] memory payees_, 
        uint256[] memory shares_
    */
    let payees = [
        //'0x8CC8978425d74E12D4635Fb1EddECD4fC9aFDb4C', // me (must be a metamask style address, NOT a ONE style address)
        //'0x74f75ff98f34da1103a94e6d2dcf33eae6b4be6d', // Nick Perez
        //

        // DEBUG ACCOUNTS
        '0x607F25BF17cF69CEAAcaE1Eb9159c609d451f685', // accounts[0] simulated owner
        '0x793c9c0b141d3e4de6b43aacbad212e33bf40080'  // accounts[9] simulated rewards pool
    ];
    let shares = [
        '75',
        '25'
    ];

    //deploy the payment manager first
    deployer.deploy(PaymentMGR, payees, shares).then(async (PaymentMGR) => {

        //automat constructor parameters
        let pmgrAddr = await PaymentMGR.addrPaymentMGR();

        //deploy the automat contract
        await deployer.deploy(
            Automat, 
            pmgrAddr, 
        ).then(async (automat) => {
            let r = 0;
            let s = 0;
            for(var i = 0; i < 10; i++){
                r = parseInt(Math.random() * 10000);
                s = parseInt(Math.random() * 10000);
                await automat.addEntropy(r,s);
            }
            
            //add fortunes & entropy
            for(var i = 0; i < fortunes.length / 4; i++){
                await automat.addFortune(fortunes[i]);
            }

            //the jackpot index starts at zero, 
            //randomize its setting
            await automat.updateJackpotIndex(
                parseInt(Math.random() * 100000),
                parseInt(Math.random() * 100000),
                parseInt(Math.random() * 100000)
            );

        });
    });

};
