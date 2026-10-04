import { renderCvCard } from './cvCard';
import { resolveBffBaseUrl } from './bffUrl';
import { escapeHtml } from './escapeHtml';
import { renderEducation, renderExperience, renderProjects, renderSkills } from './sections';

// Pass the fields explicitly (not the whole import.meta.env object) so Vite
// statically replaces each one at build time.
const BFF_URL = resolveBffBaseUrl({
  VITE_BFF_URL: import.meta.env.VITE_BFF_URL,
  PROD: import.meta.env.PROD,
});
const PERSON_ID = import.meta.env.VITE_PERSON_ID || '1';

async function main() {
  const app = document.getElementById('app');

  try {
    // One request for the whole CV: the BFF aggregates person + sections.
    const response = await fetch(`${BFF_URL}/bff/api/v1/people/${PERSON_ID}/cv`);
    if (!response.ok) {
      throw new Error(`BFF responded with ${response.status}`);
    }
    const cv = await response.json();
    app.innerHTML = [
      renderCvCard(cv),
      renderExperience(cv.experiences),
      renderEducation(cv.education),
      renderSkills(cv.skills),
      renderProjects(cv.projects),
    ].join('\n');
  } catch (err) {
    app.innerHTML = `<p role="alert">Could not load résumé: ${escapeHtml(err.message)}</p>`;
  }
}

main();
