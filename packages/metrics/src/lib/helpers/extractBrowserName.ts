import { UAParser } from 'ua-parser-js';

export function extractUserAgentLabel(uaString: string): string {
  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const isBrowser = !!browser.name && browser.name !== 'Other';

  if (isBrowser) {
    return `${browser.name} ${browser.version?.split('.')[0] ?? ''}`.trim(); // e.g., Chrome 138
  }

  // fallback: use first word of UA (e.g., Prometheus/2.47.0 → Prometheus)
  return uaString.split(/[/\s;]/)[0] || 'unknown';
}
