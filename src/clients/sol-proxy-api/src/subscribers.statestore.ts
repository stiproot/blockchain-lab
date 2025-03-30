import { Subscriber } from './subscribers';
import { ISubscribeAccInstr, ISubscribeEvt, ISubscriber, ISubStore, IUnsubscribeAccInstr } from './types';
import { HttpClient } from './http.client';

require("dotenv").config();

const httpClient = new HttpClient();

export class SubStateStore implements ISubStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadSubs()
      .then(
        _ => console.log('Subs loaded.'),
        err => console.error('Failed to load subs.', err)
      );
  }

  async loadSubs(): Promise<void> {
    const instrs = await readSubsFromStateStore();
    for (const i of instrs) {

      const fn = async (evt: ISubscribeEvt) => {
        evt.extId = i.extId;
        console.log('sub-evt', evt);
        await httpClient.post(i.webhookUrl, evt);
      };

      const sub = new Subscriber(i.accountPk, fn);
      // await this.addSub(i, sub.start());
    }
  }

  getSub(key: string): ISubscriber | null {
    if (key in this._memoryStore) {
      return this._memoryStore[key];
    }
    return null;
  }

  async addSub(instr: ISubscribeAccInstr, sub: ISubscriber): Promise<void> {
    await writeSubToStateStore(instr);
    this._memoryStore[instr.accountPk] = sub;
  }

  removeSub(instr: IUnsubscribeAccInstr): void {
    // todo: remove from statestore...
    delete this._memoryStore[instr.accountPk];
  }
}

export async function readSubsFromStateStore(): Promise<Array<ISubscribeAccInstr>> {
  const url = process.env.SUBS_STATESTORE_READ_URL!;
  const resp = await httpClient.get<Array<ISubscribeAccInstr>>(url);
  console.log('readSubsFromStateStore()', 'resp', resp);
  return resp;
}

export async function writeSubToStateStore(instr: ISubscribeAccInstr): Promise<void> {
  const url = process.env.SUBS_STATESTORE_WRITE_URL!;
  await httpClient.post(url, [instr]);
}