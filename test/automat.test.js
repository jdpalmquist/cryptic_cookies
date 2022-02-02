const assert = require('assert');
const truffleAssert = require('truffle-assertions');

const ATMT = artifacts.require('Automat');

/*
const ErrorType = {
  REVERT: "revert",
  INVALID_OPCODE: "invalid opcode",
  OUT_OF_GAS: "out of gas",
  INVALID_JUMP: "invalid JUMP"
};
*/

contract('Automat', (accounts) => {
  //
  it("should deploy the Automat contract", async () => {
    let automat = await ATMT.deployed();
    let address = await automat.addr();
    let flag = false;
    if(address != "" && typeof address != 'undefined'){
      flag = true;
    }
    assert.equal(flag, true, "the Automat contract did not deploy correctly");
  });

  it("should fail to execute setPaymentMGR() when a non-admin calls it", async () =>{
    let auto = await ATMT.deployed();

    let fakePMGRAddr = accounts[9];

    await truffleAssert.fails(
      auto.setPaymentMGR(fakePMGRAddr, {from: accounts[1]}),
      truffleAssert.ErrorType.REVERT
    );
  });

  //TODO: test setting the PaymentMGR pointer to a new contract!

  it("should fail to execute setPrice() when called by non-admin", async () =>{
    let auto = await ATMT.deployed();
    let fakePrice = web3.utils.toWei('0.00001', 'ether');
    let fakeOwner = accounts[5];
    await truffleAssert.fails(
      auto.setPrice(fakePrice, {from: fakeOwner}),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should fail to execute addFortune() when called by non-admin", async () => {
    let auto = await ATMT.deployed();
    let fakeFortune = "fake new fortune";
    let fakeOwner = accounts[5];
    await truffleAssert.fails(
      auto.addFortune(fakeFortune, {from: fakeOwner}),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should fail to execute addEntropy() when called by non-admin", async () => {
    let auto = await ATMT.deployed();
    let r1 = parseInt(Math.random() * 100000);
    let r2 = parseInt(Math.random() * 100000);
    let fakeOwner = accounts[5];

    await truffleAssert.fails(
      auto.addEntropy(r1, r2, {from: fakeOwner}),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("should fail to execute updateJackpotIndex() when called by non-admin", async () => {
    let auto = await ATMT.deployed();
    let r1 = parseInt(Math.random() * 100000);
    let r2 = parseInt(Math.random() * 100000);
    let r3 = parseInt(Math.random() * 100000);
    let fakeOwner = accounts[5];

    await truffleAssert.fails(
      auto.updateJackpotIndex(r1, r2, r3, {from: fakeOwner}),
      truffleAssert.ErrorType.REVERT
    );
  });



  it("should be able to change the price", async () =>{
    let auto = await ATMT.deployed();
    let price = await auto._price();
    let _price = '1000000000000000000';
    assert.equal(price.toString(), _price, "the starting price was incorrect");
    

    let newPrice = '10';
    let result = await auto.setPrice(newPrice);
    truffleAssert.eventEmitted(result, 'UpdatePrice', (ev) => {
        return ev.oldPrice.toString() == _price && ev.newPrice.toString() == newPrice
    }, "Contract should return the correct 'UpdatePrice' message.");

    result = await auto.setPrice(_price);
    truffleAssert.eventEmitted(result, 'UpdatePrice', (ev) => {
        return ev.oldPrice.toString() == '10' && ev.newPrice.toString() == _price
    }, "Contract should return the correct 'UpdatePrice' message.");
  });


  it("should be able to add a new fortune", async () => {
    let auto = await ATMT.deployed();
    let totalFortunes = await auto.totalFortunes();
    let numFortunes = parseInt(totalFortunes) + 1;

    let newFortune = "test fortune";
    let result = await auto.addFortune(newFortune);
    truffleAssert.eventEmitted(result, 'FortuneAdded', (ev) => {
      return ev.timestamp.toString() != ""
    }, "Contract should return the correct 'FortuneAdded' message.");
  });

  it("should be able to add entropy", async () => {
    let auto = await ATMT.deployed();

    let nonce1 = parseInt(Math.random() * 100000);
    let incre1 = parseInt(Math.random() * 100000);

    let result = await auto.addEntropy(nonce1, incre1);
    truffleAssert.eventEmitted(result, 'EntropyAdded', (ev) => {
      return ev.timestamp.toString() != ''
    }, "Contract should return the correct 'EntropyAdded' message.");
  });

  it("should be able to force a new Lucky Number", async () => {
    let auto = await ATMT.deployed();

    let r1 = parseInt(Math.random() * 100000);
    let r2 = parseInt(Math.random() * 100000);
    let r3 = parseInt(Math.random() * 100000);

    let result = await auto.updateJackpotIndex(r1, r2, r3);
    truffleAssert.eventEmitted(result, 'UpdateJackpotIndex', (ev) =>{
      return ev.newIndex.toString() != ''
    }, "Contract should return the correct 'UpdateJackpotIndex' message.");
  });

  it("should fail to buy cookie when underfunded", async () => {
    let auto = await ATMT.deployed();
    let val = web3.utils.toWei('0.0001', 'ether');

    await truffleAssert.fails(
        auto.buyCookie({from: accounts[1], value: val}),
        truffleAssert.ErrorType.REVERT
    );
  });


  it("should be able to buy a cookie", async () => {
    let auto = await ATMT.deployed();

    //let _price = '1000000000000000000';
    let val = web3.utils.toWei('1', 'ether');

    await truffleAssert.passes(
      auto.buyCookie({from: accounts[1], value: val})
    );
  });

  it("should be able to fetch the fortune cookie message", async () => {
    let auto = await ATMT.deployed();
    let index = 1;

    let result = await auto.getFortune(index);
    let flag = false;
    if(result != ""){
      flag = true;
    }

    assert.equal(flag, true, "failed to fetch the fortune message");    
  });

});