import { createSignerFromKeypair, generateSigner, keypairIdentity, KeypairSigner, percentAmount, PublicKey, sol, Umi, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import { burnV1, createNft, TokenStandard, transferV1 } from '@metaplex-foundation/mpl-token-metadata';
import {
  PublicKey as Web3PublicKey,
  Connection,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  Keypair as Web3Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { transferSol as mplTransferSol } from '@metaplex-foundation/mpl-toolbox';
import { loadKeypairFromCfg, buildUmi, createConn, translateInstrKeyToSigner, createUmiKeypairFromSecretKey, range, uint8ArrayToStr, buildTokenName, buildTokenUri, logTransactionLink, buildTestWalletUmiKeypair } from './utls';
import { IBurnNftInstr, IKeys, IMintNftsInstr, ICreateAccsInstr, ISetupTournamentAccInstr, ISetupResp, IToken, ITransferNftInstr, ITransferSolInstr } from './types';
import { DEFAULT_SELLER_FEE_BASIS_POINTS_AMT, DEFAULT_SOL_FUND_AMT, DEFAULT_SOL_TRANSFER_AMT, DEFAULT_TOURNAMENT_CFG } from './consts';


async function mintNftCore(
  umi: Umi,
  name: string,
  uri: string,
  tokenOwner: PublicKey,
  signer: KeypairSigner | null = null
): Promise<KeypairSigner> {
  const mint: KeypairSigner = signer || generateSigner(umi);

  const builder = createNft(umi, {
    mint,
    name,
    uri,
    sellerFeeBasisPoints: percentAmount(DEFAULT_SELLER_FEE_BASIS_POINTS_AMT),
    // isMutable: true,
    tokenOwner: tokenOwner
  });

  const { signature } = await builder.sendAndConfirm(umi);
  console.log('mintNftCore()', 'mint.pubkey', mint.publicKey);
  logTransactionLink('mintNftCore()', signature);

  return mint;
}

export async function transferSolCore(
  umi: Umi,
  sourceSigner: KeypairSigner,
  destPubKey: PublicKey,
  amt: number = DEFAULT_SOL_TRANSFER_AMT
) {
  const builder = mplTransferSol(umi, {
    source: sourceSigner,
    destination: destPubKey,
    amount: sol(amt),
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('transferSolCore()', signature);
}

export async function transferNftCore(
  umi: Umi,
  mintPubKey: PublicKey,
  authoritySigner: KeypairSigner,
  ownerPubKey: PublicKey,
  destOwnerPubKey: PublicKey
) {
  const builder = transferV1(umi, {
    mint: mintPubKey,
    authority: authoritySigner,
    tokenOwner: ownerPubKey,
    destinationOwner: destOwnerPubKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('transferNftCore()', signature);
}

export async function burnNftCore(
  umi: Umi,
  mintPubKey: PublicKey,
  authoritySigner: KeypairSigner,
  ownerPubKey: PublicKey
) {
  const builder = burnV1(umi, {
    mint: mintPubKey,
    authority: authoritySigner,
    tokenOwner: ownerPubKey,
    tokenStandard: TokenStandard.NonFungible,
  });

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('burnNftCore()', signature);
}

async function createAccCore(
  umi: Umi,
  connection: Connection,
  fundingWallet: Web3Keypair,
  lamports: number,
  newAccountKeypair: Web3Keypair | null = null
): Promise<UmiKeypair> {
  const web3Keypair: Web3Keypair = newAccountKeypair || Web3Keypair.generate();

  const instruction = SystemProgram.createAccount({
    fromPubkey: fundingWallet.publicKey, // Funding wallet
    newAccountPubkey: web3Keypair.publicKey,
    lamports, // Minimum SOL needed
    space: 0, // Space required
    programId: SystemProgram.programId, // Assign to system program
  });

  const transaction = new Transaction().add(instruction);
  const signature = await sendAndConfirmTransaction(connection, transaction, [fundingWallet, web3Keypair]);

  console.log('createAccount()', 'pubKey', web3Keypair.publicKey.toBase58(), 'signature', signature);
  return createUmiKeypairFromSecretKey(umi, web3Keypair.secretKey);
}

async function airdropSol(recipientPubKey: string, amountSol: number = DEFAULT_SOL_FUND_AMT) {
  const connection: Connection = createConn();
  const signature = await connection.requestAirdrop(
    new Web3PublicKey(recipientPubKey),
    amountSol * LAMPORTS_PER_SOL
  );

  // Wait for confirmation
  await connection.confirmTransaction(signature);
  console.log(`Airdropped ${amountSol} SOL to ${recipientPubKey}`, 'signature', signature);
}

export async function createAccs(instr: ICreateAccsInstr): Promise<Array<IKeys>> {
  const umi = buildUmi();
  const payerWeb3Keypair: Web3Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const payerUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, payerWeb3Keypair.secretKey);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, payerUmiKeypair);

  umi.use(keypairIdentity(payerSigner));

  const indxs = range(0, instr.noAccs);

  let newAccs = [];
  if (instr.useExisting) {
    console.log('setupAccs()', 'useExisting', true);
    newAccs = await Promise.all(indxs.map(i => buildTestWalletUmiKeypair(umi, i)));
  }
  else {
    console.log('setupAccs()', 'useExisting', false);
    const connection: Connection = createConn();
    const lamports = await connection.getMinimumBalanceForRentExemption(0); // Get rent-exempt amount
    newAccs = await Promise.all(indxs.map(i => createAccCore(umi, connection, payerWeb3Keypair, lamports)));
  }

  if (instr.fundAccs) {
    console.log('setupAccs()', 'funding accounts');
    await Promise.all(newAccs.map(a => airdropSol(a.publicKey.toString())));
  }

  return newAccs.map(na => ({ pk: uint8ArrayToStr(na.secretKey) } as IKeys));
}

export async function mintNfts(instr: IMintNftsInstr): Promise<Array<IToken>> {
  const umi = buildUmi();
  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);
  const tournamentSigner: KeypairSigner = createSignerFromKeypair(umi, tournamentUmiKeypair);

  umi.use(keypairIdentity(tournamentSigner));

  const tokenIndxs = range(0, instr.noTokens);

  console.log('mintNfts()', 'attempting minting...');
  const mintAuthsPromises: Array<Promise<KeypairSigner>> = tokenIndxs.map(ti => mintNftCore(
    umi,
    buildTokenName(instr.prefix, ti),
    buildTokenUri(instr.prefix, ti),
    tournamentUmiKeypair.publicKey
  ));
  const mintAuths: Array<KeypairSigner> = await Promise.all(mintAuthsPromises);

  const resp = mintAuths.map((v, i) => ({
    indx: i,
    mint: { pk: uint8ArrayToStr(v.secretKey) } as IKeys,
    owner: { pk: uint8ArrayToStr(tournamentSigner.secretKey) } as IKeys
  } as IToken));

  return resp;
}

export async function setupTournamentAcc(instr: ISetupTournamentAccInstr): Promise<ISetupResp> {
  const umi = buildUmi();
  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);
  const tournamentSigner: KeypairSigner = createSignerFromKeypair(umi, tournamentUmiKeypair);

  umi.use(keypairIdentity(tournamentSigner));

  console.log("setupTournament()", 'pubkey', tournamentWeb3Keypair.publicKey.toBase58());

  const resp = {
    tournament: {
      pk: uint8ArrayToStr(tournamentUmiKeypair.secretKey)
    } as IKeys
  } as ISetupResp;

  return resp;
}

export async function transferSol(instr: ITransferSolInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));

  // Transfer from user's wallet to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await transferSolCore(umi, sourceUserWalletSigner, tournamentSigner.publicKey);

  // Transfer from the trusted wallet to the user's wallet... 
  const destUserWallet = translateInstrKeyToSigner(umi, instr.dest);
  await transferSolCore(umi, tournamentSigner, destUserWallet.publicKey);

  return {};
}

