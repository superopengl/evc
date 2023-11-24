import { User } from '../entity/User';
import _ from 'lodash';


export function sanitizeUser(user: User) {
  return _.pick(user, [
    'id',
    'role',
    'lastLoggedInAt',
    'loginType',
    'profile'
  ]);
}
