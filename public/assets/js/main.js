/*
    Main.js
*/

//Global Variables
let accounts = null;
let currentAccount = null;
let chain_id = null;
let chain_name = null;
let chain_currency = null;
let web3 = null;
let isWeb3Available = false;
let contract = null;
let Artifacts = {
    Automat: {
        abi: null,
        net: null,
    }
};
let ContractVals = {
    _owner: '',
    _address: '',
    _version: '',
    _balance: '',
    _jackpot: '',
    _price: '',
    _numNonces: '', // also # of incrementals
    _numFortunes: '',
    _jackpotIndex: '',
    _totalSold: '',
    _numWinners: '',
};

async function connectWallet(){

    let e = null;

    set_ui_pending();

    //check to see if a provider has been injected into the window
    if(window.ethereum){

        accounts = await window.ethereum.request({method: 'eth_requestAccounts'});

        //disable the "connect wallet" button while doing this processing
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log('Wallet is locked or you need to connect an account');
            //request failed reset back to pre-connect status
            set_ui_unconnected();
        }
        else{
            console.log("Wallet Connected");

            //instantiate web3
            web3 = new Web3(window.ethereum);

            isWeb3Available = true;

            //get the chain ID the wallet is connected to
            await getChainId();

            if( typeof Artifacts.Automat.net[chain_id] != 'undefined' &&
                Artifacts.Automat.net[chain_id] != null){

                //instantiate a contract instance
                contract = new web3.eth.Contract(
                    Artifacts.Automat.abi,
                    Artifacts.Automat.net[chain_id].address
                );
                
                set_ui_connected();

                getContractVals();

            }
            else {
                console.log("Wallet connected to an unsupported blockchain: " + chain_name);
                alert("Wallet is connected to an unsupported blockchain:\n" + chain_name);
                set_ui_unconnected();
            }
        }
    }
    else{
        alert("No wallet detected");
        set_ui_unconnected();
    }
}

async function getChainId(){
    //NOTE: this function asks the wallet which network it's connected to
    if(window.ethereum){
        chain_id = await window.ethereum.request({ method: 'eth_chainId' });
        chain_id = web3.utils.hexToNumberString(chain_id);

        switch(chain_id){
            case "1337":
                console.log('DEBUG: Wallet connected to local dev chain');
                
                //this is the dev chain, and for "reasons" the dev chain uses "5777" internally
                //but reports "1337" which is the ethereum localhost default on metamask
                chain_id = 5777; //local truffle-ganache chain_id
                chain_name = "Local Dev Blockchain"
                chain_currency = "$DEV";
            break;

            case "1666700000":
                console.log('DEBUG: Wallet connected to Harmony Testnet chain, shard 0');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Testnet Shard 0";
                chain_currency = "$ONE";
            break;

            case "1666700001":
                console.log('DEBUG: Wallet connected to Harmony Testnet chain, shard 1');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Testnet Shard 1";
                chain_currency = "$ONE";
            break;

            case "1666700002":
                console.log('DEBUG: Wallet connected to Harmony Testnet chain, shard 2');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Testnet Shard 2";
                chain_currency = "$ONE";
            break;

            case "1666700003":
                console.log('DEBUG: Wallet connected to Harmony Testnet chain, shard 3');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Testnet Shard 3";
                chain_currency = "$ONE";
            break;

            case "1666600000":
                console.log('DEBUG: Wallet connected to Harmony Mainnet chain, shard 0');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Mainnet Shard 0";
                chain_currency = "$ONE";
            break;

            case "1666600001":
                console.log('DEBUG: Wallet connected to Harmony Mainnet chain, shard 1');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Mainnet Shard 1";
                chain_currency = "$ONE";
            break;

            case "1666600002":
                console.log('DEBUG: Wallet connected to Harmony Mainnet chain, shard 2');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Mainnet Shard 2";
                chain_currency = "$ONE";
            break;

            case "1666600003":
                console.log('DEBUG: Wallet connected to Harmony Mainnet chain, shard 3');
                //parse it as an integer so it can be used in the networks abi
                chain_id = parseInt(chain_id);
                chain_name = "Harmony Mainnet Shard 3";
                chain_currency = "$ONE";
            break;            

            default:
                alert('DEBUG: unsupported blockchain, chain ID == ' + chain_id);
                chain_id = -1;
                chain_name = '';
                chain_currency = "$VOID";
            break;
        }

        var e = document.querySelector("#contract-network");
        e.innerHTML = chain_name;
    }
    else{
        alert("No wallet detected");
    }
}

