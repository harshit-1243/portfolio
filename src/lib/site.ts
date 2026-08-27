/**
 * Site origin, resolved at build time.
 *
 * On Vercel this fills itself in from the deployment URL, so the free
 * *.vercel.app domain works with no edit. Set NEXT_PUBLIC_SITE_URL once a
 * custom domain is attached.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
