import * as moment from 'moment-timezone';
import { getNextTickMoment } from './computeSecondsToNextUpdateTime';
import { ICacheStrategy } from "./ICacheStrategy";


export class ScheduledClockCacheStrategy implements ICacheStrategy {
  private clocks: number[];
  constructor(...clocks) {
    this.clocks = clocks;
  }

  getExpireSeconds(): number {
    const now = moment();
    const nextTickMoment = getNextTickMoment(this.clocks, now);
    const duration = moment.duration(nextTickMoment.diff(now));
    return Math.ceil(duration.asSeconds());
  }
}
