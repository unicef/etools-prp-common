import {store} from '../../redux/store';

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
}