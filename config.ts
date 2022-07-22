function getBasePath() {
  return document.getElementsByTagName('base')[0].href;
}

export const getDomainByEnv = () => {
  return getBasePath().slice(0, -1);
};

export const BASE_PATH = getBasePath().replace(window.location.origin, '').slice(1, -1);
