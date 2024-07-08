import {store} from '../../redux/store';

export const waitForIronOverlayToClose = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const getCurrentPath = () => {
  return store.getState()?.app?.routeDetails?.path;
};
