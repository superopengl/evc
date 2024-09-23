import httpAssert from 'http-assert';
import _ from 'lodash';

export function assert(condition, httpCode = 500, message?) {
  httpAssert(condition, httpCode, message);
}


