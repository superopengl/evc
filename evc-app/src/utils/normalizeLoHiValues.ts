import * as _ from 'lodash';


export function normalizeLoHiValues(entity, allowNil = false) {
  const { lo, hi } = entity;
  const isLoNil = _.isNil(lo);
  const isHiNil = _.isNil(hi);
  if (isLoNil && isHiNil) {
    if (!allowNil) {
      throw new Error('Both lo and hi are nil');
    }

    return entity;
  }

  if (isLoNil) {
    entity.lo = entity.hi;
  } else if (isHiNil) {
    entity.hi = entity.lo;
  }

  return entity;
}
