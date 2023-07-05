import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import { BigNumber, ethers } from "ethers";
import type { NFTCollectible } from './typechain-types/contracts/NFTCollectible';
import { NFTCollectible__factory } from './typechain-types/factories/contracts/NFTCollectible__factory'
import fetchData from './service';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const IPFS_CLOUD_API = process.env.IPFS_CLOUD_API || "https://gateway.pinata.cloud/ipfs/";

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children?: React.ReactElement;
}

interface IWallet {
  iconColor: string;
  connectedWallet: string;
  contractAddress: string;
  contractSymbol: string;
  contractBaseTokenURI: string;
  contractOwnerAddress: string;
  contractPrice: string;
  receipt: string;
}

interface IService {
  account: string;
  ethProvider?: ethers.providers.Web3Provider,
  contract?: NFTCollectible;
  currentBalance: number;
  ethBalance: string;
  mintAmount: number;
}

export default function DemoPage(props: Props,) {
  const [state, setState] = React.useState<IWallet>({
    iconColor: "disabled",
    connectedWallet: "",
    contractSymbol: "",
    contractAddress: "",
    contractBaseTokenURI: "",
    contractOwnerAddress: "",
    contractPrice: "",
    receipt: ""
  });

  const [nftCollection, setNFTCollection] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [nric, setNRIC] = React.useState<string>("");
  const [service, setService] = React.useState<IService>({
    account: "",
    currentBalance: 0,
    ethBalance: "",
    mintAmount: 0
  });

  const handleNRICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNRIC(e.target.value);
  };
  
  const handleOpen = () => {
    setOpen(true);
    setService({...service, mintAmount: 0});
  }

  const handleClose = () => setOpen(false);

  const connectWallet = async () => {
    try {
      console.log("connect wallet");
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // Getting unique hash receipt for the wallet address and NRIC
      const receiptRes = await fetchData(nric, accounts[0])

      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = NFTCollectible__factory.connect(CONTRACT_ADDRESS, provider.getSigner());
      const ownerAddress = await contract.owner();
      const symbol = await contract.symbol();
      const baseTokenURI = await contract.baseTokenURI();
      const balance = await (await contract.balanceOf(accounts[0])).toNumber();
      const ethBalance = ethers.utils.formatEther(await provider.getBalance(accounts[0]));
      const price = ethers.utils.formatEther(await contract.PRICE());
      setState({
        iconColor: "success",
        connectedWallet: accounts[0],
        contractSymbol: symbol,
        contractAddress: contract.address,
        contractBaseTokenURI: baseTokenURI,
        contractOwnerAddress: ownerAddress,
        contractPrice: `${price} ETH`,
        receipt: receiptRes.data?.data?.receipt
      });

      setService({
        account: accounts[0],
        contract: contract,
        currentBalance: balance,
        ethBalance: `${ethBalance} ETH`,
        mintAmount: 0,
        ethProvider: provider
      });

      console.log("Connected", accounts[0]);
    } catch (error) {
      console.log(error);
      window.alert(error.response?.data?.error?.message)
    }
  };

  const loadNFTCollection = async () => {
    try {
      console.log("load NFT collection");
      let baseURI: string = state.contractBaseTokenURI;
      baseURI = baseURI.replace("ipfs://", IPFS_CLOUD_API);
      setNFTCollection(
        [
          `${baseURI}`
        ]);
    } catch (error) {
      console.log(error);
    }
  };

  const mintNFTs = async () => {
    try {
      console.log("mint NFTs");
      const address = service.account;
      const amount = service.mintAmount!;
      const contract = service.contract!;
      const price = await contract.PRICE();
      const ethValue = price.mul(BigNumber.from(amount));
      const signer = service.ethProvider!.getSigner();
      let txn = await contract.connect(signer!).mintNFTs(amount, state.receipt, new Date().getTime(), { value: ethValue});
      await txn.wait();
      const balance = await contract.balanceOf(address);
      setService({...service, currentBalance: balance.toNumber(), mintAmount: 0});
    } catch (error) {
      console.log(error);
      window.alert(error);
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
        <AppBar>
          <Toolbar>
            <Stack direction="row" spacing={2}>
              <Typography variant="h3" component="div">
                Mint NFT Collection
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>
      <Toolbar />
      <Container>
        <Box>
          <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
            <TextField id="nric" label="NRIC" variant="standard" value={nric}
                onChange={handleNRICChange}
            />
            <Button variant="contained" disabled={!nric} onClick={connectWallet}>Connect</Button>
          </Stack>
          <Stack direction="column" spacing={10} sx={{ margin: 5 }}>
            <Stack direction="row" spacing={2} >
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <TextField id="wallet_address" label="Connected Account" sx={{ width: 300 }} variant="standard" value={state.connectedWallet}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <TextField id="contract_symbol" label="Contract Symbol" variant="standard" value={state.contractSymbol}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <TextField id="contract_address" label="Contract Address" sx={{ width: 400 }} variant="standard" value={state.contractAddress}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <TextField id="contract_baseURI" label="Contract Base Token URI" sx={{ width: 500 }} variant="standard" value={state.contractBaseTokenURI}
                  inputProps={{ readOnly: true, }}
                />
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
              <Button variant="contained" disabled={!state.contractBaseTokenURI} onClick={loadNFTCollection}>Load NFT Collection</Button>
            </Stack>
            <ImageList sx={{ width: 250, height: 200 }} cols={1} rowHeight={164}>
              {nftCollection.map((item) => (
                <ImageListItem key={item}>
                  <img
                    src={`${item}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
              <Button variant="contained" disabled={!state.contractBaseTokenURI || nftCollection.length === 0} onClick={handleOpen}>Mint NFT</Button>
            </Stack>
          </Stack>
        </Box>
        <div>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={open}>
              <Box sx={modalStyle}>
                <Stack spacing={1} sx={{ width: 500 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="mint_account" label="Account" sx={{ width: 500 }} variant="standard" value={service.account}
                      inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="price" label="NFT Price" sx={{ width: 500 }} variant="standard" value={state.contractPrice}
                      inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="balance" label="Balance" sx={{ width: 500 }} variant="standard" value={service.currentBalance}
                      type = "number" inputProps={{ readOnly: true}}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TextField id="mint_amount" type="number" label="Mint Amount" sx={{ width: 500 }} variant="standard" value={service.mintAmount}
                     onChange={event => {
                      const { value } = event.target;
                      const amount = parseInt(value); 
                      setService({...service, mintAmount: amount});
                    }}
                     />
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ margin: 5 }}>
                    <Button variant="outlined" onClick={mintNFTs}>Mint</Button>
                    <Button variant="outlined" onClick={handleClose}>close</Button>
                  </Stack>
                </Stack>
              </Box>
            </Fade>
          </Modal>
        </div>
      </Container>
    </React.Fragment>
  );
}
