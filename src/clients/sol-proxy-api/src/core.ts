import { generateSigner, keypairIdentity, KeypairSigner, lamports, percentAmount, publicKey, PublicKey, Umi } from '@metaplex-foundation/umi';
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
import { buildUmi, createConn, createUmiKeypairFromSecretKey, logTransactionLink, MEMO_PROGRAM_PUBKEY, uint8ArrayToStr } from './utls';
import { IBurnTokenInstr, ICreateAccInstr, IKeys, IKeyStore, IMemoInstr, IMintTokenInstr, IMintTokensInstr, ISubscribeAccInstr, ISubscribeEvt, ISubStore, IToken, ITransferSolInstr, ITransferTokenInstr, IUnsubscribeAccInstr } from './types';
import { DEFAULT_SELLER_FEE_BASIS_POINTS_AMT, DEFAULT_SOL_FUND_AMT, DEFAULT_ACC_SPACE_BYTES } from './consts';
import { createKeyStore, createSubStore } from './factories';
import { Subscriber } from './subscribers';
import { HttpClient } from './http.client';

const keyStore: IKeyStore = createKeyStore();
const subStore: ISubStore = createSubStore();
const httpClient = new HttpClient();


async function mintTokenCore(
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
  amtLamports: number
) {
  const builder = mplTransferSol(umi, {
    source: sourceSigner,
    destination: destPubKey,
    amount: lamports(amtLamports),
  });

  console.log('Attempting transer...');

  const { signature } = await builder.sendAndConfirm(umi);
  logTransactionLink('transferSolCore()', signature);
}

export async function transferTokenCore(
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

export async function burnTokenCore(
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
  space: number,
  newAccountKeypair: Web3Keypair | null = null
): Promise<Web3Keypair> {
  const web3Keypair: Web3Keypair = newAccountKeypair || Web3Keypair.generate();

  const instruction = SystemProgram.createAccount({
    fromPubkey: fundingWallet.publicKey, // Funding wallet
    newAccountPubkey: web3Keypair.publicKey,
    lamports,
    space: space,
    programId: SystemProgram.programId, // Assign to system program
  });

  const transaction = new Transaction().add(instruction);
  const signature = await sendAndConfirmTransaction(connection, transaction, [fundingWallet, web3Keypair]);

  console.log('createAccount()', 'pubKey', web3Keypair.publicKey.toBase58(), 'signature', signature);
  return web3Keypair;
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

export async function createAcc(instr: ICreateAccInstr): Promise<IKeys> {
  const umi = buildUmi();
  const connection: Connection = createConn();

  const payerKps = await keyStore.getKeypair(instr.payer, umi);

  umi.use(keypairIdentity(payerKps.signer));

  const space = instr.spaceBytes || DEFAULT_ACC_SPACE_BYTES;
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  console.log(`Rent-exempt minimum balance: ${lamports} lamports`);

  const acc: Web3Keypair = await createAccCore(umi, connection, payerKps.w3Kp, lamports, space);

  // writeKeypairToFile(acc.secretKey);
  // await keyStore.loadWallets();

  if (instr.fundAcc) {
    console.log('setupAccs()', 'funding accounts');
    const umiKp = createUmiKeypairFromSecretKey(umi, acc.secretKey);
    await transferSolCore(umi, payerKps.signer, umiKp.publicKey, lamports);
  }

  return ({ pk: acc.publicKey.toBase58(), sk: uint8ArrayToStr(acc.secretKey) } as IKeys);
}

export async function mintToken(instr: IMintTokenInstr): Promise<IToken> {
  const umi = buildUmi();
  const payerKps = await keyStore.getKeypair(instr.payer, umi);
  umi.use(keypairIdentity(payerKps.signer));

  console.log('mintToken()', 'attempting minting...');
  const token = await mintTokenCore(
    umi,
    instr.name,
    instr.uri,
    publicKey(instr.owner.pk),
  );

  const resp = {
    mint: { pk: token.publicKey.toString() } as IKeys,
    owner: { pk: instr.owner.pk } as IKeys
  } as IToken;

  return resp;
}

export async function mintTokens(instr: IMintTokensInstr): Promise<Array<IToken>> {
  const tokens: Array<IToken> = await Promise.all(instr.instrs.map(i => mintToken(i)));
  return tokens;
}

export async function transferSol(instr: ITransferSolInstr) {
  const umi = buildUmi();
  const srcKps = await keyStore.getKeypair(instr.source, umi);
  umi.use(keypairIdentity(srcKps.signer));

  await transferSolCore(umi, srcKps.signer, publicKey(instr.dest.pk), instr.amtLamports);

  return {};
}

export async function transferToken(instr: ITransferTokenInstr) {
  const umi = buildUmi();
  const srcKps = await keyStore.getKeypair(instr.source, umi);
  umi.use(keypairIdentity(srcKps.signer));

  const mintKps = await keyStore.getKeypair(instr.mint, umi);
  const destKps = await keyStore.getKeypair(instr.dest, umi);

  console.log('transferNft()', 'attempting transfer...');

  await transferTokenCore(
    umi,
    mintKps.umiKp.publicKey,
    srcKps.signer,
    srcKps.umiKp.publicKey,
    destKps.umiKp.publicKey
  );

  return {};
}

export async function burnToken(instr: IBurnTokenInstr) {
  const umi = buildUmi();

  const ownerKps = await keyStore.getKeypair(instr.owner, umi);
  umi.use(keypairIdentity(ownerKps.signer));

  const mintKps = await keyStore.getKeypair(instr.mint, umi);

  await burnTokenCore(umi,
    mintKps.umiKp.publicKey,
    ownerKps.signer,
    ownerKps.umiKp.publicKey,
  );

  return {};
}

export async function memo(instr: IMemoInstr) {
  const umi = buildUmi();
  const sender = await keyStore.getKeypair(instr.sender, umi);

  const transaction = new Transaction().add({
    keys: [{ pubkey: sender.w3Kp.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_PUBKEY(),
    data: Buffer.from(instr.payload, "utf-8"),
  });

  const connection = createConn();
  const txid = await sendAndConfirmTransaction(connection, transaction, [sender.w3Kp]);
  logTransactionLink('memo', txid);

  return {};
}

export async function registerAccSub(instr: ISubscribeAccInstr): Promise<void> {
  const fn = async (evt: ISubscribeEvt) => {
    evt.extId = instr.extId;
    console.debug('sub-evt', evt);
    await httpClient.post(instr.webhookUrl, evt);
  };

  const sub = new Subscriber(instr.accountPk, fn);
  await subStore.addSub(instr, sub.start());
}

export function unregisterAccSub(instr: IUnsubscribeAccInstr): void {
  subStore.getSub(instr.accountPk)?.stop();
  subStore.removeSub(instr);
}