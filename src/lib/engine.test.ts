import { describe, it, expect } from 'vitest';
import {
  calculateFraisNotaire,
  calculateEmoluments,
  calculateDroitsSuccession,
  calculateDonation,
} from './engine.js';

// ═══════════════════════════════════════════════════════
// Frais de notaire — Tests
// ═══════════════════════════════════════════════════════

describe('calculateEmoluments', () => {
  it('should calculate émoluments for a 200,000€ property', () => {
    // 6500 * 3.870% + 10500 * 1.596% + 43000 * 1.064% + 140000 * 0.799%
    // = 251.55 + 167.58 + 457.52 + 1118.60 = 1995.25
    const result = calculateEmoluments(200_000);
    expect(result).toBeCloseTo(1995.25, 1);
  });

  it('should calculate émoluments for a small property (5,000€)', () => {
    // 5000 * 3.870% = 193.50
    const result = calculateEmoluments(5_000);
    expect(result).toBeCloseTo(193.50, 2);
  });

  it('should return 0 for prix = 0', () => {
    expect(calculateEmoluments(0)).toBe(0);
  });
});

describe('calculateFraisNotaire — Ancien', () => {
  it('should calculate frais for 200,000€ ancien property', () => {
    const result = calculateFraisNotaire(200_000, 'ancien');
    expect(result.prixBien).toBe(200_000);
    expect(result.typeAchat).toBe('ancien');

    // Droits de mutation : 200000 * 5.81% = 11620
    expect(result.droitsMutation).toBeCloseTo(11_620, 0);

    // Émoluments HT ~1995.25
    expect(result.emolumentsHT).toBeCloseTo(1995.25, 0);

    // Émoluments TTC = 1995.25 * 1.20 = 2394.30
    expect(result.emolumentsTTC).toBeCloseTo(2394.30, 0);

    // Sécurité immobilière : 200000 * 0.10% = 200
    expect(result.securiteImmobiliere).toBe(200);

    // Débours : 1200
    expect(result.debours).toBe(1200);

    // Total = 11620 + 2394.30 + 200 + 1200 = 15414.30
    expect(result.totalFrais).toBeCloseTo(15_414.30, 0);

    // Pourcentage effectif ~7.71%
    expect(result.pourcentageEffectif).toBeGreaterThan(7);
    expect(result.pourcentageEffectif).toBeLessThan(8.5);
  });

  it('should calculate frais for 500,000€ ancien property', () => {
    const result = calculateFraisNotaire(500_000, 'ancien');

    // Droits de mutation : 500000 * 5.81% = 29050
    expect(result.droitsMutation).toBeCloseTo(29_050, 0);

    // Total should be around 7-8%
    expect(result.pourcentageEffectif).toBeGreaterThan(6);
    expect(result.pourcentageEffectif).toBeLessThan(8.5);
  });
});

describe('calculateFraisNotaire — Neuf', () => {
  it('should calculate frais for 300,000€ neuf property', () => {
    const result = calculateFraisNotaire(300_000, 'neuf');

    // Droits de mutation réduits : 300000 * 0.715% = 2145
    expect(result.droitsMutation).toBeCloseTo(2_145, 0);

    // Total should be around 2-3%
    expect(result.pourcentageEffectif).toBeGreaterThan(1.5);
    expect(result.pourcentageEffectif).toBeLessThan(4);
  });

  it('should apply minimum sécurité immobilière for very low price', () => {
    const result = calculateFraisNotaire(5_000, 'neuf');
    expect(result.securiteImmobiliere).toBe(15); // minimum 15€
  });
});

// ═══════════════════════════════════════════════════════
// Droits de succession — Tests
// ═══════════════════════════════════════════════════════

