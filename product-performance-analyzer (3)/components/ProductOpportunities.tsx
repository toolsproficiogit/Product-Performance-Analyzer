
import React from 'react';
import { AnalysisResult, CurrencyCode, RawProductData } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

const ProductOpportunities: React.FC<Props> = ({ data, currency }) => {
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
        // Search Impr. Share is stored as percentage number (e.g. 10.5 for 10.5%)
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Potential Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-emerald-800">🚀 Products with Potential</h3>
            <p className="text-xs text-emerald-600 mt-1">High ROAS (Above Avg) but Low Search Impr. Share (&lt; 40%)</p>
          </div>
          <button
            onClick={() => downloadCSV(data.potentialProducts, 'potential_products.csv')}
            className="text-xs font-medium bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto flex-grow">
          {data.potentialProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No products match these criteria.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="font-semibold text-slate-600 bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.potentialProducts.slice(0, 20).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[100px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.conversionValue)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overspending Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-red-800">💸 Potentially Overspending</h3>
            <p className="text-xs text-red-600 mt-1">Low ROAS (Below Avg) and High Search Impr. Share (&gt; 50%)</p>
          </div>
          <button
            onClick={() => downloadCSV(data.overspendingProducts, 'overspending_products.csv')}
            className="text-xs font-medium bg-white border border-red-200 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto flex-grow">
        {data.overspendingProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No products match these criteria.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="font-semibold text-slate-600 bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.overspendingProducts.slice(0, 20).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[100px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.conversionValue)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductOpportunities;
