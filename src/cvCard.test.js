import { describe, expect, it } from 'vitest';
import { renderCvCard } from './cvCard';

describe('renderCvCard', () => {
  it('renders the required fields', () => {
    const html = renderCvCard({ name: 'Jane Doe', headline: 'Engineer', location: 'Remote', summary: 'Bio' });

    expect(html).toContain('Jane Doe');
    expect(html).toContain('Engineer');
    expect(html).toContain('Remote');
    expect(html).toContain('Bio');
  });

  it('omits optional fields when absent', () => {
    const html = renderCvCard({ name: 'Jane Doe' });

    expect(html).toContain('Jane Doe');
    expect(html).not.toContain('headline');
    expect(html).not.toContain('location');
  });

  it('escapes HTML in user-supplied fields', () => {
    const html = renderCvCard({ name: '<script>alert(1)</script>' });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
