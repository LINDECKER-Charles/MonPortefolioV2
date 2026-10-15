import { describe, expect, it } from 'vitest';
import { disqueSeRemplit, octets, part } from '../../src/lib/octets';

/**
 * Les tailles de la rubrique Stockage (lib/octets.ts) : base 1000 comme le
 * Finder, une décimale au plus, chiffres français et espace insécable avant
 * l’unité ; puis le seuil d’alerte du disque.
 */
const NBSP = '\u00a0';
const NNBSP = '\u202f';

describe('tailles en octets', () => {
  it('compte en base 1000, de l’octet au téraoctet', () => {
    expect(octets(0)).toBe(`0${NBSP}o`);
    expect(octets(377)).toBe(`377${NBSP}o`);
    expect(octets(999)).toBe(`999${NBSP}o`);
    expect(octets(1000)).toBe(`1${NBSP}Ko`);
    expect(octets(8192)).toBe(`8,2${NBSP}Ko`);
    expect(octets(1_108_935)).toBe(`1,1${NBSP}Mo`);
    expect(octets(3_695_672)).toBe(`3,7${NBSP}Mo`);
    expect(octets(247_984_865_280)).toBe(`248${NBSP}Go`);
    expect(octets(994_662_584_320)).toBe(`994,7${NBSP}Go`);
    expect(octets(2_500_000_000_000)).toBe(`2,5${NBSP}To`);
  });

  it('passe à l’unité suivante plutôt que d’écrire « 1 000 Ko »', () => {
    expect(octets(999_950)).toBe(`1${NBSP}Mo`);
    expect(octets(999_940)).toBe(`999,9${NBSP}Ko`);
  });

  it('groupe les milliers à la française au-delà du téraoctet', () => {
    expect(octets(1_234_500_000_000_000)).toBe(`1${NNBSP}234,5${NBSP}To`);
  });

  it('ne montre jamais une taille négative ou absurde', () => {
    expect(octets(-1)).toBe(`0${NBSP}o`);
    expect(octets(Number.NaN)).toBe(`0${NBSP}o`);
  });
});

describe('parts', () => {
  it('écrit un pour cent entier, et « < 1 % » pour une part infime', () => {
    expect(part(750, 1000)).toBe(`75${NBSP}%`);
    expect(part(1, 1000)).toBe(`<${NBSP}1${NBSP}%`);
    expect(part(0, 1000)).toBe(`0${NBSP}%`);
    expect(part(5, 0)).toBe(`0${NBSP}%`);
  });
});

describe('alerte du disque', () => {
  it('prévient sous 10 % ou sous 2 Go libres', () => {
    expect(disqueSeRemplit({ total: 1_000_000_000_000, available: 248_000_000_000 })).toBe(false);
    expect(disqueSeRemplit({ total: 1_000_000_000_000, available: 99_000_000_000 })).toBe(true);
    expect(disqueSeRemplit({ total: 10_000_000_000, available: 1_999_999_999 })).toBe(true);
    expect(disqueSeRemplit({ total: 10_000_000_000, available: 2_000_000_000 })).toBe(false);
  });
});
