import { escapeHtml } from './escapeHtml';

/**
 * Section renderers for the aggregate CV payload (GET /bff/api/v1/people/:id/cv).
 * Same shape as cvCard.js: pure, DOM-free, return HTML strings.
 *
 * - Entries render in the order received. Ordering is owned by the domain
 *   service (api-contract § Ordering); never sort here.
 * - An empty array renders nothing — no empty heading.
 * - Optional fields arrive as `null` (contract rule 7) and are omitted.
 * - `endDate: null` means "current" (contract rule 3) and renders as "Present".
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PROFICIENCY_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

export function renderExperience(experiences) {
  return renderSection('experience', 'Experience', experiences, (e) => `
      <li>
        <h3>${escapeHtml(e.role)} · ${escapeHtml(e.company)}</h3>
        ${renderPeriod(e.startDate, e.endDate)}
        ${optional('location', e.location)}
        ${optional('description', e.description)}
      </li>`);
}

export function renderEducation(education) {
  return renderSection('education', 'Education', education, (e) => `
      <li>
        <h3>${escapeHtml(e.degree)} · ${escapeHtml(e.institution)}</h3>
        ${optional('field', e.fieldOfStudy)}
        ${renderPeriod(e.startDate, e.endDate)}
      </li>`);
}

export function renderSkills(skills) {
  return renderSection('skills', 'Skills', skills, (s) => `
      <li>
        <span class="skill-name">${escapeHtml(s.name)}</span>
        ${isPresent(s.category) ? `<span class="skill-category">${escapeHtml(s.category)}</span>` : ''}
        ${isPresent(s.proficiency) ? `<span class="skill-proficiency">${escapeHtml(PROFICIENCY_LABELS[s.proficiency] ?? s.proficiency)}</span>` : ''}
      </li>`);
}

export function renderProjects(projects) {
  return renderSection('projects', 'Projects', projects, (p) => `
      <li>
        <h3>${escapeHtml(p.name)}</h3>
        ${renderPeriod(p.startDate, p.endDate)}
        ${optional('description', p.description)}
        ${isPresent(p.repoUrl) ? `<p class="repo">${renderRepoLink(p.repoUrl)}</p>` : ''}
      </li>`);
}

function renderSection(className, heading, items, renderItem) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }
  return `
    <section class="cv-section ${className}">
      <h2>${heading}</h2>
      <ul>${items.map(renderItem).join('')}
      </ul>
    </section>
  `.trim();
}

function isPresent(value) {
  return value !== null && value !== undefined && value !== '';
}

function optional(className, value) {
  return isPresent(value) ? `<p class="${className}">${escapeHtml(value)}</p>` : '';
}

/**
 * Projects are the only section with a nullable startDate. An undated project
 * has no period at all — "Present" alone would claim it is ongoing.
 */
function renderPeriod(startDate, endDate) {
  if (!isPresent(startDate)) {
    return isPresent(endDate) ? `<p class="period">${escapeHtml(formatDate(endDate))}</p>` : '';
  }
  const end = isPresent(endDate) ? formatDate(endDate) : 'Present';
  return `<p class="period">${escapeHtml(formatDate(startDate))} – ${escapeHtml(end)}</p>`;
}

/** 'YYYY-MM-DD' → 'Mon YYYY'; anything unexpected is shown as received. */
function formatDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(isoDate));
  const month = match && MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : String(isoDate);
}

/**
 * Only absolute http(s) URLs become links. The value is parsed with the WHATWG
 * URL parser — the same algorithm the browser applies to href — so whitespace,
 * tab/newline and control-character tricks around a `javascript:` scheme are
 * resolved before the scheme check, and the href emitted is the parser's own
 * normalized serialization. Anything else renders as escaped text.
 */
function renderRepoLink(repoUrl) {
  const text = escapeHtml(repoUrl);
  let url;
  try {
    url = new URL(String(repoUrl));
  } catch {
    return text;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return text;
  }
  return `<a href="${escapeHtml(url.href)}" rel="noopener noreferrer">${text}</a>`;
}
