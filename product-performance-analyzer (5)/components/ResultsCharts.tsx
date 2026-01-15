import React, { useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AnalysisResult, SegmentType, CurrencyCode } from '../types';
import { SEGMENT_COLORS, CURRENCY_CONFIG, MAIRA_COLORS } from '../constants';
import html2canvas from 'html2canvas';

interface Props {
  data: AnalysisResult;
  currency: CurrencyCode;
}

const copyChartToClipboard = async (containerRef: React.RefObject<HTMLDivElement>) => {
  if (!containerRef.current) return;
  
  try {
    // We capture the entire card container to include the headline and legends
    const canvas = await html2canvas(containerRef.current, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher scale for even better clarity in presentations
      logging: false,
      useCORS: true,
      ignoreElements: (element) => {
        // Specifically ignore the copy button and other UI controls
        return (
          element.tagName === 'BUTTON' || 
          element.classList.contains('copy-button-container')
        );
      }
    });
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (err) {
          console.error('Failed to write to clipboard:', err);
          throw new Error('Clipboard write failed');
        }
      } else {
        throw new Error('Failed to generate image');
      }
    }, 'image/png', 1.0);

  } catch (err) {
    console.error('Error capturing chart:', err);
    throw err;
  }
};

const CopyButton = ({ onClick }: { onClick: () => Promise<void> }) => {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('copying');
    try {
      await onClick();
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="copy-button-container">
      <button
        onClick={handleClick}
        disabled={status === 'copying'}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors disabled:opacity-50"
        title="Copy whole card as image"
      >
        {status === 'copied' ? (
          <>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-600">Copied Card</span>
          </>
        ) : status === 'error' ? (
          <span className="text-red-600">Error</span>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy Graph</span>
          </>
        )}
      </button>
    </div>
  );
};

const ResultsCharts: React.FC<Props> = ({ data, currency }) => {
  const config = CURRENCY_CONFIG[currency];
  
  const investmentRef = useRef<HTMLDivElement>(null);
  const revenueRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  // Pie Chart Data
  const costData = [
    data.segments[SegmentType.TOP_PERFORMERS],
    data.segments[SegmentType.LOW_PERFORMERS],
    data.segments[SegmentType.ZERO_REVENUE],
  ].map(s => ({ name: s.type, value: s.totalCost }));

  const revenueData = [
    data.segments[SegmentType.TOP_PERFORMERS],
    data.segments[SegmentType.LOW_PERFORMERS],
  ].map(s => ({ name: s.type, value: s.totalRevenue }));

  // Bar Chart Data
  const barChartSegments = [
    SegmentType.TOP_PERFORMERS,
    SegmentType.LOW_PERFORMERS,
    SegmentType.ZERO_REVENUE,
    SegmentType.IMPRESSION_ONLY
  ];

  const perProductData = barChartSegments.map(type => {
    const segment = data.segments[type];
    return {
      name: type,
      avgCost: segment.count > 0 ? segment.totalCost / segment.count : 0,
      avgRevenue: segment.count > 0 ? segment.totalRevenue / segment.count : 0,
    };
  });

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const currencyFormatter = (value: number) => 
    new Intl.NumberFormat(config.locale, { 
      style: 'currency', 
      currency: config.currency, 
      maximumFractionDigits: 0 
    }).format(value);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold mb-2" style={{ color: MAIRA_COLORS.primaryGreen }}>{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-mono font-medium">
                {currencyFormatter(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Investment Chart Card */}
        <div ref={investmentRef} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Investment Distribution (Cost)</h3>
            <CopyButton onClick={() => copyChartToClipboard(investmentRef)} />
          </div>
          <div className="w-full h-[384px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name as SegmentType]} />
                  ))}
                </Pie>
                <Tooltip formatter={currencyFormatter} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart Card */}
        <div ref={revenueRef} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Revenue Distribution</h3>
            <CopyButton onClick={() => copyChartToClipboard(revenueRef)} />
          </div>
          <div className="w-full h-[384px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name as SegmentType]} />
                  ))}
                </Pie>
                <Tooltip formatter={currencyFormatter} />
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per Product Metrics Bar Chart Card */}
      <div ref={metricsRef} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Per Product Metrics (Avg. Cost vs. Revenue)</h3>
          <CopyButton onClick={() => copyChartToClipboard(metricsRef)} />
        </div>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={perProductData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 11 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                stroke={MAIRA_COLORS.primaryOrange}
                axisLine={false} 
                tickLine={false}
                tick={{ fill: MAIRA_COLORS.primaryOrange, fontSize: 12, fontWeight: 600 }}
                tickFormatter={(val) => new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency, notation: 'compact' }).format(val)}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke={MAIRA_COLORS.primaryGreen}
                axisLine={false} 
                tickLine={false}
                tick={{ fill: MAIRA_COLORS.primaryGreen, fontSize: 12, fontWeight: 600 }}
                tickFormatter={(val) => new Intl.NumberFormat(config.locale, { style: 'currency', currency: config.currency, notation: 'compact' }).format(val)}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F1F5F9' }} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              
              <Bar 
                yAxisId="left"
                name="Cost per Product" 
                dataKey="avgCost" 
                fill={MAIRA_COLORS.primaryOrange} 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
              <Bar 
                yAxisId="right"
                name="Revenue per Product" 
                dataKey="avgRevenue" 
                fill={MAIRA_COLORS.primaryGreen} 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResultsCharts;