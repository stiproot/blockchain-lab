import { createSignerFromKeypair, keypairIdentity, KeypairSigner, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import {
  PublicKey as Web3PublicKey,
  Connection,
  Keypair as Web3Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { loadKeypairFromCfg, buildUmi, createConn, createUmiKeypairFromSecretKey, range, buildTokenName, buildTokenUri, buildTestWalletUmiKeypair } from './utls';
import { IKeys, ISetupResp, IToken, ISetupInstr, ICollisionInstr, IPopInstr, IEnterPlayerInstr, ICmd } from './types';
import { DEFAULT_SOL_FUND_AMT, DEFAULT_TOURNAMENT_CFG } from './consts';

import { SolProxyClient } from './sol-proxy-client';

const solProxyClient = new SolProxyClient();

const buildCmd = (payload: any): ICmd => ({ cmdData: { instr: payload } } as ICmd);

export async function setup(instr: ISetupInstr): Promise<ISetupResp> {
  const umi = buildUmi();

  const tournamentWeb3Keypair: Web3Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);
  const tournamentSigner: KeypairSigner = createSignerFromKeypair(umi, tournamentUmiKeypair);

  umi.use(keypairIdentity(tournamentSigner));

  const accs = await createAccs(instr.noPlayers, instr.useExisting, instr.fundAccs);
  const tokens = await createTokens(instr.noPlayers, tournamentWeb3Keypair.publicKey.toBase58(), instr.name);

  console.debug("setup()", 'tournament.pubkey', tournamentWeb3Keypair.publicKey.toBase58(), 'accs', accs, 'tokens', tokens);

  const resp = {
    tournament: {
      pk: tournamentUmiKeypair.publicKey.toString()
    } as IKeys,
    accs: accs,
    tokens: tokens,
  } as ISetupResp;

  return resp;
}

export async function collision(instr: ICollisionInstr): Promise<any> {
  const transferSolPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    amt: DEFAULT_SOL_FUND_AMT
  };
  await solProxyClient.transferSol(buildCmd(transferSolPayload));

  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    mint: instr.mint
  };
  await solProxyClient.transferToken(buildCmd(transferTokenPayload));

  return {};
}

export async function pop(instr: IPopInstr): Promise<any> {
  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.source,
    dest: instr.dest,
    mint: instr.mint
  };

  await solProxyClient.transferToken(buildCmd(transferTokenPayload));

  const burnTokenPayload = {
    payer: instr.tournament,
    owner: instr.tournament,
    mint: instr.mint
  };
  await solProxyClient.burnToken(buildCmd(burnTokenPayload));

  return {};
}

export async function enterPlayer(instr: IEnterPlayerInstr): Promise<any> {
  const transferTokenPayload = {
    payer: instr.tournament,
    source: instr.tournament,
    dest: instr.dest,
    mint: instr.mint
  };
  await solProxyClient.transferToken(buildCmd(transferTokenPayload));
  return {};
}

async function createAccs(
  noAccs: number,
  useExistingAccs: boolean = true,
  fundAccs: boolean = false
): Promise<Array<IKeys>> {
  const umi = buildUmi();
  const payerWeb3Keypair: Web3Keypair = await loadKeypairFromCfg(DEFAULT_TOURNAMENT_CFG);
  const payerUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, payerWeb3Keypair.secretKey);
  const payerSigner: KeypairSigner = createSignerFromKeypair(umi, payerUmiKeypair);

  umi.use(keypairIdentity(payerSigner));

  const indxs = range(0, noAccs);
  const accs = await Promise.all(indxs.map(i => buildTestWalletUmiKeypair(umi, i)));

  if (fundAccs) {
    console.log('createAccs()', 'funding accounts');
    await Promise.all(accs.map(a => airdropSol(a.publicKey.toString())));
  }

  return accs.map(a => ({ pk: a.publicKey.toString() } as IKeys));
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
    name: buildTokenName(prefix, i),
    uri: buildTokenUri(prefix, i),
  }))

  return await solProxyClient.mintTokens(buildCmd({ instrs: instrs }));
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
