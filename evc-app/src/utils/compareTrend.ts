import _ from 'lodash';

export function compareTrend(currentValue, preValue): -1 | 0 | 1 {
  if (_.isNumber(currentValue) && _.isNumber(preValue)) {
    return currentValue === preValue ? 0 : currentValue > preValue ? 1 : -1;
  }
  return 0;
}

