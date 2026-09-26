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

function aggregate(overrides = {}) {
  return {
    name: 'Jane Doe', headline: 'Full-Stack Engineer', location: 'Remote', summary: null,
    experiences: [{ company: 'ACME', role: 'Engineer', location: 'Remote', startDate: '2022-01-01', endDate: null, description: null }],
    education: [{ institution: 'UNED', degree: 'BSc', fieldOfStudy: null, startDate: '2015-09-01', endDate: '2019-06-30' }],
    skills: [{ name: 'TypeScript', category: 'Languages', proficiency: 'EXPERT' }],
    projects: [{ name: 'cv-project', description: null, repoUrl: 'https://github.com/erfeamor/cv', startDate: '2026-07-01', endDate: null }],
    ...overrides,
  };
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

  it('fetches the aggregate CV exactly once, from the BFF public edge path /bff/api/v1', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => aggregate() });

    await runMain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/bff/api/v1/people/1/cv');
  });

  it('renders the header card and all four sections from the one payload, and no alert', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => aggregate() });

    const app = await runMain();

    expect(app.querySelector('.cv-card h1').textContent).toBe('Jane Doe');
    expect(app.innerHTML).toContain('Full-Stack Engineer');
    expect([...app.querySelectorAll('h2')].map((h) => h.textContent))
      .toEqual(['Experience', 'Education', 'Skills', 'Projects']);
    expect(app.textContent).toContain('ACME');
    expect(app.textContent).toContain('UNED');
    expect(app.textContent).toContain('TypeScript');
    expect(app.textContent).toContain('cv-project');
    expect(app.querySelector('[role="alert"]')).toBeNull();
  });

  it('renders each section in the order received, without sorting', async () => {
    // deliberately out of the contract's order: the client must not "fix" it
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => aggregate({
        experiences: [
          { company: 'Older', role: 'R', location: null, startDate: '2010-01-01', endDate: '2011-01-01', description: null },
          { company: 'Newer', role: 'R', location: null, startDate: '2020-01-01', endDate: null, description: null },
        ],
        skills: [
          { name: 'Zig', category: null, proficiency: 'BEGINNER' },
          { name: 'Ada', category: 'Languages', proficiency: 'EXPERT' },
        ],
      }),
    });

    const app = await runMain();

    const text = app.textContent;
    expect(text.indexOf('Older')).toBeLessThan(text.indexOf('Newer'));
    expect(text.indexOf('Zig')).toBeLessThan(text.indexOf('Ada'));
  });

  it('omits a section whose array is empty', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => aggregate({ projects: [] }) });

    const app = await runMain();

    expect([...app.querySelectorAll('h2')].map((h) => h.textContent))
      .toEqual(['Experience', 'Education', 'Skills']);
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
