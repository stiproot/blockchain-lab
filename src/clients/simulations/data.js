const API_HOST_URL = 'http://localhost:3002';
const SETUP_URL = `${API_HOST_URL}/sim/cmd/setup`;
const ENTER_PLAYER_URL = `${API_HOST_URL}/sim/cmd/enter-player`;
const COLLISION_URL = `${API_HOST_URL}/sim/cmd/collision`;
const POP_URL = `${API_HOST_URL}/sim/cmd/pop`;

const wrapInPromise = (data) => new Promise((resolve) => resolve(data));

class SolProxyClient {
  setup = async (payload, mock = false) => mock ? wrapInPromise(SETUP_RESP) : await callApi(SETUP_URL, payload);
  collision = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(COLLISION_URL, payload);
  pop = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(POP_URL, payload);
  enterPlayer = async (payload, mock = false) => mock ? wrapInPromise({}) : await callApi(ENTER_PLAYER_URL, payload);
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