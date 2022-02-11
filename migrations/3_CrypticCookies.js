const CrypticCookies = artifacts.require("CrypticCookies");
const fortunes = require('../fortunes.js');
const Secrets = require("../.secret.js");

module.exports = function(deployer) {

    //Payment Splitter contract address
    let pmgrAddr = "0x89057B0BaC239A79AD1e6CA18306e10eb5DDe001"; // develop
    //let pmgrAddr = ""; // testnet
    //let pmgrAddr = ""; // mainnet

    //deploy the automat contract
    deployer.deploy(CrypticCookies)
    .then(async (CrypticCookies) => {
        
        //setup the payment manager
        CrypticCookies.setPaymentMGR(pmgrAddr);

        //add entropy
        let r = 0;
        let s = 0;
        for(var i = 0; i < 100; i++){
            r = parseInt(Math.random() * 10000);
            s = parseInt(Math.random() * 10000);
            await CrypticCookies.addEntropy(r,s);
        }
        
        //add fortunes
        for(var i = 0; i < fortunes.length; i++){
            await CrypticCookies.addFortune(fortunes[i]);
        }

        //the jackpot index starts at zero, 
        //randomize its setting
        await CrypticCookies.updateJackpotIndex(
            parseInt(Math.random() * 100000),
            parseInt(Math.random() * 100000),
            parseInt(Math.random() * 100000)
        );

    });

};
