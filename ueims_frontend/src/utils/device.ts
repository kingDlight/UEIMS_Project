export const getDeviceId = (): string => {
  return localStorage.getItem('ueims-device-id') ?? 'web-unknown';
};

export const initDeviceId = (): void => {
  if (!localStorage.getItem('ueims-device-id')) {
    localStorage.setItem('ueims-device-id', crypto.randomUUID ? crypto.randomUUID() : 'device-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36));
  }
};
