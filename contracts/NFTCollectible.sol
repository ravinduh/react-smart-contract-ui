// contracts/NFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTCollectible is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256 constant MAX_SUPPLY = 5;
    uint256 public constant PRICE = 0.01 ether;

    
    uint256 constant MINT_START = 1688428800000; // Timestamp for 04 July 2023 UTC
    uint256 constant MINT_END = 1691107200000; // Timestamp for 04 Aug 2023 UTC


    string public baseTokenURI;

    // Mapping to store the receipt data
    mapping(address => mapping(string => bool)) public receiptUsed;
    event MintNFT(address indexed sender, string receipt);

    constructor(string memory baseURI) ERC721("NFT Collectible", "NFTC") {
        setBaseURI(baseURI);
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function mintNFTs(uint _count, string memory receipt, uint256 currentTime) public payable {
        uint totalMinted = _tokenIds.current();

        require(currentTime >= MINT_START, "Minting period has not started");
        require(currentTime <= MINT_END, "Minting period has ended");

        // Check if the wallet address and receipt has already minted an NFT
        require(!receiptUsed[msg.sender][receipt], "NFT already minted for this wallet and receipt combination");

        // Mark receipt as used for the specific wallet
        receiptUsed[msg.sender][receipt] = true;

        // Emit event
        emit MintNFT(msg.sender, receipt);

        require(totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs left!");
        require(msg.value >= PRICE.mul(_count), "Not enough ether to purchase NFTs.");

        for (uint i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
    }

    function _mintSingleNFT() private {
        uint256 newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();
    }
}
