
import React from 'react';
import { AnalysisResult, CurrencyCode } from '../types';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Potential Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-50">
          <h3 className="font-bold text-lg text-emerald-800">🚀 Products with Potential</h3>
          <p className="text-xs text-emerald-600 mt-1">High ROAS (Above Avg) but Low Search Impr. Share (&lt; 40%)</p>
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
                  <th className="px-4 py-3 text-right">ROAS</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.potentialProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[100px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.conversionValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Overspending Products */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50">
          <h3 className="font-bold text-lg text-red-800">💸 Potentially Overspending</h3>
          <p className="text-xs text-red-600 mt-1">Low ROAS (Below Avg) and High Search Impr. Share (&gt; 50%)</p>
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
                  <th className="px-4 py-3 text-right">ROAS</th>
                  <th className="px-4 py-3 text-right">IS</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.overspendingProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[100px]" title={p.id}>{p.id}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{p.conversions}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatRoas(p.cost > 0 ? p.conversionValue / p.cost : 0)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatSIS(p.searchImpressionShare)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(p.conversionValue)}</td>
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
