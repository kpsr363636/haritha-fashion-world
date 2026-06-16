import { useState } from 'react';
import { formatINR } from '../../utils/formatters';

const EMI_BANKS = [
  { name: 'HDFC Bank', logo: '🏦', tenures: [3, 6, 9, 12] },
  { name: 'ICICI Bank', logo: '🏦', tenures: [3, 6, 9, 12, 18] },
  { name: 'SBI Card', logo: '🏦', tenures: [3, 6, 9, 12] },
  { name: 'Axis Bank', logo: '🏦', tenures: [3, 6, 12] },
  { name: 'Kotak Bank', logo: '🏦', tenures: [3, 6, 9] },
];

const INTEREST_RATE = 0.13; // 13% p.a. (approximate for credit card EMI)
const NO_COST_THRESHOLD = 5000; // No-cost EMI available above this amount

function calcEmi(principal, months) {
  const r = INTEREST_RATE / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function EmiDisplay({ price }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTenure, setSelectedTenure] = useState(6);

  if (!price || price < 1000) return null;

  const isNoCost = price >= NO_COST_THRESHOLD;
  const emi3 = Math.ceil(calcEmi(price, 3));

  return (
    <div className="border border-brand-100 rounded-xl overflow-hidden bg-brand-50/30">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-brand-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              EMI from {formatINR(emi3)}/month
            </p>
            {isNoCost && (
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                No Cost EMI available
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-brand-100 p-3 space-y-3">
          {/* Tenure selector */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Select tenure</p>
            <div className="flex gap-2 flex-wrap">
              {[3, 6, 9, 12, 18].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTenure(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedTenure === t
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-300 text-gray-600 hover:border-brand-400'
                  }`}
                >
                  {t} months
                </button>
              ))}
            </div>
          </div>

          {/* Bank list */}
          <div className="space-y-2">
            {EMI_BANKS.filter(b => b.tenures.includes(selectedTenure)).map(bank => {
              const emi = Math.ceil(calcEmi(price, selectedTenure));
              const interest = isNoCost ? 0 : Math.ceil(emi * selectedTenure - price);
              return (
                <div key={bank.name} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span>{bank.logo}</span>
                    <span className="text-sm font-medium text-gray-700">{bank.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatINR(emi)}/mo</p>
                    {isNoCost ? (
                      <p className="text-xs text-green-600">No cost</p>
                    ) : (
                      <p className="text-xs text-gray-400">+{formatINR(interest)} interest</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400">
            * EMI is indicative. Actual interest may vary by bank. No-cost EMI available on select cards.
          </p>
        </div>
      )}
    </div>
  );
}
