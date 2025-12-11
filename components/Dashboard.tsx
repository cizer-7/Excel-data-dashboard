import React, { useState, useEffect } from 'react';
import { DashboardConfig, DataRow } from '../types';
import { ChartWidget } from './ChartWidget';
import { FilterPanel } from './FilterPanel';
import { LayoutDashboard, FileText, BarChart2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DashboardProps {
  config: DashboardConfig;
  data: DataRow[];
  fileName: string;
  onReset: () => void;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ config, data, fileName, onReset, isDarkMode }) => {
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset filtered data when the underlying dataset changes (e.g. new file upload)
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', // Background matches theme
        ignoreElements: (element) => element.dataset.html2canvasIgnore === 'true'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95; // Scale to fit page with margins
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${fileName.split('.')[0]}_overview.pdf`);

    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFilterChange = (newData: DataRow[]) => {
    setFilteredData(newData);
  };

  return (
    <div className="animate-fade-in-up pb-20">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{config.title}</h1>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
                 <FileText className="w-3 h-3" />
                 <span>{fileName}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                 <BarChart2 className="w-3 h-3" />
                 <span>{filteredData.length} / {data.length} rows</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pr-12 sm:pr-0">
            <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Generating...' : 'Export PDF'}
            </button>
            <button 
                onClick={onReset}
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow"
            >
                New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Printable Content Area */}
      <div id="dashboard-content" className="bg-slate-50 dark:bg-slate-900 pb-8 transition-colors duration-300">
        {/* Summary Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-2xl p-6 sm:p-10 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-3">Executive Summary</h2>
            <p className="text-indigo-100 dark:text-indigo-200 text-lg leading-relaxed max-w-4xl opacity-90">
                {config.summary}
            </p>
            </div>
        </div>
        
        {/* Filter Section */}
        <div data-html2canvas-ignore="true" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
             <FilterPanel data={data} onFilterChange={handleFilterChange} />
        </div>

        {/* Charts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No data matches your filters.</p>
                    <button 
                        onClick={() => handleFilterChange(data)} 
                        className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-fr">
                {config.charts.map((chartConfig) => (
                    <div key={chartConfig.id} className="min-h-[400px]">
                    <ChartWidget 
                        config={chartConfig} 
                        data={filteredData}
                        isDarkMode={isDarkMode}
                    />
                    </div>
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};