export async function transferNft(instr: ITransferNftInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));

  const mintSigner = translateInstrKeyToSigner(umi, instr.mint);
  const destUserWalletSigner = translateInstrKeyToSigner(umi, instr.dest);

  if (instr.source.pk !== instr.tournament.pk) {
    console.log('transferNft()', 'source.pk != tournament.pk', 'attempting transfer...');
    // Transfer NFT from source user to trusted wallet...
    const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
    await transferNftCore(
      umi,
      mintSigner.publicKey,
      sourceUserWalletSigner,
      sourceUserWalletSigner.publicKey,
      tournamentSigner.publicKey
    );
  }

  console.log('transferNft()', 'attempting transfer...');
  // Transfer NFT from trusted wallet to dest user wallet...
  await transferNftCore(
    umi,
    mintSigner.publicKey,
    tournamentSigner,
    tournamentSigner.publicKey,
    destUserWalletSigner.publicKey
  );

  return {};
}

export async function burnNft(instr: IBurnNftInstr) {
  const umi = buildUmi();

  const tournamentSigner = translateInstrKeyToSigner(umi, instr.tournament);
  umi.use(keypairIdentity(tournamentSigner));
  const mintSigner = translateInstrKeyToSigner(umi, instr.mint);

  // Transfer NFT from source user to trusted wallet...
  const sourceUserWalletSigner = translateInstrKeyToSigner(umi, instr.source);
  await transferNftCore(
    umi,
    mintSigner.publicKey,
    sourceUserWalletSigner,
    sourceUserWalletSigner.publicKey,
    tournamentSigner.publicKey
  );

  await burnNftCore(umi,
    mintSigner.publicKey,
    tournamentSigner,
    tournamentSigner.publicKey,
  );

  return {};
}