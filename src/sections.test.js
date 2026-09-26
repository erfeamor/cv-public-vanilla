import { describe, expect, it } from 'vitest';
import { renderEducation, renderExperience, renderProjects, renderSkills } from './sections';

const XSS = '<script>alert("x")</script>';
const XSS_ESCAPED = '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;';

function expectEscaped(html) {
  expect(html).not.toContain('<script>');
  expect(html).not.toContain('"x"');
  expect(html).toContain(XSS_ESCAPED);
}

function indexesOf(html, needles) {
  return needles.map((n) => html.indexOf(n));
}

describe('renderExperience', () => {
  const acme = {
    company: 'ACME', role: 'Backend Engineer', location: 'Remote',
    startDate: '2022-01-01', endDate: null, description: 'Built things',
  };
  const initech = {
    company: 'Initech', role: 'Intern', location: null,
    startDate: '2024-03-01', endDate: '2024-09-30', description: null,
  };

  it('renders every entry with its fields, in the order received', () => {
    const html = renderExperience([acme, initech]);

    expect(html).toContain('<h2>Experience</h2>');
    ['ACME', 'Backend Engineer', 'Remote', 'Built things', 'Initech', 'Intern'].forEach((s) =>
      expect(html).toContain(s));
    expect(html).toContain('Jan 2022');
    expect(html).toContain('Mar 2024');
    expect(html).toContain('Sep 2024');
    // input is deliberately not startDate DESC: output must not re-sort it
    const [a, b] = indexesOf(html, ['ACME', 'Initech']);
    expect(a).toBeLessThan(b);
  });

  it('renders a null endDate as "Present"', () => {
    expect(renderExperience([acme])).toContain('Jan 2022 – Present');
  });

  it('omits null optional fields instead of printing "null"', () => {
    const html = renderExperience([initech]);

    expect(html).not.toContain('null');
    expect(html).not.toContain('class="location"');
    expect(html).not.toContain('class="description"');
  });

  it('renders nothing for an empty array', () => {
    expect(renderExperience([])).toBe('');
  });

  it('escapes every user string field', () => {
    const html = renderExperience([{
      company: XSS, role: XSS, location: XSS, startDate: '2022-01-01', endDate: null, description: XSS,
    }]);

    expectEscaped(html);
    expect(html.split(XSS_ESCAPED)).toHaveLength(5);
  });
});

describe('renderEducation', () => {
  const uned = {
    institution: 'UNED', degree: 'BSc', fieldOfStudy: 'Computer Science',
    startDate: '2015-09-01', endDate: '2019-06-30',
  };
  const mit = {
    institution: 'MIT', degree: 'MSc', fieldOfStudy: null, startDate: '2020-09-01', endDate: null,
  };

  it('renders every entry with its fields, in the order received', () => {
    const html = renderEducation([uned, mit]);

    expect(html).toContain('<h2>Education</h2>');
    ['UNED', 'BSc', 'Computer Science', 'MIT', 'MSc', 'Sep 2015 – Jun 2019'].forEach((s) =>
      expect(html).toContain(s));
    const [a, b] = indexesOf(html, ['UNED', 'MIT']);
    expect(a).toBeLessThan(b);
  });

  it('renders a null endDate as "Present"', () => {
    expect(renderEducation([mit])).toContain('Sep 2020 – Present');
  });

  it('omits a null fieldOfStudy instead of printing "null"', () => {
    const html = renderEducation([mit]);

    expect(html).not.toContain('null');
    expect(html).not.toContain('class="field"');
  });

  it('renders nothing for an empty array', () => {
    expect(renderEducation([])).toBe('');
  });

  it('escapes every user string field', () => {
    const html = renderEducation([{
      institution: XSS, degree: XSS, fieldOfStudy: XSS, startDate: '2015-09-01', endDate: null,
    }]);

    expectEscaped(html);
    expect(html.split(XSS_ESCAPED)).toHaveLength(4);
  });
});

