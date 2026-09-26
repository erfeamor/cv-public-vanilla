import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it('escapes the HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('stringifies non-string values', () => {
    expect(escapeHtml(42)).toBe('42');
  });
});
