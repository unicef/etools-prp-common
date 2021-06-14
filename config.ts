export const BASE_PATH = document.getElementsByTagName('base')[0].href.replace(window.location.origin, '').replace('/', '') || 'ip';

export const getDomainByEnv = () => {
  return document.getElementsByTagName('base')[0].href;
};
