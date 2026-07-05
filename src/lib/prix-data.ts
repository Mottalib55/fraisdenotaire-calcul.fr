/**
 * Données pré-calculées pour les pages programmatiques /frais-notaire-[prix]/
 */

import { calculateFraisNotaire, type FraisNotaireResult } from './engine.js';

export interface PrixDataEntry {
  price: number;
  slug: string;
  label: string;
  ancien: FraisNotaireResult;
  neuf: FraisNotaireResult;
}

const PRICE_POINTS = [
  100_000, 150_000, 200_000, 250_000, 300_000, 350_000,
  400_000, 450_000, 500_000, 600_000, 750_000, 1_000_000,
] as const;

function formatLabel(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export const prixData: PrixDataEntry[] = PRICE_POINTS.map((price) => ({
  price,
  slug: String(price),
  label: formatLabel(price),
  ancien: calculateFraisNotaire(price, 'ancien'),
  neuf: calculateFraisNotaire(price, 'neuf'),
}));

/**
 * Helper to find adjacent price entries for cross-linking
 */
export function getAdjacentPrices(slug: string): {
  prev: PrixDataEntry | null;
  next: PrixDataEntry | null;
} {
  const idx = prixData.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? prixData[idx - 1] : null,
    next: idx < prixData.length - 1 ? prixData[idx + 1] : null,
  };
}
