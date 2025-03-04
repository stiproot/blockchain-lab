*NOTE:*
Node scripts are used as an alternative to a Makefile. ie. scripts are defined that encapsulate non-node Solana CLI commands.

Generate a new keypair:
```sh
npm run keygen
```

The public key will be written to the terminal, copy this key as the program-id in `mint/src/lib.rs`.

Here is an example of how it will look:
```rs
declare_id!("ECw4iTHSjdVyrXFMZpVp7yfRZ1P4qnuB7awDKBjtmozT");
```

Build the application:
```sh
npm run build:program
```

Deploy the application:
```sh
npm run deploy
```

Install client dependencies:
```sh
npm install
```

Run the client driver:
```sh
npm run app
```

The output should look like >
```txt
Successfully connected to Solana dev net.
Local account loaded successfully.
Program ID: <<program-id>>
New token: <<token-key>>
```

View your log file (note that your location will differ depending on how & where you ran `solana-test-validator`):
`cat ~/.config/solana/test-ledger/validator.log`

---

# Resources
- https://solana.stackexchange.com/questions/14899/getting-build-error-the-global-allocator-in-spl-token-conflicts-with-globa