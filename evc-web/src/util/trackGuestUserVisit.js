import { v4 as uuidv4 } from 'uuid';
import { reactLocalStorage } from 'reactjs-localstorage';
import { guestUserPing } from 'services/userService';

const DEVICE_ID_KEY = 'deviceId';

function getDeviceId() {
  const deviceId = reactLocalStorage.get(DEVICE_ID_KEY, uuidv4());
  reactLocalStorage.set(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function trackGuestUserVisit() {
  const deviceId = getDeviceId();
  guestUserPing(deviceId).catch(() => { });
}
