import { escapeHtml } from './escapeHtml';

/**
 * Renders a person payload (as returned by cv-bff-node) into an HTML string
 * for the résumé landing page. Kept pure/DOM-free so it's trivial to unit test.
 */
export function renderCvCard(person) {
  const { name, headline, location, summary } = person;

  return `
    <article class="cv-card">
      <h1>${escapeHtml(name)}</h1>
      ${headline ? `<p class="headline">${escapeHtml(headline)}</p>` : ''}
      ${location ? `<p class="location">${escapeHtml(location)}</p>` : ''}
      ${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ''}
    </article>
  `.trim();
}
