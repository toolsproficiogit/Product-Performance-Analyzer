
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import SummaryCards from './components/SummaryCards';
import GroupTable from './components/GroupTable';
import ResultsCharts from './components/ResultsCharts';
import BrandDeviceAnalysis from './components/BrandDeviceAnalysis';
import ProductOpportunities from './components/ProductOpportunities';
import SlideTextGenerator from './components/SlideTextGenerator';
import { processFile } from './services/analyzer';
import { AnalysisResult, CurrencyCode } from './types';
import { CURRENCY_CONFIG, MAIRA_COLORS } from './constants';

const App: React.FC = () => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<CurrencyCode>('CZK');

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(undefined);
    setData(null);

    try {
      const result = await processFile(file);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(undefined);
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: MAIRA_COLORS.secondaryGrey }}>
      {/* Header */}
      <header className="text-white sticky top-0 z-10 shadow-md" style={{ backgroundColor: MAIRA_COLORS.primaryGreen }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Product Performance Analyzer</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="currency-select" className="text-sm font-medium text-white/80 hidden sm:block">
                Currency:
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-[#06251E] border border-white/20 text-white text-sm rounded-lg focus:ring-[#F54A23] focus:border-[#F54A23] block p-2"
              >
                {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {data && (
              <button 
                onClick={handleReset}
                className="text-sm font-medium text-white/80 hover:text-[#F54A23] transition-colors"
              >
                Analyze New File
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!data ? (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold sm:text-4xl mb-4" style={{ color: MAIRA_COLORS.primaryOrange }}>
                Product Performance Segmentation
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your Google Ads product export to automatically calculate ROAS and identify your top performers and budget wasters.
              </p>
            </div>
            
            <FileUpload 
              onFileUpload={handleFileUpload} 
              error={error}
              isProcessing={loading}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <SummaryCards data={data} currency={currency} />
            
            {/* Performance Table - Full Width */}
            <GroupTable data={data} currency={currency} />

            {/* Strategic Recommendations - Full Width Grid */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-6 text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Strategic Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2" style={{ color: MAIRA_COLORS.primaryGreen }}>Top Products</span>
                  <span className="text-sm text-slate-700">Scale budget aggressively. These are your profit drivers. Ensure 100% impression share.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2" style={{ color: MAIRA_COLORS.primaryOrange }}>Low Performers</span>
                  <span className="text-sm text-slate-700">Review bidding strategies. Check product pricing or landing pages. Consider lowering max CPC.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2 text-slate-700">Zero Revenue</span>
                  <span className="text-sm text-slate-700">Immediate audit required. Check for broken links, out of stock status, or irrelevant search terms.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2 text-slate-500">Impression Only</span>
                  <span className="text-sm text-slate-700">Check main image quality and price competitiveness. Your ads are seen but ignored.</span>
                </div>
              </div>
            </div>

            <ResultsCharts data={data} currency={currency} />
            
            {/* New Analysis Sections */}
            <BrandDeviceAnalysis data={data} currency={currency} />
            <ProductOpportunities data={data} currency={currency} />

            <SlideTextGenerator data={data} currency={currency} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
