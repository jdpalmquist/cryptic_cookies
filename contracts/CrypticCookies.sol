//SPDX-License-Identifier: 0BSD
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

uint constant INT_MAX = 2**128 - 1; // half the size of integer max value

contract CrypticCookies is Ownable {
    using Address for address;
    using Counters for Counters.Counter;

    address public _PaymentMGR;
    bool private _locked; //locks the buyCookie() during execution
    uint256 public _price;
    uint256 private _jackpotIndex; //the Lucky Number
    uint256 private _totalPrizes; //the total of all prizes paid out
    uint256 private _version; //contract version number    
    uint256 private fortuneIndex;
    uint256 private i1;
    uint256 private i2;
    uint256 private i3;
    uint256 private i4;
    uint256 private i5;
    uint256 private i6; // index selection variables
    uint256[] private _n; //nonces
    uint256[] private _i; //incrementals
    string[] internal _fortunes;


    //used for adding entropy
    Counters.Counter internal _counter;

    //total number of fortunes sold
    Counters.Counter internal _totalSold;

    //total number of winners
    Counters.Counter internal _winners;

    //events
    event UpdatePaymentMGR(address indexed oldMgr, address indexed newMgr, uint256 indexed timestamp);
    event UpdatePrice(uint256 indexed oldPrice, uint256 indexed newPrice, uint256 indexed timestamp);
    event FortuneAdded(uint256 indexed timestamp);
    event EntropyAdded(uint256 indexed timestamp);
    event UpdateJackpotIndex(uint256 indexed newIndex, uint256 indexed timestamp);
    event Generated(uint256 indexed chosenIndex, uint256 indexed winningIndex, uint256 indexed payout);

    constructor() {
        _PaymentMGR = msg.sender;

        _price = 1000000000000000000; // 1 $ONE

        _jackpotIndex = 0;

        _version = 1;
    }

    fallback() external payable {}
    receive() external payable {}
    
    function upgrade(address a) external virtual onlyOwner {
        require(a != address(0), "Err: null address");
        require(a.isContract(), "Err: address not a contract");
        selfdestruct(payable(a));
    }

    function setPaymentMGR(address _paymgr) external virtual onlyOwner {
        require(_paymgr != address(0), "Err: null address");
        emit UpdatePaymentMGR(_PaymentMGR, _paymgr, block.timestamp);
        _PaymentMGR = _paymgr;
    }

    function setPrice(uint256 newPrice) external virtual onlyOwner {
        emit UpdatePrice(_price, newPrice, block.timestamp);
        _price = newPrice;
    }

    function addFortune(string calldata f) external virtual onlyOwner {
        emit FortuneAdded(block.timestamp);
        _fortunes.push(f);
    }

    function addEntropy(uint256 newNonce, uint256 newIncremental) 
    external sizeChk(newNonce) sizeChk(newIncremental) virtual onlyOwner {
        //save the new nonce and incremental values to storage
        _n.push(newNonce);
        _i.push(newIncremental);

        //add additional entropy
        _counter.increment();

        emit EntropyAdded(block.timestamp);
    }

    //for manually forcing an update of the jackpot index
    function updateJackpotIndex(uint256 x1, uint256 x2, uint256 x3) external virtual onlyOwner {
        _counter.increment();
        _jackpotIndex = uint256(
            keccak256(
                abi.encodePacked(
                    x1,
                    x2,
                    x3,
                    _counter.current(),
                    block.timestamp,
                    block.difficulty
                )
            )
        ) % _fortunes.length;
        emit UpdateJackpotIndex(_jackpotIndex, block.timestamp);
    }

    function chooseFortuneIndex(uint256 y1, uint256 y2, uint256 y3) internal virtual returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    y1,
                    y2,
                    y3,
                    _counter.current(),
                    block.timestamp,
                    block.difficulty
                )
            )
        ) % _fortunes.length;
    }

    function resolveIndex(uint256 z1, uint256 z2, uint256 z3) internal virtual returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    z1,
                    z2,
                    z3,
                    _counter.current(),
                    block.timestamp,
                    block.difficulty
                )
            )
        ) % _n.length;
    }

    function swapIndex(uint256 a1, uint256 a2) internal virtual {
        uint256 temp;
        temp = _n[a1];
        _n[a1] = _n[a2];
        _n[a2] = temp;
    }

    function addr() public view returns(address) {
        return address(this);
    }

    function versionNum() public view returns (uint256) {
        return _version;
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function jackpot() public view returns (uint256) {
        return address(this).balance / 2;
    }

    function paymentMGR() public view returns (address) {
        return _PaymentMGR;
    }

    function totalNonces() public view returns (uint256) {
        return _n.length;
    }

    function totalFortunes() public view returns (uint256) {
        return _fortunes.length;
    }

    function getFortune(uint256 fIndex) external view returns (string memory) {
        require(fIndex >= 0 && fIndex <= _fortunes.length, "Err: invalid index");
        return _fortunes[fIndex];
    }

    function jackpotIndex() public view returns(uint256) {
        return _jackpotIndex;
    }

    function totalSold() public view returns (uint256){
        return _totalSold.current();
    }

    function totalWinners() public view returns (uint256) {
        return _winners.current();
    }


    function buyCookie() external payable funded isLocked {
        //lock this function during execution
        _locked = true;

        //send dev fee, the rest stays on contract as jackpot
        payable(_PaymentMGR).transfer(_price / 2);
        
        //generate seeds to begin the process
        
        //use the seeds to pick which indexes are chosen for the nonce and incremental
        i1 = resolveIndex(_n[_n.length - 1], _counter.current(), block.timestamp);
        i2 = resolveIndex(i1, _n[i1], _i[i1]);
        //increment the chosen nonce with its incremental value
        if(_n[i1] + _i[i2] < INT_MAX) {
            _n[i1] += _i[i2];
        } else {
            _n[i1] = i2; // reset if nonce has risen out of range
        }
        
        //use the seeds to pick which indexes are chosen for the nonce and incremental
        i3 = resolveIndex(_n[i1], _n[i2], _i[i2]);
        i4 = resolveIndex(_n[i2], _n[i3], _i[i3]);
        //increment the chosen nonce with its incremental value
        if(_n[i3] + _i[i4] < INT_MAX) {
            _n[i3] += _i[i4];
        } else {
            _n[i3] = i4; // reset if nonce has risen out of range
        }
    
        //use the seeds to pick which indexes are chosen for the nonce and incremental
        i5 = resolveIndex(_n[i1], _n[i2], _i[i2]);
        i6 = resolveIndex(_n[i1], _n[i2], _i[i2]);
        //increment the chosen nonce with its incremental value
        if(_n[i5] + _i[i6] < INT_MAX) {
            _n[i5] += _i[i6];
        } else {
            _n[i5] = i6; // reset if nonce has risen out of range
        }
        
        //now that the statistical probabilities have been rendered non-trivial to predict,
        //reveal which index was chosen for the user.
        fortuneIndex = chooseFortuneIndex(_n[1], _n[3], _n[5]);

        //winner check
        if(fortuneIndex == _jackpotIndex) {
            _totalPrizes += jackpot();
            emit Generated(fortuneIndex, _jackpotIndex, jackpot());
            payable(msg.sender).transfer(jackpot());
            
            _winners.increment();
            
            _jackpotIndex = uint256(
                keccak256(
                    abi.encodePacked(
                        _n[i1],
                        _n[i2],
                        _n[i3],
                        _n[i4],
                        _n[i5],
                        _n[i6],
                        _i[i1],
                        _i[i2],
                        _i[i3],
                        _i[i4],
                        _i[i5],
                        _i[i6]
                    )
                )
            ) % _fortunes.length;
        } else {
            emit Generated(fortuneIndex, _jackpotIndex, 0);
        }

        _counter.increment();
        _totalSold.increment();
        _locked = false; //unlock execution of the buyCookie()
    }


    modifier funded {
        require(msg.value >= _price, "Err: underfunded");
        _;
    }

    modifier sizeChk(uint256 __X) {
        require(__X >= 1, "Err: too small");
        require(__X < INT_MAX, "Err: too large");
        _;
    }

    modifier isLocked {
        require(_locked == false, "Err: locked, Try again in a moment.");
        _;
    }
}