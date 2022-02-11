//
//
//
// automat.finance API
//
//
//
const Fs = require('fs');
const cfg = require('../cfg/');
//
//
//
let cryptic_abi = null;
let cryptic_net = null;
//
//
//
let payment_abi = null;
let payment_net = null;
//
//
//
function readCrypticABI(){
    let cryptic_abi_path = './build/contracts/CrypticCookies.json'; //path is relative to the server.js file
    Fs.readFile(cryptic_abi_path, (err, data) => {
        if (err) throw err;
        let json = data.toString();
        json = JSON.parse(json);
        cryptic_abi = json.abi;
        cryptic_net = json.networks;
        console.log("Loaded the CrypticCookies Contract ABI");
    });
}
//
//
//
function readPaymentABI(path){
    let payment_abi_path = './build/contracts/PaymentMGR.json';  //path is relative to the server.js file

    Fs.readFile(payment_abi_path, (err, data) => {
        if (err) throw err;
        //console.log(data);
        let json = data.toString();
        json = JSON.parse(json);
        payment_abi = json.abi;
        payment_net = json.networks;

        console.log("Loaded the PaymentMGR ABI");
    });
}
//
//
// Cache the ABI in memory so it doesn't have to be read from disk every time
readCrypticABI();
readPaymentABI();
//
//
//
function get_cryptic_abi(req, res, next){
    //console.log('user called /abi/cryptic');
    res.json(cryptic_abi);
}
//
//
//
function get_cryptic_net(req, res, next){
    //console.log('user called /net/cryptic');
    res.json(cryptic_net);
}
//
//
//
function get_payment_abi(req, res, next){
    res.json(payment_abi);
}
//
//
//
function get_payment_net(req, res, next){
    res.json(payment_net);
}
//
//
//
module.exports = {
    cryptic_abi: get_cryptic_abi,
    cryptic_net: get_cryptic_net,
    payment_abi: get_payment_abi,
    payment_net: get_payment_net,
};