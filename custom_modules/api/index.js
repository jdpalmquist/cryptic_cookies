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
let automat_abi = null;
let automat_net = null;
//
//
//
let payment_abi = null;
let payment_net = null;
//
//
//
function readAutomatABI(path){
    let automat_abi_path = './build/contracts/Automat.json'; //path is relative to the server.js file
    Fs.readFile(automat_abi_path, (err, data) => {
        if (err) throw err;
        let json = data.toString();
        json = JSON.parse(json);
        automat_abi = json.abi;
        automat_net = json.networks;
        console.log("Loaded the Automat Contract ABI");
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
readAutomatABI();
readPaymentABI();
//
//
//
function get_automat_abi(req, res, next){
    //console.log('user called /abi/automat');
    res.json(automat_abi);
}
//
//
//
function get_automat_net(req, res, next){
    //console.log('user called /net/automat');
    res.json(automat_net);
}
//
//
//
function get_payment_abi(req, res, next){
    res.send(payment_abi);
}
//
//
//
function get_payment_net(req, res, next){
    res.send(payment_net);
}
//
//
//
module.exports = {
    automat_abi: get_automat_abi,
    automat_net: get_automat_net,
    payment_abi: get_payment_abi,
    payment_net: get_payment_net,
};