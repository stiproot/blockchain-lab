How to Achieve Delegation Before Transfer in a Solana Smart Contract
Since Solana tokens follow the SPL Token Standard, a player fully owns their token once it is transferred to their ATA (Associated Token Account). However, you can retain burn authority by using token delegation.

🔹 What is Delegation in SPL Tokens?
Delegation allows a third party (your smart contract) to spend or burn tokens on behalf of the owner.

✅ Steps to Delegate Burn Authority Before Transfer
Before transferring the token, you can set up approval for delegation using the Approve instruction from the SPL Token Program.

1️⃣ Approve the Smart Contract to Burn Tokens
When the player buys in, before transferring the token, call the Approve instruction:

rust
Copy
Edit
