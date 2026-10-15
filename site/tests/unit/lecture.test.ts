import { describe, expect, it } from 'vitest';
import { compterMots, minutesDeLecture, MOTS_PAR_MINUTE } from '../../src/lib/lecture';

describe('durée de lecture', () => {
  it('compte les mots lus, pas le balisage', () => {
    expect(compterMots('<p>Je maîtrise <mark class="surligne">d’abord</mark> les règles.</p>')).toBe(5);
  });

  it('ignore scripts, styles et figures dessinées', () => {
    const html = '<p>Un deux</p><script>trois quatre</script><style>.cinq{}</style><svg><text>six sept</text></svg>';
    expect(compterMots(html)).toBe(2);
  });

  it('une espace insécable sépare deux mots ; la ponctuation seule n’en est pas un', () => {
    expect(compterMots('<p>13&nbsp;ans : « oui »</p>')).toBe(3);
  });

  it('arrondit à la minute, jamais en dessous d’une', () => {
    expect(minutesDeLecture('<p>court</p>')).toBe(1);
    const mots = Array.from({ length: MOTS_PAR_MINUTE * 7 + 10 }, () => 'mot').join(' ');
    expect(minutesDeLecture(`<p>${mots}</p>`)).toBe(7);
  });
});
