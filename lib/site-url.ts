export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'airsoft-armer-team.invalid';
  const url = configured.startsWith('http')
    ? configured
    : `https://${configured}`;
  return url.replace(/\/$/, '');
}