describe('renderSkills', () => {
  it('renders every skill with its category and proficiency, in the order received', () => {
    const html = renderSkills([
      { name: 'TypeScript', category: 'Languages', proficiency: 'EXPERT' },
      { name: 'Docker', category: null, proficiency: 'INTERMEDIATE' },
      { name: 'Java', category: 'Languages', proficiency: 'ADVANCED' },
    ]);

    expect(html).toContain('<h2>Skills</h2>');
    ['TypeScript', 'Languages', 'Expert', 'Docker', 'Intermediate', 'Java', 'Advanced'].forEach((s) =>
      expect(html).toContain(s));
    const [a, b, c] = indexesOf(html, ['TypeScript', 'Docker', 'Java']);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('omits a null category instead of printing "null"', () => {
    const html = renderSkills([{ name: 'Docker', category: null, proficiency: 'BEGINNER' }]);

    expect(html).not.toContain('null');
    expect(html).not.toContain('class="skill-category"');
  });

  it('renders nothing for an empty array', () => {
    expect(renderSkills([])).toBe('');
  });

  it('escapes every user string field, including an unexpected proficiency', () => {
    const html = renderSkills([{ name: XSS, category: XSS, proficiency: XSS }]);

    expectEscaped(html);
    expect(html.split(XSS_ESCAPED)).toHaveLength(4);
  });
});

describe('renderProjects', () => {
  const cvProject = {
    name: 'cv-project', description: 'This CV', repoUrl: 'https://github.com/erfeamor/cv',
    startDate: '2026-07-01', endDate: null,
  };
  const undated = { name: 'Side thing', description: null, repoUrl: null, startDate: null, endDate: null };

  it('renders every entry with its fields, in the order received', () => {
    const html = renderProjects([undated, cvProject]);

    expect(html).toContain('<h2>Projects</h2>');
    ['cv-project', 'This CV', 'Side thing'].forEach((s) => expect(html).toContain(s));
    expect(html).toContain('<a href="https://github.com/erfeamor/cv" rel="noopener noreferrer">');
    const [a, b] = indexesOf(html, ['Side thing', 'cv-project']);
    expect(a).toBeLessThan(b);
  });

  it('renders a null endDate as "Present"', () => {
    expect(renderProjects([cvProject])).toContain('Jul 2026 – Present');
  });

  it('omits null optional fields, and the period of an undated project', () => {
    const html = renderProjects([undated]);

    expect(html).not.toContain('null');
    expect(html).not.toContain('Present');
    expect(html).not.toContain('class="period"');
    expect(html).not.toContain('class="description"');
    expect(html).not.toContain('class="repo"');
  });

  it('renders nothing for an empty array', () => {
    expect(renderProjects([])).toBe('');
  });

  it('escapes every user string field', () => {
    const html = renderProjects([{
      name: XSS, description: XSS, repoUrl: XSS, startDate: null, endDate: null,
    }]);

    expectEscaped(html);
    expect(html.split(XSS_ESCAPED)).toHaveLength(4);
  });

  it('escapes an http(s) repoUrl inside the href', () => {
    const html = renderProjects([{ ...cvProject, repoUrl: 'https://example.com/"><script>x</script>' }]);

    expect(html).not.toContain('<script>');
    expect(html).toContain('<a href="https://example.com/%22%3E%3Cscript%3Ex%3C/script%3E" rel=');
    expect(html).toContain('&quot;&gt;&lt;script&gt;x&lt;/script&gt;</a>');
  });

  it.each(['http://example.com/a', 'HTTPS://example.com/a'])('links %s', (repoUrl) => {
    const html = renderProjects([{ ...cvProject, repoUrl }]);

    expect(html).toMatch(/<a href="https?:\/\/example\.com\/a"/);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0000javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example/x',
    'github.com/erfeamor/cv',
  ])('never turns %j into a link', (repoUrl) => {
    const html = renderProjects([{ ...cvProject, repoUrl }]);

    expect(html).not.toContain('<a');
    expect(html).not.toContain('href');
    expect(html).not.toContain('<script>');
    expect(html).toContain('class="repo"');
  });
});
