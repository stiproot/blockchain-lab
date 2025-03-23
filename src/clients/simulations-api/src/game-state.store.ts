
export interface ITokenPlayerMap {
  token: string;
  player: string | null;
}

export interface IGameState {
  mappings: Array<ITokenPlayerMap>;
}

export interface IGameStateStore {
  getState(): IGameState;
  setState(state: IGameState): void;
}

export class GameStateStore implements IGameStateStore {
  private readonly _memoryStore: any = {};

  getState(): IGameState {
    return this._memoryStore['state'] as IGameState;
  }

  setState(state: IGameState): void {
    this._memoryStore['state'] = state;
  }
}