import * as moment from 'moment-timezone';
import { ET_TIMEZONE_NAME, getNextTickMoment } from './computeSecondsToNextUpdateTime';

function createEtTime(hour, minute) {
  return moment().tz(ET_TIMEZONE_NAME).startOf('day').set({hour, minute});
}

describe('getNextTickMoment', () => {
  it('should update at 5, if now is 4:30', () => {
    const now = createEtTime(4, 30);
    const result = getNextTickMoment([5, 6], now);
    expect(result.isAfter(now)).toBeTruthy();
    expect(result.format('HH:mm')).toEqual('05:00');
  });

  it('should update at 6, if now is 5:01', () => {
    const now = createEtTime(5, 1);
    const result = getNextTickMoment([5, 6], now);
    expect(result.isAfter(now)).toBeTruthy();
    expect(result.format('HH:mm')).toEqual('06:00');
  });

  it('should update at 5, if now is 6:01', () => {
    const now = createEtTime(6, 1);
    const result = getNextTickMoment([5, 6], now);
    expect(result.isAfter(now)).toBeTruthy();
    expect(result.format('HH:mm')).toEqual('05:00');
  });
});