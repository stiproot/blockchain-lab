import path from 'path';
import { ISubscriber, Subscriber } from './listeners';
import { cfgBaseDir, readFileContent } from './utls';
import { fs } from 'mz';
import { ISubscribeAccInstr, ISubscribeEvt, IUnsubscribeAccInstr } from './types';
import { HttpClient } from './http.client';

require("dotenv").config();

const DEFAULT_SUBS_DIR = '.subscribers';

const httpClient = new HttpClient();

export interface ISubStore {
  loadSubs(): Promise<void>;
  getSub(key: string): ISubscriber | null;
  addSub(instr: ISubscribeAccInstr, sub: ISubscriber): void;
  removeSub(instr: IUnsubscribeAccInstr): void;
}

export class SubStore implements ISubStore {
  private readonly _memoryStore: any = {};

  constructor() {
    this.loadSubs()
      .then(
        _ => console.log('Subs loaded.'),
        err => console.error('Failed to load subs.', err)
      );
  }

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

  removeSub(instr: IUnsubscribeAccInstr): void {
    delSubFile(instr);
    delete this._memoryStore[instr.account];
  }
}

export const subsBaseDir = (): string => path.resolve(path.join(cfgBaseDir(), DEFAULT_SUBS_DIR));
export const subFilePath = (fileName: string): string => path.join(subsBaseDir(), fileName);

export async function readSubsFromDir(): Promise<Array<ISubscribeAccInstr>> {
  const cfgFiles = fs.readdirSync(subsBaseDir());
  console.log('readSubsFromDir()', 'cfgFiles', cfgFiles);
  return await Promise.all(cfgFiles.map(async c => JSON.parse(await readFileContent(subFilePath(c))) as ISubscribeAccInstr));
}

export function writeSubToFile(instr: ISubscribeAccInstr) {
  const filePath = path.join(subsBaseDir(), `${instr.account}.json`);
  const content = JSON.stringify(instr);
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
}

export function delSubFile(instr: IUnsubscribeAccInstr) {
  const filePath = path.join(subsBaseDir(), `${instr.account}.json`);
  fs.unlinkSync(filePath);
}

export async function delSubsFromDir(): Promise<void> {
  const cfgFiles = fs.readdirSync(subsBaseDir());
  await Promise.all(cfgFiles.map(c => fs.unlink(path.join(subsBaseDir(), c))));
  console.log('delSubsFromDir()', 'subs deleted');
}