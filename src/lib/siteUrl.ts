/**
 * Resolves the public site base URL for transactional emails, OAuth callbacks, and payment tracking.
 * Prevents internal reverse-proxy or local default addresses (like localhost:3000) from leaking into emails.
 */
export function getSiteBaseUrl(request?: Request): string {
  // 1. Inspect incoming request headers from user browser / reverse proxy
  if (request) {
    // Check Origin header
    const origin = request.headers.get('origin');
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/+$/, '');
    }

    // Check X-Forwarded-Host (from Nginx, Cloudflare, AWS, etc.)
    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      return `${proto}://${forwardedHost}`.replace(/\/+$/, '');
    }

    // Check Referer header (e.g. user was submitting form from https://mewak.org/...)
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const u = new URL(referer);
        if (u.hostname && !u.hostname.includes('localhost') && !u.hostname.includes('127.0.0.1')) {
          return `${u.protocol}//${u.host}`.replace(/\/+$/, '');
        }
      } catch {}
    }

    // Check Host header
    const host = request.headers.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 2. Check NEXT_PUBLIC_SITE_URL environment variable if it points to a public domain
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  // 3. Fallback for local developer testing on localhost
  if (request) {
    const origin = request.headers.get('origin');
    if (origin) return origin.replace(/\/+$/, '');

    const host = request.headers.get('host');
    if (host) {
      const proto = request.headers.get('x-forwarded-proto') || 'http';
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  // 4. Production fallback: Official Mewak Luxury domain
  return 'https://mewak.org';
}
