
import React from 'react';
import { AnalysisResult, CurrencyCode } from '../types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

const SummaryCards: React.FC<Props> = ({ data, currency }) => {
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
        <p className="text-sm font-medium text-slate-500 mb-1">Avg. ROAS</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatRoas(data.averageRoas)}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Analyzed Products</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{data.totalProducts.toLocaleString()}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Total Investment</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatCurrency(data.totalCost)}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>{formatCurrency(data.totalRevenue)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
