import React from 'react';
import { AnalysisResult, CurrencyCode } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
  thresholdRoas: number;
}

const SummaryCards: React.FC<Props> = ({ data, currency, thresholdRoas }) => {
  const config = CURRENCY_CONFIG[currency];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(val);

  const formatRoas = (val: number) => 
    `${(val * 100).toFixed(0)} %`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Active Threshold ROAS</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryOrange }}>{formatRoas(thresholdRoas)}</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Used for Grouping</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Avg. Account ROAS</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatRoas(data.averageRoas)}</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Total Revenue / Total Cost</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Total Investment</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatCurrency(data.totalCost)}</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{data.totalProducts.toLocaleString()} Products</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatCurrency(data.totalRevenue)}</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Gross Sales Value</p>
      </div>
    </div>
  );
};

export default SummaryCards;