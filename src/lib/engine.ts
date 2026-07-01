/**
 * Moteurs de calcul — Frais de notaire et droits de succession
 */

import {
  TRANCHES_EMOLUMENTS,
  TAUX_DROITS_MUTATION_ANCIEN,
  TAUX_DROITS_MUTATION_NEUF,
  TAUX_SECURITE_IMMOBILIERE,
  MIN_SECURITE_IMMOBILIERE,
  DEBOURS_FORFAITAIRES,
  TVA_EMOLUMENTS,
  ABATTEMENTS_SUCCESSION,
  ABATTEMENT_HANDICAP,
  BAREME_LIGNE_DIRECTE,
  BAREME_FRERES_SOEURS,
  TAUX_NEVEUX,
  TAUX_AUTRES,
  ABATTEMENTS_DONATION,
  type LienParente,
  type TrancheSuccession,
} from './baremes-2026.js';

// ─── Types ───

export type TypeAchat = 'ancien' | 'neuf';

export interface FraisNotaireInput {
  prixBien: number;
  typeAchat: TypeAchat;
  departement?: string;
}

export interface FraisNotaireResult {
  prixBien: number;
  typeAchat: TypeAchat;
  emolumentsHT: number;
  emolumentsTTC: number;
  droitsMutation: number;
  securiteImmobiliere: number;
  debours: number;
  totalFrais: number;
  pourcentageEffectif: number;
}

export interface SuccessionInput {
  montantNet: number;
  lienParente: LienParente;
  handicap: boolean;
}

export interface SuccessionResult {
  montantNet: number;
  lienParente: LienParente;
  abattement: number;
  partTaxable: number;
  droits: number;
  tauxEffectif: number;
  exonere: boolean;
}

export interface DonationInput {
  montant: number;
  lienParente: LienParente;
  donationsAnterieures: number;
}

export interface DonationResult {
  montant: number;
  lienParente: LienParente;
  abattementTotal: number;
  abattementRestant: number;
  partTaxable: number;
  droits: number;
  tauxEffectif: number;
  exonere: boolean;
}

// ─── Calcul des émoluments du notaire (barème dégressif) ───

export function calculateEmoluments(prixBien: number): number {
  let emoluments = 0;

  for (const tranche of TRANCHES_EMOLUMENTS) {
    if (prixBien <= tranche.min) break;
    const assiette = Math.min(prixBien, tranche.max) - tranche.min;
    emoluments += assiette * (tranche.taux / 100);
  }

  return Math.round(emoluments * 100) / 100;
}

// ─── Calcul des frais de notaire ───

export function calculateFraisNotaire(
  prixBien: number,
  typeAchat: TypeAchat,
  departement?: string
): FraisNotaireResult {
  if (prixBien < 0) {
    throw new Error('Le prix du bien doit être positif');
  }

  // Émoluments proportionnels (HT)
  const emolumentsHT = calculateEmoluments(prixBien);

  // Émoluments TTC (+ 20% TVA)
  const emolumentsTTC = Math.round(emolumentsHT * (1 + TVA_EMOLUMENTS / 100) * 100) / 100;

  // Droits de mutation
  const tauxDroits = typeAchat === 'ancien'
    ? TAUX_DROITS_MUTATION_ANCIEN
    : TAUX_DROITS_MUTATION_NEUF;
  const droitsMutation = Math.round(prixBien * (tauxDroits / 100) * 100) / 100;

  // Contribution de sécurité immobilière
  const securiteImmobiliere = Math.max(
    MIN_SECURITE_IMMOBILIERE,
    Math.round(prixBien * (TAUX_SECURITE_IMMOBILIERE / 100) * 100) / 100
  );

  // Débours
  const debours = DEBOURS_FORFAITAIRES;

  // Total
  const totalFrais = Math.round((emolumentsTTC + droitsMutation + securiteImmobiliere + debours) * 100) / 100;

  // Pourcentage effectif
  const pourcentageEffectif = prixBien > 0
    ? Math.round((totalFrais / prixBien) * 10000) / 100
    : 0;

  return {
    prixBien,
    typeAchat,
    emolumentsHT,
    emolumentsTTC,
    droitsMutation,
    securiteImmobiliere,
    debours,
    totalFrais,
    pourcentageEffectif,
  };
}

