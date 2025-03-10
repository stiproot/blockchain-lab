import { buildUmi, buildWalletKeypair, createConn, loadKeypairFromCfg } from './utls';
import { createSignerFromKeypair, keypairIdentity, publicKey } from '@metaplex-foundation/umi';
import { fetchDigitalAssetWithAssociatedToken, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import { Connection, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';


async function transferWithMemo() {

  const connection: Connection = createConn();
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: 10_000_000, // 0.01 SOL
    })
  );

  const memo = "Game event: Player bought NFT";
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: false }],
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"), // Memo Program ID
    data: Buffer.from(memo), // Convert string to Buffer
  });

  transaction.add(memoInstruction);

  // Send transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);

  console.log("Transaction Signature:", signature);
  return signature;
}

async function fetchTransactionDetails(signature: string) {
  const connection: Connection = createConn();

  const transaction = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!transaction) {
    console.log("Transaction not found.");
    return;
  }

  console.log("Transaction Details:", transaction);

  // Extract Memo (if present)
  const memoInstructions = transaction.transaction.message.instructions.filter(
    instr => instr.programId.toBase58() === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
  );

  if (memoInstructions.length > 0) {
    const memoData = memoInstructions[0].data;
    console.log("Memo:", memoData.toString()); // Convert Buffer to String
  } else {
    console.log("No memo found.");
  }
}


async function main() {

  const umi = buildUmi();

  const walletKeypair = await buildWalletKeypair(umi);
  const payerSigner = createSignerFromKeypair(umi, walletKeypair);

  // Recipient...
  const recipientWeb3Keypair = await loadKeypairFromCfg('wallet-x-keypair.json');
  const recipientKeypair = umi.eddsa.createKeypairFromSecretKey(recipientWeb3Keypair.secretKey);
  const recipientAuthority = createSignerFromKeypair(umi, recipientKeypair);

}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});