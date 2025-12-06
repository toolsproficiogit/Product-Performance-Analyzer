
import React from 'react';
import { AnalysisResult, CurrencyCode } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

const BrandDeviceAnalysis: React.FC<Props> = ({ data, currency }) => {
  const config = CURRENCY_CONFIG[currency];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  const formatRoas = (val: number) => `${(val * 100).toFixed(0)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Brand Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200" style={{ backgroundColor: `${MAIRA_COLORS.primaryGreen}0D` }}>
          <h3 className="font-bold text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Performance by Brand</h3>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="font-semibold text-slate-600 bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.brandPerformance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.cost)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: item.roas >= data.averageRoas ? MAIRA_COLORS.primaryGreen : MAIRA_COLORS.primaryOrange }}>
                    {formatRoas(item.roas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200" style={{ backgroundColor: `${MAIRA_COLORS.primaryGreen}0D` }}>
          <h3 className="font-bold text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Performance by Device</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="font-semibold text-slate-600 bg-slate-50">
              <tr>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.devicePerformance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.cost)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: item.roas >= data.averageRoas ? MAIRA_COLORS.primaryGreen : MAIRA_COLORS.primaryOrange }}>
                    {formatRoas(item.roas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BrandDeviceAnalysis;
