Any transaction on the Solana blockchain requires a keypair or wallet. 
If you are connecting to a wallet, you do not need to worry about the keypair. 
Otherwise a keypair must be generated for signing transactions.

Every Account on Solana has the following fields:
- `data`: A byte array that stores arbitrary data for an account. For non-executable accounts, this generally stores state that is meant to be read-only. For program accounts (smart contracts), this contains the executable program code. The data field is commonly referred to as "account data".
- `executable`: A boolean flag that indicates if the account is a program.
- `lamports`: The account's balance in lamports, the smallest unit of SOL (1 SOL = 1 billion lamports).
- `owner`: The program ID (public key) of the program that owns this account. Only the owner program can modify the account's data or deduct its lamports balance.
- `rent_epoch`: A legacy field from when Solana had a mechanism that periodically deducted lamports from accounts. While this field still exists in the Account type, it is no longer used since rent collection was deprecated.

# Wallet
A Solana wallet is a digital wallet that allows you to store, send, receive, and interact with Solana (SOL) and SPL tokens (Solana's token standard).
It also enables you to interact with decentralized applications (dApps) on the Solana blockchain.

## Types of Solana Wallets
- Web Wallets – Browser-based wallets like Phantom, Solflare, and Backpack that offer an easy-to-use interface.
- Mobile Wallets – Wallets like Phantom and Solflare also have mobile apps for iOS and Android.
- CLI Wallets – Command-line wallets, such as Solana CLI, for developers and advanced users.
- Hardware Wallets – Ledger Nano S/X and Trezor provide cold storage for extra security.
- Paper Wallets – A printed version of your private key for offline storage.

# Program Derived Addresses (PDA)
There exists a type of Account, called Program Derived Account, whose address is not the public key of a cryptographic key pair but instead is algorithmically derived from the public key of the Program that owns the Account. 
We call that address a Program Derived Address or PDA for short.
Since the address is always derived from the public key of the Program, no other Program can algorithmically derive the same address. 
On top of that, additional Seeds can be provided to the algorithm to add more context to the address.

This has a variety of use cases such as enabling programs to sign Cross-Program Invocations or enabling the creation of accounts within an address that can be derived deterministically.

Note that, by design, Program Derived Addresses will never conflict with cryptographically generated public keys.
All cryptographic public keys are part of what we call an Elliptic-curve.
If, when generating a PDA, the algorithm generated a key that falls on that curve, a Bump is added to the address and is incremented by one until the generated address no longer falls on the curve.

# Accounts
In the context Solana’s Token program, Mint Accounts are responsible for storing the global information of a Token and Token Accounts store the relationship between a wallet and a Mint Account.
Whilst Mint Accounts contain a few data attributes such as its current supply, it doesn't offer the ability to inject standardized data that can be understood by apps and marketplaces.
This is why the Token Metadata program offers a Metadata Account that attaches itself to a Mint Account via a PDA.

- [https://developers.metaplex.com/token-metadata](https://developers.metaplex.com/token-metadata)

# Cross Program Invocation (CPI)
A CPI is the interaction of one program invoking an instruction on another program.
An example would be that I make a program and during this transaction I need to transfer an NFT or Asset during this transaction.
Well my program can CPI call and ask the Token Metadata or Core programs to execute the transfer instruction for me if I give it all the correct details.