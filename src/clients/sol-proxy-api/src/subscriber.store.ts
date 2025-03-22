import path from 'path';
import { ISubscriber, Subscriber } from './listeners';
import { cfgBaseDir, readFileContent } from './utls';
import { fs } from 'mz';
import { ISubscribeAccInstr, ISubscribeEvt } from './types';
import { HttpClient } from './http.client';

require("dotenv").config();

const DEFAULT_SUBS_DIR = '.subscribers';

const httpClient = new HttpClient();

export interface ISubStore {
  loadSubs(): Promise<void>;
  getSub(key: string): ISubscriber | null;
  addSub(instr: ISubscribeAccInstr, sub: ISubscriber): void;
}

export class SubStore implements ISubStore {
  private readonly _memoryStore: any = {};

  async loadSubs(): Promise<void> {
    const instrs = await readSubsFromDir();
    for (const i of instrs) {

      const fn = async (evt: ISubscribeEvt) => {
        evt.extId = i.extId;
        console.log('sub-evt', evt);
        await httpClient.post(i.webhookUrl, evt);
      };

      const sub = new Subscriber(i.account, fn);
      this.addSub(i, sub.start());
    }
  }

  getSub(key: string): ISubscriber | null {
    if (key in this._memoryStore) {
      return this._memoryStore[key];
    }
    return null;
  }

  addSub(instr: ISubscribeAccInstr, sub: ISubscriber): void {
    writeSubToFile(instr);
    this._memoryStore[instr.account] = sub;
  }

  removeSub(key: string): void {
    delete this._memoryStore[key];
  }
}

export async function readSubsFromDir(): Promise<Array<ISubscribeAccInstr>> {
  const subCfgDir = path.join(cfgBaseDir(), DEFAULT_SUBS_DIR);
  const cfgFiles = fs.readdirSync(subCfgDir);
  return await Promise.all(cfgFiles.map(async c => JSON.parse(await readFileContent(c)) as ISubscribeAccInstr));
}

export function writeSubToFile(instr: ISubscribeAccInstr) {
  const filePath = path.join(cfgBaseDir(), DEFAULT_SUBS_DIR, `${instr.account}.json`);
  const content = JSON.stringify(instr);
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
}