// Shared production backend — same Next.js API + Postgres database as the web storefront.
// Must point at the canonical domain directly: the old .vercel.app alias now 301-redirects
// here, and Android's networking stack converts a redirected POST into a GET, which broke
// sign-in (a GET to a POST-only route returns 405).
export const API_BASE_URL = 'https://winejoint.rw/api';

// Google Play requires the privacy policy to be reachable from inside the app.
export const PRIVACY_POLICY_URL = 'https://winejoint.rw/privacy';
