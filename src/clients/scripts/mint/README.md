# Setup
Download the Multiplex token program from the mainet using the make command, defined in [Makefile](../../Makefile):
```sh
make sol-download-mpl
```
This will download the program .so as `metadata.so`.

Startup the localnet using the make command, defined in [Makefile](../../Makefile):
```sh
make sol-startup-mpl
```
This will install the mpl-token program locally, by using the .so downloaded in the previous step.

Confirm the program is running:
```sh
solana program show metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
```

# Atomic Operations
Install client deps.:
```sh
npm install
```
*NOTE: the following commands do not need to be run in order, they perform separate operations.*

**Minting:**
Run the create-mint client:
```sh
npm run create-mint
```

or

Run the create-nft client:
```sh
npm run create-nft
```

**Fetching:**
Update `fetch-nft.ts` to make use of your mint account's public key.

Then run:
```sh
npm run fetch-nft
```

**Transferring:**
Update `transfer-nft.ts` to make use a target account public key of your choice.

You can generate a new one using:
```sh
make sol-keygen
```

Then run:
```sh
npm run transfer-nft
```

**Burn:**
Run:
```sh
npm run burn-nft
```

**Update:**
Run:
```sh
npm run update-nft
```

# Workflows
**Delegate Workflow:**
Run:
```sh
npm run delegate-workflow
```