// TBv3 is served from app.v3[.<env>].openconceptlab.org until it becomes the default Term Browser
// at app[.<env>].openconceptlab.org; either host names the same environment.
export const getEnv = forURL => {
  const fqdn = window.location.origin.replace('://app.v3.', '://app.');

  if(fqdn.match('app.staging.openconceptlab'))
    return 'staging';
  if(fqdn.match('app.qa.openconceptlab'))
    return 'qa';
  if(fqdn.match('app.demo.openconceptlab'))
    return 'demo';
  if(fqdn.match('app.dev.openconceptlab'))
    return 'dev';
  if(fqdn.match('app.staging.who.openconceptlab'))
    return forURL ? 'staging.who' : 'staging-who';
  if(fqdn.match('app.openconceptlab'))
    return forURL ? '' : 'production';

  return 'development';
}
