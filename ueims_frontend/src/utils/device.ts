export const getDeviceId = (): string => {
  return localStorage.getItem('ueims-device-id') ?? 'web-unknown';
};

export const initDeviceId = (): void => {
  if (!localStorage.getItem('ueims-device-id')) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomStr = array[0].toString(36);
    localStorage.setItem('ueims-device-id', crypto.randomUUID ? crypto.randomUUID() : 'device-' + randomStr + Date.now().toString(36));
  }
};
