import { describe, expect, it } from 'vitest';
import { typo } from '../../src/lib/typo';

describe('typographie française', () => {
  it('pose une espace insécable avant les signes doubles', () => {
    expect(typo('Structurer le pôle : accueillir ; former ! Pourquoi ?')).toBe(
      'Structurer le pôle : accueillir ; former ! Pourquoi ?',
    );
  });

  it('et à l’intérieur des guillemets', () => {
    expect(typo('« la seule chose qui a changé »')).toBe('« la seule chose qui a changé »');
  });

  it('ne touche ni aux adresses ni aux heures', () => {
    expect(typo('https://charles-lindecker.com à 14:30')).toBe('https://charles-lindecker.com à 14:30');
  });

  it('est idempotente', () => {
    const une = typo('Voir : ici');
    expect(typo(une)).toBe(une);
  });
});
