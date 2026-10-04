import { describe, expect, it } from 'vitest';
import { resolveBffBaseUrl } from './bffUrl';

describe('resolveBffBaseUrl', () => {
  it('returns an empty base (same-origin, relative calls) for a production build with no VITE_BFF_URL', () => {
    expect(resolveBffBaseUrl({ PROD: true, DEV: false })).toBe('');
  });

  it('treats an empty or whitespace-only VITE_BFF_URL as unset in production', () => {
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: '' })).toBe('');
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: '   ' })).toBe('');
  });

  it('falls back to the local BFF on :3000 in dev when VITE_BFF_URL is unset', () => {
    expect(resolveBffBaseUrl({ PROD: false, DEV: true })).toBe('http://localhost:3000');
  });

  it('uses an explicit VITE_BFF_URL in both modes', () => {
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: 'https://cv.example.com' }))
      .toBe('https://cv.example.com');
    expect(resolveBffBaseUrl({ PROD: false, DEV: true, VITE_BFF_URL: 'http://127.0.0.1:3001' }))
      .toBe('http://127.0.0.1:3001');
  });

  it('strips trailing slashes so the base can never yield //bff/...', () => {
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: 'https://x/' })).toBe('https://x');
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: 'https://x//' })).toBe('https://x');
    expect(`${resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: 'https://x/' })}/bff/api/v1/people/1/cv`)
      .toBe('https://x/bff/api/v1/people/1/cv');
  });

  it('reduces an explicit "/" to the same-origin empty base, not a protocol-relative //bff', () => {
    expect(resolveBffBaseUrl({ PROD: true, DEV: false, VITE_BFF_URL: '/' })).toBe('');
  });
});