async function getContractVals(){
    //fetch values from the contract
    await getAddr();
    await getOwner();
    await getPrice();
    await getJackpot();
    await getLuckyNumber();
    await getTotalNonces();
    await getVersion();
    await getBalance();
    await getTotalSold();
    await getTotalWinners();
    await getTotalFortunes();
}

async function getAddr(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._address = await contract.methods.addr().call();
        //update the UI
        set_address(ContractVals._address);
    }
}

async function getOwner(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._owner = await contract.methods.owner().call();
        //update the UI
        set_owner(ContractVals._owner);
    }
}

async function getPrice(){
    if(isWeb3Available === true){
        //fetch the current price from the contract
        ContractVals._price = await contract.methods._price().call();
        //convert the price from wei to human readable token values
        ContractVals._price = parseFloat(web3.utils.fromWei(ContractVals._price));
        //trim the decimals
        ContractVals._price = ContractVals._price.toFixed(2);
        //update the UI
        set_price(ContractVals._price);
    }
}

async function getJackpot(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._jackpot = await contract.methods.jackpot().call();
        //convert the value from wei to human readable token values
        ContractVals._jackpot = parseFloat(web3.utils.fromWei(ContractVals._jackpot));
        //trim the decimals
        ContractVals._jackpot = ContractVals._jackpot.toFixed(2);
        //update the UI
        set_jackpot(ContractVals._jackpot);
    }
}

async function getLuckyNumber(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._jackpotIndex = await contract.methods.jackpotIndex().call();
        //convert to an integer (no decimals allowed)
        ContractVals._jackpotIndex = parseInt(ContractVals._jackpotIndex);
        //update the UI
        set_luckynum(ContractVals._jackpotIndex);
    }
}

async function getTotalNonces(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._numNonces = await contract.methods.totalNonces().call();
        //convert to an integer (no decimals allowed)
        ContractVals._numNonces = parseInt(ContractVals._numNonces);
        //update the UI
        set_nonces(ContractVals._numNonces);
    }
}

async function getVersion(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._version = await contract.methods.versionNum().call();
        //convert to an integer (no decimals allowed)
        ContractVals._version = parseInt(ContractVals._version);
        //update the UI
        set_version(ContractVals._version);
    }
}

async function getBalance(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._balance = await contract.methods.balance().call();
        //convert to an integer (no decimals allowed)
        ContractVals._balance = parseFloat(web3.utils.fromWei(ContractVals._balance));
        //trim the decimals
        ContractVals._balance = ContractVals._balance.toFixed(2);
        //update the UI
        set_balance(ContractVals._balance);
    }
}

async function getTotalSold(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._totalSold = await contract.methods.totalSold().call();
        //convert to an integer (no decimals allowed)
        ContractVals._totalSold = parseInt(ContractVals._totalSold);
        //update the UI
        set_total_sold(ContractVals._totalSold);
    }
}

async function getTotalWinners(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._numWinners = await contract.methods.totalWinners().call();
        //convert to an integer (no decimals allowed)
        ContractVals._numWinners = parseInt(ContractVals._numWinners);
        //update the UI
        set_total_winners(ContractVals._numWinners);
    }
}

async function getTotalFortunes(){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        ContractVals._numFortunes = await contract.methods.totalFortunes().call();
        //convert to an integer (no decimals allowed)
        ContractVals._numFortunes = parseInt(ContractVals._numFortunes);
        //update the UI
        set_total_fortunes(ContractVals._numFortunes);
    }
}

