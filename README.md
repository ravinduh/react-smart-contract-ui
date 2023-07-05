# react-smart-contract-ui

Follow following steps to run the project locallly

1. Clone the repo
2. cd eact-smart-contract-ui
3. npm install
4. npx hardhat clean
5. npx hardhat compile
6. In a new terminal execute: npx hardhat node
7. Go back to previous terminal and run: npx hardhat run scripts/deploy.js --network localhost
8. npm start
9. Install metamask wallet as a extension https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn
10. In the console you ran "npx hardhat node" there will be test wallets listed , pick one with the private key. Import that account to the metamask wallet
11. Now you can enter your NRIC, connect to wallet, load and mint the NFT hosted in IPFS cloud

References
1. https://ethereum.org/en/developers/tutorials/how-to-mint-an-nft/
2. https://www.codeproject.com/Articles/5338801/Build-NFT-Collection-Web3-Application-with-Hardha