import { describe, expect, it } from 'vitest';
import {
  commandeClaudeCode,
  commandeRetrait,
  depuis,
  libellesPermissions,
  nomPropose,
  nomServeur,
  permissionsDe,
  PREREGLAGE_PAR_DEFAUT,
  PREREGLAGES,
} from '../../src/lib/acces-mcp';

/**
 * Accès MCP du backoffice (lib/acces-mcp.ts) : les permissions envoyées au
 * backend, leurs libellés, le nom proposé et la commande Claude Code.
 */
describe('préréglages des accès MCP', () => {
  it('rédige par défaut, sans jamais ouvrir les demandes de contact', () => {
    expect(PREREGLAGE_PAR_DEFAUT).toBe('redaction');
    expect(permissionsDe('redaction', false)).toEqual(['blog:read', 'blog:write']);
    expect(permissionsDe('lecture', false)).toEqual(['blog:read']);
    expect(permissionsDe('publication', false)).toEqual(['blog:read', 'blog:write', 'blog:publish']);
    for (const prereglage of Object.keys(PREREGLAGES) as (keyof typeof PREREGLAGES)[]) {
      expect(permissionsDe(prereglage, false)).not.toContain('contacts:read');
    }
  });

  it('ajoute les demandes de contact seulement quand la case est cochée', () => {
    expect(permissionsDe('redaction', true)).toEqual(['contacts:read', 'blog:read', 'blog:write']);
  });

  it('respecte la chaîne du backend : écrire exige lire, publier exige écrire', () => {
    for (const prereglage of Object.keys(PREREGLAGES) as (keyof typeof PREREGLAGES)[]) {
      const permissions = permissionsDe(prereglage, true);
      if (permissions.includes('blog:write')) expect(permissions).toContain('blog:read');
      if (permissions.includes('blog:publish')) expect(permissions).toContain('blog:write');
      expect(new Set(permissions).size).toBe(permissions.length);
    }
  });

  it('dit les permissions en mots, y compris celles des accès anciens', () => {
    expect(libellesPermissions(['blog:read', 'blog:write'])).toEqual(['Rédaction']);
    expect(libellesPermissions(['blog:read', 'blog:write', 'blog:publish'])).toEqual(['Publication']);
    expect(libellesPermissions(['contacts:read', 'blog:read'])).toEqual(['Lecture du blog', 'Demandes de contact']);
    expect(libellesPermissions(['contacts:read'])).toEqual(['Demandes de contact']);
  });
});

describe('nom de l’accès et du serveur', () => {
  it('propose « Claude Code », puis un numéro libre', () => {
    expect(nomPropose([])).toBe('Claude Code');
    expect(nomPropose(['Claude Code'])).toBe('Claude Code 2');
    expect(nomPropose(['claude code', 'Claude Code 2'])).toBe('Claude Code 3');
    expect(nomPropose(['Claude Code — MacBook'])).toBe('Claude Code');
  });

  it('nomme le serveur selon l’hôte, pour ne jamais mêler deux environnements', () => {
    expect(nomServeur('charles-lindecker.com', 'charles-lindecker.com')).toBe('portfolio');
    expect(nomServeur('www.charles-lindecker.com', 'charles-lindecker.com')).toBe('portfolio');
    expect(nomServeur('localhost', 'charles-lindecker.com')).toBe('portfolio-local');
    expect(nomServeur('127.0.0.1', 'charles-lindecker.com')).toBe('portfolio-local');
    expect(nomServeur('[::1]', 'charles-lindecker.com')).toBe('portfolio-local');
    expect(nomServeur('test.v2.charles-lindecker.com', 'charles-lindecker.com')).toBe('portfolio-test');
  });
});

describe('commande Claude Code', () => {
  const secret = 'a'.repeat(32) + '0123456789abcdef'.repeat(2);

  it('suit la syntaxe de `claude mcp add` : options, nom, adresse, puis l’en-tête', () => {
    expect(commandeClaudeCode('https://charles-lindecker.com', 'portfolio', secret)).toBe(
      `claude mcp add --transport http --scope user portfolio https://charles-lindecker.com/mcp --header "Authorization: Bearer ${secret}"`,
    );
    expect(commandeClaudeCode('http://localhost:4332', 'portfolio-local', secret)).toContain('portfolio-local http://localhost:4332/mcp');
    expect(commandeRetrait('portfolio-local')).toBe('claude mcp remove portfolio-local');
  });

  it('cite sans risque un secret qui ne serait pas hexadécimal', () => {
    expect(commandeClaudeCode('https://exemple.test', 'portfolio', `x"$(id)'`)).toBe(
      `claude mcp add --transport http --scope user portfolio https://exemple.test/mcp --header 'Authorization: Bearer x"$(id)'\\'''`,
    );
  });
});

describe('dernière utilisation', () => {
  const maintenant = Date.parse('2026-10-14T12:00:00Z');

  it('dit l’âge de l’utilisation, puis la date au-delà d’une semaine', () => {
    expect(depuis('2026-10-14T11:59:30Z', maintenant)).toBe('à l’instant');
    expect(depuis('2026-10-14T11:55:00Z', maintenant)).toBe('il y a 5 minutes');
    expect(depuis('2026-10-14T09:00:00Z', maintenant)).toBe('il y a 3 heures');
    expect(depuis('2026-10-13T10:00:00Z', maintenant)).toBe('hier');
    expect(depuis('2026-09-30T10:00:00Z', maintenant)).toMatch(/^le 30 sept\. 2026$/);
    expect(depuis('pas une date', maintenant)).toBe('Date inconnue');
  });
});
