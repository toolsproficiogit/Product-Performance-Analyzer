import React, { useState, useEffect } from 'react';
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
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  // ROAS Threshold states
  const [thresholdMode, setThresholdMode] = useState<'auto' | 'manual'>('auto');
  const [manualRoasPct, setManualRoasPct] = useState<number>(1000);

  const performAnalysis = async (file: File, manualThreshold?: number) => {
    setLoading(true);
    setError(undefined);
    try {
      const threshold = manualThreshold !== undefined ? manualThreshold / 100 : undefined;
      const result = await processFile(file, threshold);
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setCurrentFile(file);
    await performAnalysis(file, thresholdMode === 'manual' ? manualRoasPct : undefined);
  };

  const handleReset = () => {
    setData(null);
    setError(undefined);
    setCurrentFile(null);
  };

  // Re-analyze when threshold changes
  useEffect(() => {
    if (currentFile) {
      const timer = setTimeout(() => {
        performAnalysis(currentFile, thresholdMode === 'manual' ? manualRoasPct : undefined);
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [thresholdMode, manualRoasPct]);

  const activeThreshold = data 
    ? (thresholdMode === 'manual' ? manualRoasPct / 100 : data.averageRoas) 
    : 0;

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: MAIRA_COLORS.secondaryGrey }}>
      {/* Header */}
      <header className="text-white sticky top-0 z-20 shadow-md" style={{ backgroundColor: MAIRA_COLORS.primaryGreen }}>
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
            
            {/* Threshold Configuration Bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Segmentation Threshold</h4>
                  <p className="text-xs text-slate-500">Define the ROAS target for group categorization.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setThresholdMode('auto')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${thresholdMode === 'auto' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Auto (Avg. ROAS)
                </button>
                <button
                  onClick={() => setThresholdMode('manual')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${thresholdMode === 'manual' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Manual Target
                </button>
                
                {thresholdMode === 'manual' && (
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                    <input
                      type="number"
                      value={manualRoasPct}
                      onChange={(e) => setManualRoasPct(Number(e.target.value))}
                      className="w-20 bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded p-1.5 focus:ring-orange-500 focus:border-orange-500"
                      min="0"
                      step="100"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                )}
              </div>
            </div>

            <SummaryCards data={data} currency={currency} thresholdRoas={activeThreshold} />
            
            <GroupTable data={data} currency={currency} />

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-6 text-lg" style={{ color: MAIRA_COLORS.primaryOrange }}>Strategic Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2" style={{ color: MAIRA_COLORS.primaryGreen }}>Top Products</span>
                  <span className="text-sm text-slate-700">Scaling budget aggressively for ROAS ≥ { (activeThreshold * 100).toFixed(0) }%. These are your profit drivers.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2" style={{ color: MAIRA_COLORS.primaryOrange }}>Low Performers</span>
                  <span className="text-sm text-slate-700">ROAS below { (activeThreshold * 100).toFixed(0) }%. Review bidding strategies or price competitiveness.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2 text-slate-700">Zero Revenue</span>
                  <span className="text-sm text-slate-700">Clicks with no value. Immediate audit required to stop budget wastage.</span>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold block mb-2 text-slate-500">Impression Only</span>
                  <span className="text-sm text-slate-700">Visibility without traffic. Check image quality and CTR optimization.</span>
                </div>
              </div>
            </div>

            <ResultsCharts data={data} currency={currency} />
            
            <BrandDeviceAnalysis data={data} currency={currency} />
            
            <ProductOpportunities 
              data={data} 
              currency={currency} 
              activeThreshold={activeThreshold} 
              thresholdMode={thresholdMode} 
            />

            <SlideTextGenerator data={data} currency={currency} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;