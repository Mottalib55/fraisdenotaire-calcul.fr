/**
 * Barèmes 2026 — Frais de notaire et droits de succession en France
 * Sources : service-public.fr, legifrance.gouv.fr
 */

// ─── Émoluments proportionnels du notaire (barème dégressif) ───

export interface TrancheEmoluments {
  min: number;
  max: number;
  taux: number; // en pourcentage
}

export const TRANCHES_EMOLUMENTS: TrancheEmoluments[] = [
  { min: 0, max: 6_500, taux: 3.870 },
  { min: 6_500, max: 17_000, taux: 1.596 },
  { min: 17_000, max: 60_000, taux: 1.064 },
  { min: 60_000, max: Infinity, taux: 0.799 },
];

// ─── Droits de mutation (taxe de publicité foncière + frais) ───

/** Taux global des droits de mutation pour l'ancien (départements au taux plein) */
export const TAUX_DROITS_MUTATION_ANCIEN = 5.81; // %

/** Taux réduit des droits de mutation pour le neuf (taxe de publicité foncière) */
export const TAUX_DROITS_MUTATION_NEUF = 0.715; // %

// ─── Contribution de sécurité immobilière ───

export const TAUX_SECURITE_IMMOBILIERE = 0.10; // %
export const MIN_SECURITE_IMMOBILIERE = 15; // €

// ─── Débours forfaitaires ───

export const DEBOURS_FORFAITAIRES = 1_200; // €

// ─── TVA sur émoluments ───

export const TVA_EMOLUMENTS = 20; // %

// ─── Droits de succession — Abattements ───

export type LienParente = 'enfant' | 'frere' | 'neveu' | 'autre' | 'conjoint';

export const ABATTEMENTS_SUCCESSION: Record<LienParente, number> = {
  conjoint: Infinity, // exonéré totalement
  enfant: 100_000,
  frere: 15_932,
  neveu: 7_967,
  autre: 1_594,
};

export const ABATTEMENT_HANDICAP = 159_325;

// ─── Droits de succession — Barèmes progressifs ───

export interface TrancheSuccession {
  min: number;
  max: number;
  taux: number; // en pourcentage
}

/** Barème en ligne directe (enfants, parents, grands-parents) */
export const BAREME_LIGNE_DIRECTE: TrancheSuccession[] = [
  { min: 0, max: 8_072, taux: 5 },
  { min: 8_072, max: 12_109, taux: 10 },
  { min: 12_109, max: 15_932, taux: 15 },
  { min: 15_932, max: 552_324, taux: 20 },
  { min: 552_324, max: 902_838, taux: 30 },
  { min: 902_838, max: 1_805_677, taux: 40 },
  { min: 1_805_677, max: Infinity, taux: 45 },
];

/** Barème entre frères et sœurs */
export const BAREME_FRERES_SOEURS: TrancheSuccession[] = [
  { min: 0, max: 24_430, taux: 35 },
  { min: 24_430, max: Infinity, taux: 45 },
];

/** Barème neveux/nièces — taux unique */
export const TAUX_NEVEUX = 55; // %

/** Barème autres — taux unique */
export const TAUX_AUTRES = 60; // %

// ─── Donation — Abattements (identiques, renouvelables tous les 15 ans) ───

export const ABATTEMENTS_DONATION = ABATTEMENTS_SUCCESSION;
export const DELAI_RAPPEL_FISCAL = 15; // années