// ─── Calcul progressif des droits de succession/donation ───

function calculateBaremeProgressif(
  partTaxable: number,
  tranches: TrancheSuccession[]
): number {
  if (partTaxable <= 0) return 0;

  let droits = 0;
  for (const tranche of tranches) {
    if (partTaxable <= tranche.min) break;
    const assiette = Math.min(partTaxable, tranche.max) - tranche.min;
    droits += assiette * (tranche.taux / 100);
  }

  return Math.round(droits * 100) / 100;
}

function getDroitsParLien(partTaxable: number, lienParente: LienParente): number {
  if (partTaxable <= 0) return 0;

  switch (lienParente) {
    case 'conjoint':
      return 0; // exonéré
    case 'enfant':
      return calculateBaremeProgressif(partTaxable, BAREME_LIGNE_DIRECTE);
    case 'frere':
      return calculateBaremeProgressif(partTaxable, BAREME_FRERES_SOEURS);
    case 'neveu':
      return Math.round(partTaxable * (TAUX_NEVEUX / 100) * 100) / 100;
    case 'autre':
      return Math.round(partTaxable * (TAUX_AUTRES / 100) * 100) / 100;
    default:
      throw new Error(`Lien de parenté inconnu : ${lienParente}`);
  }
}

// ─── Calcul des droits de succession ───

export function calculateDroitsSuccession(
  montantNet: number,
  lienParente: LienParente,
  handicap: boolean = false
): SuccessionResult {
  if (montantNet < 0) {
    throw new Error('Le montant net doit être positif');
  }

  // Conjoint/pacsé : exonéré totalement
  if (lienParente === 'conjoint') {
    return {
      montantNet,
      lienParente,
      abattement: montantNet,
      partTaxable: 0,
      droits: 0,
      tauxEffectif: 0,
      exonere: true,
    };
  }

  // Abattement de droit commun
  let abattement = ABATTEMENTS_SUCCESSION[lienParente];

  // Abattement supplémentaire handicap
  if (handicap) {
    abattement += ABATTEMENT_HANDICAP;
  }

  const partTaxable = Math.max(0, montantNet - abattement);
  const droits = getDroitsParLien(partTaxable, lienParente);
  const tauxEffectif = montantNet > 0
    ? Math.round((droits / montantNet) * 10000) / 100
    : 0;

  return {
    montantNet,
    lienParente,
    abattement: Math.min(abattement, montantNet),
    partTaxable,
    droits,
    tauxEffectif,
    exonere: partTaxable === 0,
  };
}

// ─── Calcul des droits de donation ───

export function calculateDonation(
  montant: number,
  lienParente: LienParente,
  donationsAnterieures: number = 0
): DonationResult {
  if (montant < 0) {
    throw new Error('Le montant de la donation doit être positif');
  }

  // Conjoint/pacsé : mêmes abattements que succession pour donation
  // mais pas exonéré automatiquement (seule la succession l'est)
  const abattementTotal = lienParente === 'conjoint'
    ? 80_724
    : ABATTEMENTS_DONATION[lienParente];

  // Rappel fiscal : les donations antérieures réduisent l'abattement restant
  const abattementRestant = Math.max(0, abattementTotal - donationsAnterieures);

  const totalDonation = montant;
  const partTaxable = Math.max(0, totalDonation - abattementRestant);
  const droits = getDroitsParLien(partTaxable, lienParente);
  const tauxEffectif = montant > 0
    ? Math.round((droits / montant) * 10000) / 100
    : 0;

  return {
    montant,
    lienParente,
    abattementTotal,
    abattementRestant,
    partTaxable,
    droits,
    tauxEffectif,
    exonere: partTaxable === 0,
  };
}
