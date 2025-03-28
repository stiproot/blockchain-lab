import { KeyFileStore } from './key.filestore';
import { KeyStateStore } from './key.statestore';
import { IKeyStore } from './keys';
import { ISubStore } from './listeners';
import { SubFileStore } from './subscribers.filestore';
import { SubStateStore } from './subscribers.statestore';

require("dotenv").config();

export function createSubStore(type: string | null = null): ISubStore {
  if (!type) {
    type = process.env.SUB_STORE_TYPE! as string;
  }

  if (type === "filestore") {
    return new SubFileStore();
  }

  if (type === "statestore") {
    return new SubStateStore();
  }

  throw new TypeError("Invalid substore type provided.");
}

export function createKeyStore(type: string | null = null): IKeyStore {
  if (!type) {
    type = process.env.WALLET_STORE_TYPE! as string;
  }

  if (type === "filestore") {
    return new KeyFileStore();
  }

  if (type === "statestore") {
    return new KeyStateStore();
  }

  throw new TypeError("Invalid substore type provided.");
}
