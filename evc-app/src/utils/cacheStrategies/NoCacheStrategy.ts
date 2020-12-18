import { ICacheStrategy } from "./ICacheStrategy";


export class NoCacheStrategy implements ICacheStrategy {
  getExpireSeconds(): number {
    return 0;
  }
}
