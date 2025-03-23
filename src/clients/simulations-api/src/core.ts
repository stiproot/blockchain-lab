import { createSignerFromKeypair, keypairIdentity, KeypairSigner, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import {
  PublicKey as Web3PublicKey,
  Connection,
  Keypair as Web3Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { IKeys, ISetupResp, IToken, ISetupInstr, ICollisionInstr, IPopInstr, IEnterPlayerInstr, ICmd } from './types';
import { DEFAULT_SOL_FUND_AMT, DEFAULT_TOURNAMENT_BUY_IN_AMT, DEFAULT_TOURNAMENT_CFG } from './consts';
import { SolProxyClient } from './sol-proxy-client';
import { buildDefaultTokenName, buildDefaultTokenUri, buildUmi, createConn, createUmiKeypairFromSecretKey, loadNTestWalletKeypairsFromFile, loadWalletKeypairFromFile, range } from './utls';

require("dotenv").config();

const solProxyClient = new SolProxyClient();

export async function setup(instr: ISetupInstr): Promise<ISetupResp> {
  const umi = buildUmi();

  const tournamentWeb3Keypair: Web3Keypair = await loadWalletKeypairFromFile(DEFAULT_TOURNAMENT_CFG);
  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);
  const tournamentSigner: KeypairSigner = createSignerFromKeypair(umi, tournamentUmiKeypair);

  umi.use(keypairIdentity(tournamentSigner));

  const accs = await createAccs(instr.noPlayers, instr.useExisting, instr.fundAccs);
  const tokens = await createTokens(instr.noPlayers, tournamentWeb3Keypair.publicKey.toBase58(), instr.name);

  console.debug("setup()", 'tournament.pubkey', tournamentWeb3Keypair.publicKey.toBase58(), 'accs', accs, 'tokens', tokens);

  await solProxyClient.subAccTransactions({
    extId: instr.name,
    webhookUrl: `${process.env.SIM_API_HOST}/sim/webhook/account-transactions`,
    account: tournamentWeb3Keypair.publicKey.toBase58()
  });

  const resp = {
    tournament: {
      pk: tournamentUmiKeypair.publicKey.toString()
    } as IKeys,
    accs: accs,
    tokens: tokens,
  } as ISetupResp;

  return resp;
}

export async function enterPlayer(instr: IEnterPlayerInstr): Promise<any> {
  const transferSolPayload = {
    payer: instr.dest,
    source: instr.dest,
    dest: instr.tournament,
    amt: DEFAULT_TOURNAMENT_BUY_IN_AMT,
  };
  await solProxyClient.transferSol(transferSolPayload);

  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.tournament,
    dest: instr.dest,
    mint: instr.mint
  };
  await solProxyClient.transferToken(transferTokenPayload);
  return {};
}

export async function collision(instr: ICollisionInstr): Promise<any> {
  const transferSolPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    amt: DEFAULT_SOL_FUND_AMT
  };
  await solProxyClient.transferSol(transferSolPayload);

  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    mint: instr.mint
  };
  await solProxyClient.transferToken(transferTokenPayload);

  return {};
}

export async function pop(instr: IPopInstr): Promise<any> {
  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    mint: instr.mint
  };

  await solProxyClient.transferToken(transferTokenPayload);

  const burnTokenPayload = {
    payer: instr.tournament,
    owner: instr.tournament,
    mint: instr.mint
  };
  await solProxyClient.burnToken(burnTokenPayload);

  return {};
}

async function createAccs(
  noAccs: number,
  useExistingAccs: boolean = true,
  fundAccs: boolean = false
): Promise<Array<IKeys>> {
  const umi = buildUmi();
  const payerWeb3Keypair: Web3Keypair = await loadWalletKeypairFromFile(DEFAULT_TOURNAMENT_CFG);
  const payerUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, payerWeb3Keypair.secretKey);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, payerUmiKeypair);

  umi.use(keypairIdentity(payerSigner));

  const testKps = await loadNTestWalletKeypairsFromFile(noAccs);

  if (fundAccs) {
    console.log('createAccs()', 'funding accounts');
    await Promise.all(testKps.map(kp => airdropSol(kp.publicKey.toBase58())));
  }

  return testKps.map(kp => ({ pk: kp.publicKey.toBase58() } as IKeys));
}

async function createTokens(
  noTokens: number,
  owner: string,
  prefix: string,
): Promise<Array<IToken>> {
  const tokenIndxs = range(0, noTokens);

  const instrs = tokenIndxs.map(i => ({
    payer: { pk: owner },
    owner: { pk: owner },
    name: buildDefaultTokenName(prefix, i),
    uri: buildDefaultTokenUri(prefix, i),
  }))

  return await solProxyClient.mintTokens({ instrs: instrs });
}

async function airdropSol(recipientPubKey: string, amountSol: number = DEFAULT_SOL_FUND_AMT) {
  const connection: Connection = createConn();
  const signature = await connection.requestAirdrop(
    new Web3PublicKey(recipientPubKey),
    amountSol * LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(signature);
  console.log(`Airdropped ${amountSol} SOL to ${recipientPubKey}`, 'signature', signature);
}
