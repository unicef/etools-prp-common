function getBasePath() {
  return document.getElementsByTagName('base')[0].href;
}

export const getDomainByEnv = () => {
  return getBasePath().slice(0, -1);
};

export const BASE_PATH = getBasePath().replace(window.location.origin, '').slice(1, -1);

export function getCorrespondingEtoolsEnvironment() {
  const host = window.location.host;
  switch (host) {
    case 'prp.localhost:8081':
      return 'http://etools.localhost:8082';
    case 'dev.partnerreportingportal.org':
      return 'https://etools-dev.unicef.org';
    case 'staging.partnerreportingportal.org':
      return 'https://etools-staging.unicef.org';
    case 'demo.partnerreportingportal.org':
      return 'https://etools-demo.unicef.org';
    case 'www.partnerreportingportal.org':
      return 'https://etools.unicef.org';
    default:
      // It defaults to prod just in case www is not considered in all browser
      return 'https://etools.unicef.org';
  }
}
