import { HttpClient } from "./http-client";

require("dotenv").config();

const MINT_TOKEN_ROUTE = `sol/cmd/mint-token`;
const MINT_TOKENS_ROUTE = `sol/cmd/mint-tokens`;
const TRANSFER_SOL_ROUTE = `sol/cmd/transfer-sol`;
const TRANSFER_TOKEN_ROUTE = `sol/cmd/transfer-token`;
const BURN_TOKEN_ROUTE = `sol/cmd/burn-token`;

export class SolProxyClient {
  private readonly _baseUrl: string;
  private readonly _httpClient: HttpClient;

  constructor() {
    this._baseUrl = process.env.SOL_PROXY_API_HOST!;
    this._httpClient = new HttpClient(this._baseUrl);
  }

  async mintToken(payload: any): Promise<any> {
    return await this._httpClient.post(MINT_TOKEN_ROUTE, payload);
  }

  async mintTokens(payload: any): Promise<any> {
    return await this._httpClient.post(MINT_TOKENS_ROUTE, payload);
  }

  async transferSol(payload: any): Promise<any> {
    return await this._httpClient.post(TRANSFER_SOL_ROUTE, payload);
  }

  async transferToken(payload: any): Promise<any> {
    return await this._httpClient.post(TRANSFER_TOKEN_ROUTE, payload);
  }

  async burnToken(payload: any): Promise<any> {
    return await this._httpClient.post(BURN_TOKEN_ROUTE, payload);
  }
}