async function getMyFortune(winningIndex, chosenIndex, payout, id){
    if(isWeb3Available === true){
        //fetch the current jackpot from the contract
        var fortuneText = await contract.methods.getFortune(id).call();

        //update the contract vals now
        await getContractVals();

        //plug all the values into the ui
        show_fortune_modal(winningIndex, chosenIndex, payout, fortuneText);
    }
}


async function buyCookie(){
    if(isWeb3Available === true){
        var receipt = await contract
            .methods
                .buyCookie()
                    .send({
                        from: accounts[0],
                        value: web3.utils.toWei(ContractVals._price)
                    });
        
        var winningIndex = parseInt(receipt.events["Generated"].returnValues["winningIndex"]);
        var chosenIndex = parseInt(receipt.events["Generated"].returnValues["chosenIndex"]);
        var payout = parseFloat(
            web3.utils.fromWei(
                receipt
                    .events["Generated"]
                        .returnValues["payout"]
                            .toString()
            )
        ).toFixed(2);

        await getMyFortune(winningIndex, chosenIndex, payout, chosenIndex);
    }
    else{
        alert("Please connect your wallet");
    }
}


/*
    UI functionality
*/
function bind_all(){
    var e = null;

    //connect wallet button
    e = document.querySelector('#wallet-connect-btn');
    e.addEventListener("click", connectWallet);

    //show the game-rules modal (there are 2 diff btns)
    e = document.querySelector('#show-game-rules-btn1');
    e.addEventListener("click", show_game_rules_modal);
    e = document.querySelector('#show-game-rules-btn2');
    e.addEventListener("click", show_game_rules_modal);

    //show the contract modal
    e = document.querySelector("#show-contract-btn");
    e.addEventListener("click", show_contract_modal);

    //close modal window
    e = document.querySelector('#close-modal-btn');
    e.addEventListener("click", function(){toggle_section("#modal")});

    //game rules: expand/contract questions
    e = document.querySelector('#question-what-is-this');
    e.addEventListener("click", function(){
        toggle_section("#answer-what-is-this");
    });

    //game rules: expand/contract questions
    e = document.querySelector('#question-how-do-i-play');
    e.addEventListener("click", function(){
        toggle_section("#answer-how-do-i-play");
    });

    //game rules: expand/contract questions
    e = document.querySelector('#question-what-price');
    e.addEventListener("click", function(){
        toggle_section("#answer-what-price");
    });

    //game rules: expand/contract questions
    e = document.querySelector('#question-what-odds');
    e.addEventListener("click", function(){
        toggle_section("#answer-what-odds");
    });

    //game rules: expand/contract questions
    e = document.querySelector('#question-multiple-winners');
    e.addEventListener("click", function(){
        toggle_section("#answer-multiple-winners");
    });

    //buy cookie button
    e = document.querySelector("#buy-cookie-btn");
    e.addEventListener("click", buyCookie);
}

function set_ui_unconnected(){
    
    //show the pre-connect controls
    e = document.querySelector("#pre-connect-controls");
    e.classList.remove("hidden");
    //show the 
    e = document.querySelector("#wallet-connect-btn");
    e.classList.remove("hidden");
    //hide the disabled pending button
    e = document.querySelector("#wallet-connect-pending");
    e.classList.add("hidden");
    //hide the post-connect-controls, until the user allows access to their wallet
    e = document.querySelector("#post-connect-controls");
    e.classList.add("hidden");
}

function set_ui_pending(){
    let e = null;
    //hide the wallet connect button
    e = document.querySelector("#wallet-connect-btn");
    e.classList.add("hidden");
    //show the wallet-connect pending button, which is disabled and unbound to any event
    e = document.querySelector("#wallet-connect-pending");
    e.classList.remove("hidden");
    //hide the post-connect-controls, until the user allows access to their wallet
    e = document.querySelector("#post-connect-controls");
    e.classList.add("hidden");
}

