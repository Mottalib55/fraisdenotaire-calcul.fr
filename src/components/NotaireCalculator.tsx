import { useState, useCallback, type FormEvent } from 'react';
import {
  calculateFraisNotaire,
  calculateDroitsSuccession,
  type FraisNotaireResult,
  type SuccessionResult,
  type TypeAchat,
} from '../lib/engine.js';
import type { LienParente } from '../lib/baremes-2026.js';

type Tab = 'notaire' | 'succession';

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

// ─── Tab: Frais de notaire ───

function FraisNotaireTab() {
  const [prix, setPrix] = useState<string>('250000');
  const [typeAchat, setTypeAchat] = useState<TypeAchat>('ancien');
  const [result, setResult] = useState<FraisNotaireResult | null>(null);

  const handleCalculate = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const prixNum = parseFloat(prix.replace(/\s/g, ''));
      if (isNaN(prixNum) || prixNum < 0) return;
      setResult(calculateFraisNotaire(prixNum, typeAchat));
    },
    [prix, typeAchat]
  );

  return (
    <div>
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Prix du bien */}
        <div>
          <label
            htmlFor="prix-bien"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Prix du bien immobilier (€)
          </label>
          <input
            id="prix-bien"
            type="text"
            inputMode="numeric"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg transition-colors"
            placeholder="250 000"
          />
        </div>

        {/* Type d'achat */}
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-2">
            Type de bien
          </span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type-achat"
                value="ancien"
                checked={typeAchat === 'ancien'}
                onChange={() => setTypeAchat('ancien')}
                className="w-5 h-5 text-primary-600"
              />
              <span className="text-gray-700">
                Ancien{' '}
                <span className="text-xs text-gray-500">(~7-8 %)</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type-achat"
                value="neuf"
                checked={typeAchat === 'neuf'}
                onChange={() => setTypeAchat('neuf')}
                className="w-5 h-5 text-primary-600"
              />
              <span className="text-gray-700">
                Neuf{' '}
                <span className="text-xs text-gray-500">(~2-3 %)</span>
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-lg transition-colors cursor-pointer"
        >
          Calculer les frais de notaire
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-4">
          {/* Total */}
          <div className="bg-primary-600 text-white p-6 rounded-xl text-center">
            <p className="text-sm uppercase tracking-wide opacity-80">
              Total des frais de notaire
            </p>
            <p className="text-4xl font-bold mt-1">
              {formatEuro(result.totalFrais)}
            </p>
            <p className="text-lg mt-1 opacity-90">
              soit {formatPercent(result.pourcentageEffectif)} du prix
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-gray-800 mb-3">
              Détail des frais
            </h3>
            <ResultRow
              label="Droits de mutation (taxes)"
              value={result.droitsMutation}
              highlight
            />
            <ResultRow
              label="Émoluments du notaire (TTC)"
              value={result.emolumentsTTC}
            />
            <ResultRow
              label="Contribution sécurité immobilière"
              value={result.securiteImmobiliere}
            />
            <ResultRow
              label="Débours et frais divers"
              value={result.debours}
            />
            <hr className="border-gray-300" />
            <ResultRow
              label="Coût total de l'acquisition"
              value={result.prixBien + result.totalFrais}
              bold
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Droits de succession ───

const LIENS: { value: LienParente; label: string }[] = [
  { value: 'enfant', label: 'Enfant / Parent' },
  { value: 'conjoint', label: 'Conjoint / Pacsé' },
  { value: 'frere', label: 'Frère / Sœur' },
  { value: 'neveu', label: 'Neveu / Nièce' },
  { value: 'autre', label: 'Autre (non parent)' },
];

function SuccessionTab() {
  const [montant, setMontant] = useState<string>('300000');
  const [lien, setLien] = useState<LienParente>('enfant');
  const [handicap, setHandicap] = useState(false);
  const [result, setResult] = useState<SuccessionResult | null>(null);

  const handleCalculate = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const montantNum = parseFloat(montant.replace(/\s/g, ''));
      if (isNaN(montantNum) || montantNum < 0) return;
      setResult(calculateDroitsSuccession(montantNum, lien, handicap));
    },
    [montant, lien, handicap]
  );

  return (
    <div>
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Montant */}
        <div>
          <label
            htmlFor="montant-succession"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Montant net de la part héritée (€)
          </label>
          <input
            id="montant-succession"
            type="text"
            inputMode="numeric"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg transition-colors"
            placeholder="300 000"
          />
        </div>

        {/* Lien de parenté */}
        <div>
          <label
            htmlFor="lien-parente"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Lien de parenté avec le défunt
          </label>
          <select
            id="lien-parente"
            value={lien}
            onChange={(e) => setLien(e.target.value as LienParente)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none text-lg bg-white transition-colors"
          >
            {LIENS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Handicap */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={handicap}
            onChange={(e) => setHandicap(e.target.checked)}
            className="w-5 h-5 rounded text-primary-600"
          />
          <span className="text-gray-700">
            Personne en situation de handicap{' '}
            <span className="text-xs text-gray-500">
              (abattement supplémentaire de 159 325 €)
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="w-full py-3 px-6 bg-secondary-500 hover:bg-secondary-600 text-white font-bold rounded-lg text-lg transition-colors cursor-pointer"
        >
          Calculer les droits de succession
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
                : 'bg-secondary-500 text-white'
            }`}
          >
            {result.exonere ? (
              <>
                <p className="text-sm uppercase tracking-wide opacity-80">
                  Droits de succession
                </p>
                <p className="text-3xl font-bold mt-1">
                  Exonéré — Aucun droit à payer
                </p>
              </>
            ) : (
              <>
                <p className="text-sm uppercase tracking-wide opacity-80">
                  Droits de succession à payer
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
              label="Montant net de la part"
              value={result.montantNet}
            />
            <ResultRow
              label="Abattement applicable"
              value={result.abattement}
              green
            />
            <ResultRow
              label="Part nette taxable"
              value={result.partTaxable}
              highlight
            />
            <hr className="border-gray-300" />
            <ResultRow
              label="Droits de succession"
              value={result.droits}
              bold
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared: result row ───

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

// ─── Main component ───

export default function NotaireCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('notaire');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex rounded-t-xl overflow-hidden border-2 border-gray-200 border-b-0">
        <button
          type="button"
          onClick={() => setActiveTab('notaire')}
          className={`flex-1 py-4 px-6 font-bold text-center transition-colors cursor-pointer ${
            activeTab === 'notaire'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Frais de Notaire
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('succession')}
          className={`flex-1 py-4 px-6 font-bold text-center transition-colors cursor-pointer ${
            activeTab === 'succession'
              ? 'bg-secondary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Droits de Succession
        </button>
      </div>

      {/* Content */}
      <div className="border-2 border-gray-200 rounded-b-xl p-6 sm:p-8 bg-white">
        {activeTab === 'notaire' ? <FraisNotaireTab /> : <SuccessionTab />}
      </div>
    </div>
  );
}
