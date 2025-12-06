
import React from 'react';
import { AnalysisResult, SegmentType, CurrencyCode } from '../types';
import { SEGMENT_COLORS, SEGMENT_DESCRIPTIONS, CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

const GroupTable: React.FC<Props> = ({ data, currency }) => {
  const config = CURRENCY_CONFIG[currency];

  const formatCurrency = (val: number, decimals = 0) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: decimals 
    }).format(val);

  const formatPct = (val: number) => `${val.toFixed(2)}%`;
  const formatRoas = (val: number) => `${(val * 100).toFixed(0)} %`;

  // Order of display as per logic flow
  const displayOrder = [
    SegmentType.TOP_PERFORMERS,
    SegmentType.LOW_PERFORMERS,
    SegmentType.ZERO_REVENUE,
    SegmentType.IMPRESSION_ONLY
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center" style={{ backgroundColor: `${MAIRA_COLORS.primaryGreen}0D` }}>
        <h3 className="font-bold" style={{ color: MAIRA_COLORS.primaryOrange }}>Performance Segmentation</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="font-semibold border-b border-slate-200" style={{ backgroundColor: '#f8fafc', color: MAIRA_COLORS.primaryGreen }}>
            <tr>
              <th className="px-6 py-3">Group Name</th>
              <th className="px-6 py-3 text-right">Products</th>
              <th className="px-6 py-3 text-right">Avg. CPC</th>
              <th className="px-6 py-3 text-right">Investment</th>
              <th className="px-6 py-3 text-right">% of Spend</th>
              <th className="px-6 py-3 text-right">Revenue</th>
              <th className="px-6 py-3 text-right">% of Rev</th>
              <th className="px-6 py-3 text-right">Group ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayOrder.map((type) => {
              const segment = data.segments[type];
              if (!segment) return null;
              
              const isRelevantForRev = type === SegmentType.TOP_PERFORMERS || type === SegmentType.LOW_PERFORMERS;
              const isRelevantForCost = type !== SegmentType.IMPRESSION_ONLY;
              const isRelevantForCpc = type !== SegmentType.IMPRESSION_ONLY && segment.totalClicks > 0;

              return (
                <tr key={type} className="hover:bg-[#083027]/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: SEGMENT_COLORS[type] }}
                      />
                      <div>
                        <div className="font-bold text-slate-800">{type}</div>
                        <div className="text-xs text-slate-500 hidden md:block">{SEGMENT_DESCRIPTIONS[type]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{segment.count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {isRelevantForCpc ? formatCurrency(segment.averageCpc, 2) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {isRelevantForCost ? formatCurrency(segment.totalCost) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {isRelevantForCost ? formatPct(segment.costPercentage) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {isRelevantForRev ? formatCurrency(segment.totalRevenue) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {isRelevantForRev ? formatPct(segment.revenuePercentage) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold" style={{ color: MAIRA_COLORS.primaryGreen }}>
                    {isRelevantForRev ? formatRoas(segment.roas) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupTable;
