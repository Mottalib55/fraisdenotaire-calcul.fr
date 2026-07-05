import { useState, useCallback, type FormEvent } from 'react';
import {
  calculateDonation,
  type DonationResult,
} from '../lib/engine.js';
import type { LienParente } from '../lib/baremes-2026.js';

function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatPercent(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' %';
}

const LIENS_DONATION: { value: LienParente; label: string }[] = [
  { value: 'enfant', label: 'Enfant / Parent' },
  { value: 'conjoint', label: 'Conjoint / Pacsé' },
  { value: 'frere', label: 'Frère / Sœur' },
  { value: 'neveu', label: 'Neveu / Nièce' },
  { value: 'autre', label: 'Autre (non parent)' },
];

function ResultRow({
  label,
  value,
  bold,
  highlight,
  green,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={`text-gray-600 ${bold ? 'font-bold text-gray-800' : ''}`}
      >
        {label}
      </span>
      <span
        className={`font-mono text-right ${
          bold
            ? 'font-bold text-lg text-gray-900'
            : highlight
              ? 'font-semibold text-secondary-500'
              : green
                ? 'font-semibold text-green-600'
                : 'text-gray-800'
        }`}
      >
        {formatEuro(value)}
      </span>
    </div>
  );
}

export default function DonationCalculator() {
  const [montant, setMontant] = useState<string>('200000');
  const [lien, setLien] = useState<LienParente>('enfant');
  const [donationsAnterieures, setDonationsAnterieures] = useState<string>('0');
  const [result, setResult] = useState<DonationResult | null>(null);

  const handleCalculate = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const montantNum = parseFloat(montant.replace(/\s/g, ''));
      if (isNaN(montantNum) || montantNum < 0) return;
      const donAntNum = parseFloat(donationsAnterieures.replace(/\s/g, '')) || 0;
      setResult(calculateDonation(montantNum, lien, donAntNum));
    },
    [montant, lien, donationsAnterieures]
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-primary-600 text-white rounded-t-xl py-4 px-6 text-center">
        <h2 className="text-xl font-bold">Simulateur de Droits de Donation</h2>
        <p className="text-sm text-primary-200 mt-1">Barèmes officiels 2026</p>
      </div>

      {/* Form */}
      <div className="border-2 border-gray-200 border-t-0 rounded-b-xl p-6 sm:p-8 bg-white">
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Montant de la donation */}
          <div>
            <label
              htmlFor="montant-donation"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Montant de la donation (€)
            </label>
            <input
              id="montant-donation"
              type="text"
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg transition-colors"
              placeholder="200 000"
            />
          </div>

          {/* Lien de parenté */}
          <div>
            <label
              htmlFor="lien-parente-donation"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Lien de parenté avec le donataire
            </label>
            <select
              id="lien-parente-donation"
              value={lien}
              onChange={(e) => setLien(e.target.value as LienParente)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg bg-white transition-colors"
            >
              {LIENS_DONATION.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Donations antérieures */}
          <div>
            <label
              htmlFor="donations-anterieures"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Donations antérieures (15 dernières années) (€)
            </label>
            <input
              id="donations-anterieures"
              type="text"
              inputMode="numeric"
              value={donationsAnterieures}
              onChange={(e) => setDonationsAnterieures(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg transition-colors"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Montant total des donations déjà effectuées au même bénéficiaire au cours des 15 dernières années (rappel fiscal).
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-lg transition-colors cursor-pointer"
          >
            Calculer les droits de donation
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-4">
            {/* Total */}
            <div
              className={`p-6 rounded-xl text-center ${
                result.exonere
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 text-white'
              }`}
            >
              {result.exonere ? (
                <>
                  <p className="text-sm uppercase tracking-wide opacity-80">
                    Droits de donation
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    Exonéré — Aucun droit à payer
                  </p>
                  <p className="text-lg mt-1 opacity-90">
                    La donation est intégralement couverte par l'abattement
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm uppercase tracking-wide opacity-80">
                    Droits de donation à payer
                  </p>
                  <p className="text-4xl font-bold mt-1">
                    {formatEuro(result.droits)}
                  </p>
                  <p className="text-lg mt-1 opacity-90">
                    taux effectif : {formatPercent(result.tauxEffectif)}
                  </p>
                </>
              )}
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
              <h3 className="font-bold text-gray-800 mb-3">
                Détail du calcul
              </h3>
              <ResultRow
                label="Montant de la donation"
                value={result.montant}
              />
              <ResultRow
                label="Abattement total (selon lien)"
                value={result.abattementTotal}
                green
              />
              <ResultRow
                label="Abattement restant (après rappel)"
                value={result.abattementRestant}
                green
              />
              <ResultRow
                label="Part nette taxable"
                value={result.partTaxable}
                highlight
              />
              <hr className="border-gray-300" />
              <ResultRow
                label="Droits de donation"
                value={result.droits}
                bold
              />
            </div>

            {/* Info box */}
            <div className="bg-accent-50 border-l-4 border-accent-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700">
                <strong>Rappel :</strong> Les abattements de donation se reconstituent tous les 15 ans. Si vos donations antérieures datent de plus de 15 ans, elles ne sont pas prises en compte dans le rappel fiscal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
