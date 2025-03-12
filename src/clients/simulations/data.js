const API_HOST_URL = 'http://localhost:3001';
const SETUP_URL = `${API_HOST_URL}/sol/cmd/setup`;
const CREATE_ACCS_URL = `${API_HOST_URL}/sol/cmd/create-accs`;
const TRANSFER_SOL_URL = `${API_HOST_URL}/sol/cmd/transfer-sol`;
const TRANSFER_NFT_URL = `${API_HOST_URL}/sol/cmd/transfer-nft`;
const BURN_NFT_URL = `${API_HOST_URL}/sol/cmd/burn-nft`;

const wrapInPromise = (data) => new Promise((resolve) => resolve(data));

class SolProxyClient {
  setup = async (payload, mock = false) => mock ? wrapInPromise(SETUP_RESP) : await callApi(SETUP_URL, payload);
  createAccs = async (payload, mock = false) => mock ? wrapInPromise(CREATE_ACCS_URL) : await callApi(CREATE_ACCS_URL, payload);
  transferSol = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(TRANSFER_SOL_URL, payload);
  transferNft = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(TRANSFER_NFT_URL, payload);
  burnNft = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(BURN_NFT_URL, payload);
}

async function callApi(url, body = null, method = 'POST', headers = {}) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}