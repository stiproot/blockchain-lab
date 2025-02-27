# NFTs (Non-Fungible Tokens)

An NFT (Non-Fungible Token) is a unique digital asset stored on a blockchain, representing ownership of a specific item—like artwork, music, videos, virtual goods, or even real-world assets. 
Unlike cryptocurrencies such as Bitcoin or Ethereum, NFTs cannot be exchanged on a one-to-one basis because each one has a unique value and identity.

The actual NFT content (image, video, audio, etc.) is usually not stored on the blockchain due to size and cost limitations. 
Instead, the NFT itself (the token) is a smart contract stored on the blockchain, which contains metadata and a reference (URI) pointing to the actual digital asset.

How NFTs Store Data:
1. On-Chain Metadata (Rare)
    - Some NFTs store everything directly on the blockchain (e.g., CryptoPunks on Ethereum). This is expensive and limited due to blockchain storage constraints.
        - Storage limits: Blockchains are designed for transactions, not media hosting.
        - Perf issues: Blockchain nodes would need to store huge amounts of data.
2. Off-Chain Storage (Most Common)
    - The NFT smart contract stores only a URI (Uniform Resource Identifier) linking to the actual file.
    - The digital asset is stored on an external system, like:
        - IPFS (InterPlanetary File System) – Decentralized and tamper-resistant.
        - Arweave – Permanent decentralized storage.
        - Centralized Servers – Like AWS, Google Drive (less secure, prone to link rot).

Example of an NFT smart contract:
```json
{
  "name": "Cool NFT",
  "description": "A unique digital collectible",
  "image": "ipfs://Qm123abc456xyz",  
  "attributes": {
    "rarity": "Legendary",
    "power": 95
  }
}
```