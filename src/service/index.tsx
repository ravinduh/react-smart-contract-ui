import axios from 'axios';

const SMART_CONTRACT_SERVICE_API = process.env.SMART_CONTRACT_SERVICE_API || "http://localhost:9124/";

export default async function fetchData( nric: string, wallet: string) {
    try {
        const requestData = {
            nric: nric,
            wallet_address: wallet
        };
        const response = await axios.post(`${SMART_CONTRACT_SERVICE_API}smart-contract-service/receipt`, { data: requestData});
      return response
    } catch (error) {
      console.error(error);
      throw error
    }
}
