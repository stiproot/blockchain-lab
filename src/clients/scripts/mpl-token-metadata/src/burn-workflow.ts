import { buildWalletKeypair, loadDefaultWalletKeypair, loadKeypairFromCfg, buildUmi, createConn, translateWeb3ToUmiKeypair } from './utls';
import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { burnV1, createNft, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import {
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Keypair as Web3Keypair,
} from '@solana/web3.js';

async function main() {

  const connection: Connection = createConn();

  // INIT...
  const walletWeb3Keypair: Web3Keypair = await loadDefaultWalletKeypair();
  const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount
  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg('tournament-keypair.json');

  // INIT UMI...
  const umi = buildUmi();
  const walletUmiKeypair: UmiKeypair = await buildWalletKeypair(umi);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, walletUmiKeypair);
  const tournamentUmiKeypair: UmiKeypair = translateWeb3ToUmiKeypair(umi, tournamentWeb3Keypair);

  umi.use(keypairIdentity(payerSigner));

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    tournamentWeb3Keypair.publicKey,
    { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") } // SPL Token Program
  );

  const mintAddresses = tokenAccounts.value.map((account) => account.account.data.parsed.info.mint);
  console.log("Mints owned by wallet:", mintAddresses);

  const tournamentAuthority = createSignerFromKeypair(umi, tournamentUmiKeypair);

  for (const mint of mintAddresses) {
    console.log("Attempting burn token...");

    await burnV1(umi, {
      mint,
      authority: tournamentAuthority,
      tokenOwner: tournamentAuthority.publicKey,
      tokenStandard: TokenStandard.NonFungible,
    }).sendAndConfirm(umi);
  }
}

main().then(() => {
  console.log("Done.");
}, err => {
  console.error(err);
});