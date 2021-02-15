import * as moment from 'moment-timezone';

export const ET_TIMEZONE_NAME = 'America/New_York';

export function getNextTickMoment(scheduledEtTimes: number[], now: moment.Moment): moment.Moment {
  const todayStart = moment(now).tz(ET_TIMEZONE_NAME).startOf('day');
  for (let i = 0; i < scheduledEtTimes.length; i++) {
    const nextTickClock = scheduledEtTimes[i];
    const nextTickAt = moment(todayStart).set({ hour: nextTickClock });
    if (nextTickAt.isAfter(now)) {
      return nextTickAt;
    }
  }

  const tomorrowFirstTick = moment(todayStart).add(1, 'day').set({ hour: scheduledEtTimes[0] });
  return tomorrowFirstTick;
}
