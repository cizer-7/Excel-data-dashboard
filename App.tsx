import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { parseFile, prepareDataSample } from './services/dataService';
import { generateDashboardConfig } from './services/geminiService';
import { DataSet, DashboardConfig, AnalysisState } from './types';
import { BarChart3, PieChart, TrendingUp, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [dataSet, setDataSet] = useState<DataSet | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    config: null,
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFileSelect = useCallback(async (file: File) => {
    setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // 1. Parse File
      const data = await parseFile(file);
      setDataSet(data);

      // 2. Prepare for AI
      const sample = prepareDataSample(data);

      // 3. Generate Config with Gemini
      const config = await generateDashboardConfig(sample);
      
      setAnalysis({
        isLoading: false,
        error: null,
        config: config,
      });

    } catch (err: any) {
      console.error(err);
      setAnalysis({
        isLoading: false,
        error: err.message || "An unexpected error occurred",
        config: null,
      });
      setDataSet(null); // Reset data on fatal error
    }
  }, []);

  const handleReset = () => {
    setDataSet(null);
    setAnalysis({
      isLoading: false,
      error: null,
      config: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Theme Toggle Button - Fixed Top Right */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all focus:outline-none"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* If we have a dashboard configuration, show the dashboard */}
      {analysis.config && dataSet ? (
        <Dashboard 
          config={analysis.config} 
          data={dataSet.data} 
          fileName={dataSet.fileName}
          onReset={handleReset}
          isDarkMode={isDarkMode}
        />
      ) : (
        /* Otherwise show the Landing/Upload screen */
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center max-w-3xl mx-auto">
                {/* "Powered by Gemini" Label Removed Here */}
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                  Turn your spreadsheets into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Insights</span>
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Upload your CSV or Excel file and let our AI analyze your data to automatically generate an interactive, professional dashboard.
                </p>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 w-full transition-colors duration-300">
                  <FileUpload 
                    onFileSelect={handleFileSelect} 
                    isProcessing={analysis.isLoading} 
                  />
                  {analysis.error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/50">
                      Error: {analysis.error}
                    </div>
                  )}
                </div>

                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
                   <div className="flex flex-col items-center text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                         <BarChart3 className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Smart Visuals</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">AI automatically selects the best charts (Bar, Line, Pie, etc.) for your specific data types.</p>
                   </div>
                   <div className="flex flex-col items-center text-center p-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                         <TrendingUp className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Trend Analysis</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Identify hidden trends, outliers, and key patterns in your dataset instantly.</p>
                   </div>
                   <div className="flex flex-col items-center text-center p-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                         <PieChart className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Zero Config</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">No need to configure axes or select columns manually. Just drop and view.</p>
                   </div>
                </div>
              </div>
            </main>
            
            <footer className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              <p>&copy; {new Date().getFullYear()} InsightFlow AI. Data is processed locally and via Gemini API.</p>
            </footer>
        </div>
      )}
    </div>
  );
};

export default App;