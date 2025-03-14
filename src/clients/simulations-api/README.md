# Solana Proxy API

## Endpoints:
1. `/sol/cmd/setup`: Creates a trusted account for the tournament, mints x numbers of NFTs, transfers ownership of the NFTs to the trusted account.

    Sample:
    ```sh
    curl --location 'http://localhost:3001/sol/cmd/setup' \
    --header 'Content-Type: application/json' \
    --data '{
        "cmdData": {
            "name": "bs-2",
            "noTokens": 3
        }
    }'
    ```

2. `/sol/cmd/create-accs`: Creates x number of wallet accounts. Useful for simulations.

    Sample:
    ```sh
    curl --location 'http://localhost:3001/sol/cmd/create-accs' \
    --header 'Content-Type: application/json' \
    --data '{
        "cmdData": {
            "noAccs": 3
        }
    }'
    ```

3. `/sol/cmd/transfer-sol`: Transfers SOL from a `source` account to a `dest` account, via the trusted wallet.

    Sample:
    ```sh
    curl --location 'http://localhost:3001/sol/cmd/transfer-sol' \
      --header 'Accept: */*' \
      --header 'Accept-Language: en-US,en;q=0.9' \
      --header 'Connection: keep-alive' \
      --header 'Content-Type: application/json' \
      --header 'Origin: null' \
      --header 'Sec-Fetch-Dest: empty' \
      --header 'Sec-Fetch-Mode: cors' \
      --header 'Sec-Fetch-Site: cross-site' \
      --header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' \
      --header 'sec-ch-ua: "Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"' \
      --header 'sec-ch-ua-mobile: ?0' \
      --header 'sec-ch-ua-platform: "macOS"' \
      --data '{
          "cmdData": {
              "instr": {
                  "tournament": {
                      "privKey": "[178,230,4,20,12,97,105,25,183,104,203,171,236,66,156,211,36,103,28,196,251,182,73,75,214,185,153,136,139,33,31,246,90,69,204,172,151,23,64,69,13,3,216,119,67,196,62,84,117,47,146,84,251,154,84,92,184,140,15,161,27,134,113,239]"
                  },
                  "source": {
                      "privKey": "[174,86,218,47,23,65,83,112,101,98,245,13,214,91,16,219,108,108,168,121,116,226,252,147,228,195,235,156,55,93,180,3,221,118,113,90,80,64,245,92,173,99,1,33,15,208,140,136,100,22,106,239,222,127,209,153,58,147,30,84,100,117,194,247]"
                  },
                  "dest": {
                      "privKey": "[56,103,135,133,134,134,133,89,251,217,141,98,19,114,15,41,153,240,220,4,7,51,216,16,49,48,5,7,90,167,96,84,241,243,208,155,35,7,217,16,120,85,153,4,226,91,165,60,246,183,119,67,24,230,138,109,222,180,13,129,37,225,173,254]"
                  }
              }
          }
      }'
    ```

4. `/sol/cmd/transfer-nft`: Transfers an NFT from a `source` account to a `dest` account, via the trusted wallet.

    Sample:
    ```sh
    curl --location 'http://localhost:3001/sol/cmd/transfer-nft' \
      --header 'Accept: */*' \
      --header 'Accept-Language: en-US,en;q=0.9' \
      --header 'Connection: keep-alive' \
      --header 'Content-Type: application/json' \
      --header 'Origin: null' \
      --header 'Sec-Fetch-Dest: empty' \
      --header 'Sec-Fetch-Mode: cors' \
      --header 'Sec-Fetch-Site: cross-site' \
      --header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' \
      --header 'sec-ch-ua: "Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"' \
      --header 'sec-ch-ua-mobile: ?0' \
      --header 'sec-ch-ua-platform: "macOS"' \
      --data '{
          "cmdData": {
              "instr": {
                  "tournament": {
                      "privKey": "[178,230,4,20,12,97,105,25,183,104,203,171,236,66,156,211,36,103,28,196,251,182,73,75,214,185,153,136,139,33,31,246,90,69,204,172,151,23,64,69,13,3,216,119,67,196,62,84,117,47,146,84,251,154,84,92,184,140,15,161,27,134,113,239]"
                  },
                  "mint": {
                      "privKey": "[199,246,171,136,37,242,229,168,56,86,90,12,250,101,255,152,212,71,42,0,196,133,247,97,117,64,47,211,91,79,213,142,174,41,254,76,179,85,119,78,156,7,237,134,86,248,201,253,130,116,86,13,223,64,43,15,8,218,55,187,110,225,117,178]"
                  },
                  "dest": {
                      "privKey": "[24,161,202,22,92,237,200,160,85,177,114,30,230,110,62,16,31,69,144,139,167,242,44,200,92,178,206,139,77,186,105,24,98,96,119,69,137,2,68,255,119,218,249,54,2,216,231,37,73,104,229,30,78,186,84,31,206,162,230,118,79,73,152,80]"
                  },
                  "source": {
                      "privKey": "[178,230,4,20,12,97,105,25,183,104,203,171,236,66,156,211,36,103,28,196,251,182,73,75,214,185,153,136,139,33,31,246,90,69,204,172,151,23,64,69,13,3,216,119,67,196,62,84,117,47,146,84,251,154,84,92,184,140,15,161,27,134,113,239]"
                  }
              }
          }
      }'
    ```

## Setup
**Install dependencies:**
```sh
npm install
```

**Run API:**
```sh
npm run dev
```

*Note: API will run on port 3001*