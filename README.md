# blockchain-lab
Personal laboratory for experimenting with blockchains.

# Concepts
- [NFTs](.docs/NFTS.md)
- [Smart Contracts](.docs/SMART_CONTRACTS.md)

---

# Setting up a bockchain cluster locally
Install Solana CLI:
```sh
sh -c "$(curl -sSfL https://release.anza.xyz/v2.2.0/install)"
```

Confirm it's up:
```sh
solana --version
# > solana-cli 2.2.0 (src:8b11c7d5; feat:3294202862, client:Agave)
```

View config options:
```sh
solana-test-validator --help
```

Start the test validator:
```sh
solana-test-validator
```

In new terminal, configure the CLI Tool Suite to target a local cluster by default. Run:
```sh
solana config set --url http://127.0.0.1:8899
```

Verify the CLI Tool Suite configuration:
```sh
solana genesis-hash
```

Generate a new keypair:
```sh
solana-keygen new -o ~/.config/solana/id.json
```

Airdrop an initial amount:
```sh
solana airdrop 10
```

Check the wallet balance:
```sh
solana balance
```

Perform a basic transfer action:
```sh
solana transfer {{identity}} 1
```

Monitor `msg!()` output from on-chain programs:
```sh
solana logs
```
NOTE: This command needs to be running when the target transaction is executed. Run it in its own terminal

---

# Deploy Smart Contract 
Refer to [hello_world/README.md](hello_world/README.md).

---

# Use the Web3 Client
Refer to [simple-client/README.md](simple-client/README.md).

---

# Resources
- https://docs.anza.xyz/cli/install
- https://docs.anza.xyz/cli/examples/test-validator
- https://solana.com/developers/guides/getstarted/local-rust-hello-world