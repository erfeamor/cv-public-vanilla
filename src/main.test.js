import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// main.js fetches and mounts on import, so each test sets up #app, stubs
// fetch and env, then imports a fresh copy of the module.
async function runMain() {
  vi.resetModules();
  await import('./main.js');
  const app = document.getElementById('app');
  // main() is async and not awaited by the module; wait until it has rendered.
  await vi.waitFor(() => expect(app.innerHTML).not.toBe(''));
  return app;
}

describe('main', () => {
  let fetchMock;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.stubEnv('VITE_BFF_URL', 'http://localhost:3000');
    vi.stubEnv('VITE_PERSON_ID', '1');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('requests the person from the BFF public edge path /bff/api/v1', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ name: 'Jane Doe' }) });

    await runMain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/bff/api/v1/people/1');
  });

  it('renders the person card and no alert on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Jane Doe', headline: 'Full-Stack Engineer', location: 'Remote' }),
    });

    const app = await runMain();

    expect(app.innerHTML).toContain('Jane Doe');
    expect(app.innerHTML).toContain('Full-Stack Engineer');
    expect(app.querySelector('[role="alert"]')).toBeNull();
  });

  it('renders the alert with the status when the BFF responds non-2xx', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });

    const app = await runMain();

    const alert = app.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toBe('Could not load résumé: BFF responded with 404');
  });

  it('renders the alert when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const app = await runMain();

    const alert = app.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert.textContent).toBe('Could not load résumé: Failed to fetch');
  });
});