describe('calculateDroitsSuccession', () => {
  it('should apply abattement enfant (100,000€) — no tax below', () => {
    const result = calculateDroitsSuccession(80_000, 'enfant', false);
    expect(result.abattement).toBe(80_000);
    expect(result.partTaxable).toBe(0);
    expect(result.droits).toBe(0);
    expect(result.exonere).toBe(true);
  });

  it('should calculate progressive tax for enfant above abattement', () => {
    // 200,000€ - 100,000€ abattement = 100,000€ taxable
    // 8072 * 5% + 4037 * 10% + 3823 * 15% + 84068 * 20%
    // = 403.60 + 403.70 + 573.45 + 16813.60 = 18194.35
    const result = calculateDroitsSuccession(200_000, 'enfant', false);
    expect(result.partTaxable).toBe(100_000);
    expect(result.droits).toBeCloseTo(18_194.35, 0);
    expect(result.tauxEffectif).toBeGreaterThan(9);
    expect(result.tauxEffectif).toBeLessThan(10);
  });

  it('should calculate succession for large estate (enfant)', () => {
    // 1,000,000€ - 100,000€ = 900,000€ taxable
    const result = calculateDroitsSuccession(1_000_000, 'enfant', false);
    expect(result.partTaxable).toBe(900_000);
    expect(result.droits).toBeGreaterThan(180_000);
  });

  it('should exonerate conjoint/pacsé completely', () => {
    const result = calculateDroitsSuccession(5_000_000, 'conjoint', false);
    expect(result.droits).toBe(0);
    expect(result.exonere).toBe(true);
    expect(result.partTaxable).toBe(0);
  });

  it('should calculate frère/sœur succession', () => {
    // 50,000€ - 15,932€ abattement = 34,068€ taxable
    // 24,430 * 35% + 9,638 * 45% = 8550.50 + 4337.10 = 12887.60
    const result = calculateDroitsSuccession(50_000, 'frere', false);
    expect(result.partTaxable).toBeCloseTo(34_068, 0);
    expect(result.droits).toBeCloseTo(12_887.60, 0);
  });

  it('should calculate neveu/nièce succession at 55%', () => {
    // 100,000€ - 7,967€ = 92,033€ taxable at 55%
    const result = calculateDroitsSuccession(100_000, 'neveu', false);
    expect(result.partTaxable).toBeCloseTo(92_033, 0);
    expect(result.droits).toBeCloseTo(92_033 * 0.55, 0);
  });

  it('should calculate autre succession at 60%', () => {
    // 100,000€ - 1,594€ = 98,406€ taxable at 60%
    const result = calculateDroitsSuccession(100_000, 'autre', false);
    expect(result.partTaxable).toBeCloseTo(98_406, 0);
    expect(result.droits).toBeCloseTo(98_406 * 0.60, 0);
  });

  it('should apply handicap abattement in addition to standard', () => {
    // enfant + handicap: 100,000 + 159,325 = 259,325€ abattement
    const result = calculateDroitsSuccession(250_000, 'enfant', true);
    expect(result.partTaxable).toBe(0);
    expect(result.droits).toBe(0);
    expect(result.exonere).toBe(true);
  });

  it('should apply handicap abattement for frère/sœur too', () => {
    // frère + handicap: 15,932 + 159,325 = 175,257€ abattement
    const result = calculateDroitsSuccession(170_000, 'frere', true);
    expect(result.partTaxable).toBe(0);
    expect(result.exonere).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
// Donation — Tests
// ═══════════════════════════════════════════════════════

describe('calculateDonation', () => {
  it('should apply full abattement for enfant donation', () => {
    const result = calculateDonation(80_000, 'enfant', 0);
    expect(result.abattementRestant).toBe(100_000);
    expect(result.partTaxable).toBe(0);
    expect(result.droits).toBe(0);
    expect(result.exonere).toBe(true);
  });

  it('should reduce abattement by previous donations (rappel fiscal)', () => {
    // Already donated 60,000€ within 15 years
    // Remaining abattement: 100,000 - 60,000 = 40,000€
    // New donation: 80,000€ -> taxable: 80,000 - 40,000 = 40,000€
    const result = calculateDonation(80_000, 'enfant', 60_000);
    expect(result.abattementRestant).toBe(40_000);
    expect(result.partTaxable).toBe(40_000);
    expect(result.droits).toBeGreaterThan(0);
  });

  it('should handle case where previous donations exceed abattement', () => {
    const result = calculateDonation(50_000, 'enfant', 120_000);
    expect(result.abattementRestant).toBe(0);
    expect(result.partTaxable).toBe(50_000);
    expect(result.droits).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// Edge cases
// ═══════════════════════════════════════════════════════

describe('Edge cases', () => {
  it('should handle prix = 0', () => {
    const result = calculateFraisNotaire(0, 'ancien');
    expect(result.totalFrais).toBe(1_215); // only debours + min sécurité
  });

  it('should throw for negative prix', () => {
    expect(() => calculateFraisNotaire(-1, 'ancien')).toThrow();
  });

  it('should throw for negative montant succession', () => {
    expect(() => calculateDroitsSuccession(-1, 'enfant', false)).toThrow();
  });
});
