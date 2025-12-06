
import React, { useCallback } from 'react';
import { MAIRA_COLORS } from '../constants';

interface Props {
  onFileUpload: (file: File) => void;
  error?: string;
  isProcessing: boolean;
}

const FileUpload: React.FC<Props> = ({ onFileUpload, error, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileUpload(e.dataTransfer.files[0]);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Instructions Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
          <h3 className="text-lg font-bold mb-4" style={{ color: MAIRA_COLORS.primaryOrange }}>How to Export Data</h3>
          <div className="text-sm text-slate-600 space-y-4">
            <p>
              Generate the report directly from your Google Ads account:
            </p>
            <ol className="list-decimal list-inside space-y-2 font-medium" style={{ color: MAIRA_COLORS.primaryGreen }}>
              <li>Go to <span className="bg-slate-100 px-1 rounded">Insights and reports</span></li>
              <li>Select <span className="bg-slate-100 px-1 rounded">Report editor</span></li>
              <li>Create a new <span className="bg-slate-100 px-1 rounded">Table</span> report</li>
              <li>Export as <span className="bg-slate-100 px-1 rounded">.csv</span></li>
            </ol>
            <div className="mt-4 p-3 bg-[#F54A23]/10 rounded-lg border border-[#F54A23]/20">
              <p className="font-semibold mb-2" style={{ color: MAIRA_COLORS.primaryOrange }}>Required Columns (In Order):</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-xs">
                <li>Item ID</li>
                <li>Brand</li>
                <li>Device</li>
                <li>Clicks</li>
                <li>Currency code</li>
                <li>Avg. CPC</li>
                <li>Impr.</li>
                <li>Cost</li>
                <li>Conversions</li>
                <li>Conv. value</li>
                <li>Conv. value / cost</li>
                <li>Search impr. share</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer h-full flex flex-col justify-center
            ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-[#F54A23] bg-white hover:bg-slate-50'}
          `}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            disabled={isProcessing}
          />
          <label htmlFor="file-upload" className="cursor-pointer block w-full">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MAIRA_COLORS.primaryOrange}15` }}>
                <svg className="w-6 h-6" style={{ color: MAIRA_COLORS.primaryOrange }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <div>
                <p className="text-base font-medium" style={{ color: MAIRA_COLORS.primaryOrange }}>
                  {isProcessing ? 'Processing...' : 'Upload Export File'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Drag & Drop or Click to Browse
                </p>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs w-full">
                  {error}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
