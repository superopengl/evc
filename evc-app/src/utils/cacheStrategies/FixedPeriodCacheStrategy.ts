import * as ms from 'ms';
import { ICacheStrategy } from './ICacheStrategy';


export class FixedPeriodCacheStrategy implements ICacheStrategy {
  constructor(private msExpression) {
  }

  getExpireSeconds(): number {
    return ms(this.msExpression) / 1000;
  }
}


