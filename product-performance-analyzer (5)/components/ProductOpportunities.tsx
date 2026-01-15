import React from 'react';
import { AnalysisResult, CurrencyCode, RawProductData } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
  activeThreshold: number;
  thresholdMode: 'auto' | 'manual';
}

const ProductOpportunities: React.FC<Props> = ({ data, currency, activeThreshold, thresholdMode }) => {
  const config = CURRENCY_CONFIG[currency];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  const formatRoas = (val: number) => {
      const roas = val > 0 ? (val * 100).toFixed(0) + '%' : '0%';
      return roas;
  }
  
  const formatSIS = (val: number) => `${val.toFixed(2)}%`;

  const downloadCSV = (products: RawProductData[], filename: string) => {
    if (!products.length) return;

    const headers = ['Item ID', 'Conversions', 'Cost', 'Revenue', 'Search Impr. Share', 'ROAS'];
    const rows = products.map(p => {
        const roas = p.cost > 0 ? p.conversionValue / p.cost : 0;
        return [
            `"${p.id.replace(/"/g, '""')}"`,
            p.conversions,
            p.cost.toFixed(2),
            p.conversionValue.toFixed(2),
            `${p.searchImpressionShare.toFixed(2)}%`,
            `${(roas * 100).toFixed(2)}%`
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const thresholdLabel = thresholdMode === 'auto' ? 'Average' : 'Target';
  const thresholdPct = (activeThreshold * 100).toFixed(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Potential Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-emerald-800">🚀 Products with Potential</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">
                ROAS ≥ {thresholdPct}%
              </span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {/* Fix: Escaped '<' to avoid JSX parser issues */}
              Efficient products (≥ {thresholdLabel} ROAS) with Low Impression Share (&lt; 40%)
            </p>
          </div>
          <button
            onClick={() => downloadCSV(data.potentialProducts, 'potential_products.csv')}
            className="text-xs font-medium bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto flex-grow">
          {data.potentialProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-sm">No products currently matching these efficiency criteria.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="font-semibold text-slate-500 bg-slate-50/80 sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Item ID</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.potentialProducts.slice(0, 20).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[120px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-medium">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {data.potentialProducts.length > 20 && (
          <div className="p-3 text-center border-t border-slate-100 bg-slate-50/30 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Showing top 20 of {data.potentialProducts.length} items
          </div>
        )}
      </div>

      {/* Overspending Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-red-800">💸 Potentially Overspending</h3>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-red-200">
                {/* Fix: Escaped '<' to avoid JSX parser issues */}
                ROAS &lt; {thresholdPct}%
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              {/* Fix: Escaped '<' to avoid JSX parser issues */}
              Inefficient products (&lt; {thresholdLabel} ROAS) with High Impression Share (&gt; 50%)
            </p>
          </div>
          <button
            onClick={() => downloadCSV(data.overspendingProducts, 'overspending_products.csv')}
            className="text-xs font-medium bg-white border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto flex-grow">
        {data.overspendingProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-sm">All high-exposure products are currently meeting efficiency targets.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="font-semibold text-slate-500 bg-slate-50/80 sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Item ID</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.overspendingProducts.slice(0, 20).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[120px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 font-medium">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {data.overspendingProducts.length > 20 && (
          <div className="p-3 text-center border-t border-slate-100 bg-slate-50/30 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Showing top 20 of {data.overspendingProducts.length} items
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOpportunities;