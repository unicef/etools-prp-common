import {store} from '@etools-apps/prp/redux/store';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

const pdListStatuses: any = {
  Signed: 'signed',
  Active: 'active',
  Suspended: 'suspended',
  Ended: 'ended',
  Closed: 'closed',
  Terminated: 'terminated',
  All: 'all'
};

export const waitForIronOverlayToClose = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const getCurrentPath = () => {
  return store.getState()?.app?.routeDetails?.path;
};

export const buildUrl = (baseUrl: string, tail: string) => {
  if (tail.length && tail[0] !== '/') {
    tail = '/' + tail;
  }
  return baseUrl + tail;
};

export const valueWithDefaultStatuses = (value: any, defaultValue: any = '...') => {
  if (pdListStatuses[value] !== undefined) {
    return getTranslation(pdListStatuses[value]);
  }

  return value == null ? defaultValue : value;
};