function set_ui_connected(){
    let e = null;
    //hide the pre-connect controls
    e = document.querySelector("#pre-connect-controls");
    e.classList.add("hidden");
    //show the connect button for next time its needed
    e = document.querySelector("#wallet-connect-btn");
    e.classList.remove("hidden");
    //hide the disabled pending button
    e = document.querySelector("#wallet-connect-pending");
    e.classList.add("hidden");
    //show the post-connect controls
    e = document.querySelector("#post-connect-controls");
    e.classList.remove("hidden");
}

function set_owner(o){
    var e = document.querySelector("#contract-owner");
    e.innerHTML = o;
}

function set_address(a){
    var e = document.querySelector("#contract-address");
    e.innerHTML = a;
}

function set_price(p){
    var e = document.querySelector("#contract-price");
    e.innerHTML = p + " " + chain_currency;
}

function set_jackpot(j){
    var e = document.querySelector("#contract-jackpot");
    e.innerHTML = j + " " + chain_currency;
}

function set_luckynum(ln){
    var e = document.querySelector("#contract-luckynum");
    e.innerHTML = ln;
}

function set_nonces(n){
    var e = document.querySelector("#contract-nonces");
    e.innerHTML = n;
}

function set_version(v){
    var e = document.querySelector("#contract-version");
    e.innerHTML = v;
}

function set_balance(b){
    var e = document.querySelector("#contract-balance");
    e.innerHTML = b + " " + chain_currency;
}

function set_total_sold(ts){
    var e = document.querySelector("#contract-sold");
    e.innerHTML = ts;
}

function set_total_winners(tw){
    var e = document.querySelector("#contract-winners");
    e.innerHTML = tw;
}

function set_total_fortunes(tf){
    var e = document.querySelector("#contract-fortunes");
    e.innerHTML = tf;
}

function toggle_section(id){
    var e = document.querySelector(id);
    if(e.classList.contains("hidden")){
        e.classList.remove("hidden");
    }
    else{
        e.classList.add("hidden");
    }
}

function hide_all_sub_modals(){
    var e = null;

    e = document.querySelector("#contract-body");
    e.classList.add("hidden");
    e = document.querySelector("#game-rules-body");
    e.classList.add("hidden");
    e = document.querySelector("#fortune-body");
    e.classList.add("hidden");
}

function show_game_rules_modal(){
    //hide all the sub modals for cleanliness
    hide_all_sub_modals();
    //show only the one needed
    toggle_section("#game-rules-body");
    //toggle the modal window open
    toggle_section("#modal");
}

function show_contract_modal(){
    //hide all the sub modals for cleanliness
    hide_all_sub_modals();
    //show only the one needed
    toggle_section("#contract-body");
    //toggle the modal window open
    toggle_section("#modal");
}

function show_fortune_modal(luckyNum, yourNum, payout, fortuneText){
    var e = null;

    e = document.querySelector("#fortune-lucky-num");
    e.innerHTML = luckyNum;

    e = document.querySelector("#fortune-your-num");
    e.innerHTML = yourNum;
    
    e = document.querySelector("#fortune-payout");
    e.innerHTML = "Payout: " + payout + " " + chain_currency;

    e = document.querySelector("#fortune-text");
    e.innerHTML = '"' + fortuneText + '"';

    //hide all the sub modals for cleanliness
    hide_all_sub_modals();
    //show only the one needed
    toggle_section("#fortune-body");
    //toggle the modal window open
    toggle_section("#modal");
}



/*
    On Page Load event handling: initialize system
*/
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    //bind event listeners to their elements
    bind_all();

    // get the automat abi & networks json
    let myRequest = null;
    

    // fetch the Automat ABI 
    myRequest = new Request('abi/automat');
    fetch(myRequest)
        .then(response => response.json())
        .then(data => {
            Artifacts.Automat.abi = data;
        })
        .catch(console.error);

    // fetch the Automat Networks
    myRequest = new Request('net/automat'); 
    fetch(myRequest)
        .then(response => response.json())
        .then(data => {
            Artifacts.Automat.net = data;
        })
        .catch(console.error);
});