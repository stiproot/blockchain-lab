import { createSignerFromKeypair, keypairIdentity, KeypairSigner, Keypair as UmiKeypair } from '@metaplex-foundation/umi';
import {
  PublicKey as Web3PublicKey,
  Connection,
  Keypair as Web3Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { IKeys, ISetupResp, IToken, ISetupInstr, ICollisionInstr, IPopInstr, IPlayerBuyInInstr, ISubscribeEvt } from './types';
import { DEFAULT_BUY_IN_AMT_LAMP, DEFAULT_SOL_FUND_AMT, DEFAULT_TOURNAMENT_CFG } from './consts';
import { SolProxyClient } from './sol-proxy-client';
import { buildDefaultTokenName, buildDefaultTokenUri, buildUmi, createConn, createUmiKeypairFromSecretKey, loadNTestTokensFromFile, loadNTestWalletKeypairsFromFile, loadWalletKeypairFromFile, range } from './utls';
import { GameStateStore, IGameState, ITokenPlayerMap } from './game-state.store';

require("dotenv").config();

const solProxyClient = new SolProxyClient();
export const gameStateStore = new GameStateStore();

export async function setup(instr: ISetupInstr): Promise<ISetupResp> {
  const umi = buildUmi();

  const tournamentWeb3Keypair: Web3Keypair = await loadWalletKeypairFromFile(DEFAULT_TOURNAMENT_CFG);
  const tournamentUmiKeypair: UmiKeypair = createUmiKeypairFromSecretKey(umi, tournamentWeb3Keypair.secretKey);
  const tournamentSigner: KeypairSigner = createSignerFromKeypair(umi, tournamentUmiKeypair);

  umi.use(keypairIdentity(tournamentSigner));

  const accs: Array<IKeys> = await createAccs(instr.noPlayers, instr.useExisting, instr.fundAccs);
  const tokens: Array<IToken> = await createTokens(instr.noPlayers, tournamentWeb3Keypair.publicKey.toBase58(), instr.name);

  console.debug("setup()", 'tournament.pubkey', tournamentWeb3Keypair.publicKey.toBase58(), 'accs', accs, 'tokens', tokens);

  await solProxyClient.subAccTransactions({
    extId: instr.name,
    webhookUrl: `${process.env.SIM_API_HOST}/sim/webhook/account-transactions`,
    account: tournamentWeb3Keypair.publicKey.toBase58()
  });

  gameStateStore.setState({ mappings: tokens.map(t => ({ player: null, token: t.mint.pk } as ITokenPlayerMap)) } as IGameState);

  const resp = {
    tournament: {
      pk: tournamentUmiKeypair.publicKey.toString()
    } as IKeys,
    accs: accs,
    tokens: tokens,
  } as ISetupResp;

  return resp;
}

export async function playerBuyIn(instr: IPlayerBuyInInstr): Promise<any> {
  const transferSolPayload = {
    payer: instr.dest,
    source: instr.dest,
    dest: instr.tournament,
    amt: DEFAULT_BUY_IN_AMT_LAMP,
  };
  await solProxyClient.transferSol(transferSolPayload);
  return {};
}

export async function enterPlayer(evt: ISubscribeEvt): Promise<any> {
  const PAYMENT_BUFFER_AMT_LAMP = 250;

  if (evt.amt < DEFAULT_BUY_IN_AMT_LAMP && Math.abs(evt.amt - DEFAULT_BUY_IN_AMT_LAMP) < PAYMENT_BUFFER_AMT_LAMP) {
    throw Error(`Payment of ${evt.amt} does not meet the tournament buy in amount ${DEFAULT_BUY_IN_AMT_LAMP} with a margin of error of ${PAYMENT_BUFFER_AMT_LAMP}`);
  }

  const payer: Web3Keypair = await loadWalletKeypairFromFile(DEFAULT_TOURNAMENT_CFG);

  const gameState = gameStateStore.getState();
  const assignedTokens = gameState.mappings.filter(m => m.player === evt.sender);
  if (assignedTokens.length) {
    console.warn(`Token ${assignedTokens.at(0)?.token} has already been assigned to player ${assignedTokens.at(0)?.player}.`);
    return {};
  }

  const availTokens = gameState.mappings.filter(m => m.player === null);
  if (!availTokens.length) {
    console.warn('All tokens have been assigned.');
    const tournamentWeb3Keypair: Web3Keypair = await loadWalletKeypairFromFile(DEFAULT_TOURNAMENT_CFG);
    console.log('Unsubscribing account transaction handler.');
    await solProxyClient.unsubAccTransactions({
      account: tournamentWeb3Keypair.publicKey.toBase58()
    });
    return {};
  }

  const mapping = availTokens.at(0)!;

  const transferMemoInstr = {
    sender: { pk: payer.publicKey.toBase58() } as IKeys,
    payload: {
      type: 'vrtl_nft_transfer',
      from: payer.publicKey.toBase58(),
      to: evt.sender,
      nft_mint: mapping.token,
    }
  };

  console.log(`Payment received, sending player ${evt.sender} token ${mapping.token}`);

  mapping.player = evt.sender;
  await solProxyClient.publishMemo(transferMemoInstr);

  return {};
}

export async function collision(instr: ICollisionInstr): Promise<any> {
  const gameState = gameStateStore.getState();
  gameState.mappings.filter(m => m.token === instr.mint.pk).at(0)!.player = instr.dest.pk;

  const burnTokenMemoInstr = {
    sender: instr.tournament,
    payload: {
      type: 'nft_burn',
      nft_mint: instr.mint.pk,
      ts: Date.now(),
    }
  };

  const burnTokenInstr = {
    payer: instr.tournament,
    owner: instr.tournament,
    mint: instr.mint
  };

  await Promise.all([
    solProxyClient.publishMemo(burnTokenMemoInstr),
    solProxyClient.burnToken(burnTokenInstr)
  ])

  return {};
}

export async function pop(instr: IPopInstr): Promise<any> {
  const gameState = gameStateStore.getState();
  gameState.mappings = gameState.mappings.filter(m => m.token !== instr.mint.pk);

  const burnTokenMemoInstr = {
    sender: instr.tournament,
    payload: {
      type: 'nft_burn',
      nft_mint: instr.mint.pk,
      ts: Date.now(),
    }
  };

  const burnTokenInstr = {
    payer: instr.tournament,
    owner: instr.tournament,
    mint: instr.mint
  };

  await Promise.all([
    solProxyClient.publishMemo(burnTokenMemoInstr),
    solProxyClient.burnToken(burnTokenInstr)
  ])

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
  useExisting: boolean = false
): Promise<Array<IToken>> {
  if (useExisting) {
    const testKps = await loadNTestTokensFromFile(noTokens);
    return testKps.map(kp => ({ owner: { pk: owner } as IKeys, mint: { pk: kp.publicKey.toBase58() } as IKeys } as IToken));
  }

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
