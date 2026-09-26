import { describe, expect, it, vi } from 'vitest';
import { escapeHtml } from './escapeHtml';
import { renderCvCard } from './cvCard';
import { renderEducation, renderExperience, renderProjects, renderSkills } from './sections';

// One escaping implementation for the whole site: every renderer must go
// through the shared module, not a private copy.
vi.mock('./escapeHtml', async (importOriginal) => {
  const real = await importOriginal();
  return { escapeHtml: vi.fn(real.escapeHtml) };
});

describe('shared escapeHtml', () => {
  it.each([
    ['renderCvCard', () => renderCvCard({ name: 'Jane' })],
    ['renderExperience', () => renderExperience([{ company: 'A', role: 'B', startDate: '2022-01-01', endDate: null }])],
    ['renderEducation', () => renderEducation([{ institution: 'A', degree: 'B', startDate: '2022-01-01', endDate: null }])],
    ['renderSkills', () => renderSkills([{ name: 'A', category: null, proficiency: 'EXPERT' }])],
    ['renderProjects', () => renderProjects([{ name: 'A', startDate: null, endDate: null }])],
  ])('%s escapes through the shared module', (_, render) => {
    escapeHtml.mockClear();
    render();
    expect(escapeHtml).toHaveBeenCalled();
  });
});
