import { renderCvCard } from './cvCard';

const BFF_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:3000';
const PERSON_ID = import.meta.env.VITE_PERSON_ID || '1';

async function main() {
  const app = document.getElementById('app');

  try {
    const response = await fetch(`${BFF_URL}/api/v1/people/${PERSON_ID}`);
    if (!response.ok) {
      throw new Error(`BFF responded with ${response.status}`);
    }
    const person = await response.json();
    app.innerHTML = renderCvCard(person);
  } catch (err) {
    app.innerHTML = `<p role="alert">Could not load résumé: ${err.message}</p>`;
  }
}

main();
