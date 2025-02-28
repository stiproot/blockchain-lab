# Broadcasting
## 1. Creating a Transaction:
A bitcoin transaction contains:
- The sender’s Bitcoin address (public key).
- The recipient’s Bitcoin address.
- The amount of Bitcoin being transferred.
- A digital signature generated using the sender’s private key to prove ownership of the Bitcoin being spent.

Once a user creates a transaction in their Bitcoin wallet, the wallet software digitally signs it and prepares it for broadcast.

## 2. Broadcasting to the Network
- The wallet sends the transaction to **at least one** Bitcoin node.
- That node then **propogates** (forwards) the transaction to other connected nodes.
- This process continues until the transaction spreads throughout the network in a process called **gossip protocol**.

*Think of it like word-of-mouth communication.*

## 3. Transaction Validation by Nodes
Each node:
- Checks the validity of the transaction, ensuring:
    - The sender has enough Bitcoin.
    - The digital signature is correct.
    - There is no attempt to **double-spend** (spending the same Bitcoin twice).
- If valid, the node **adds the transaction to its mempool** (a temporary holding area for unconfirmed transactions).
If invalid, the transaction is discarded.

## 4. Miners Pick Up the Transaction
- Miners select transactions from the mempool and include them in a new block.
- The transaction is confirmed when a miner successfully mines a block containing it.
- Once confirmed, the transaction is permanently recorded on the blockchain.