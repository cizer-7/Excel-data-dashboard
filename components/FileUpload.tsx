import React, { ChangeEvent, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndPassFile = (file: File) => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    // Simple extension check as fallback
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isCsvOrExcel = extension === 'csv' || extension === 'xls' || extension === 'xlsx';

    if (validTypes.includes(file.type) || isCsvOrExcel) {
      setError(null);
      onFileSelect(file);
    } else {
      setError("Please upload a valid CSV or Excel file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div 
        className={`relative group flex flex-col items-center justify-center w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
          ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}
          ${isProcessing ? 'opacity-70 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isProcessing ? (
             <div className="flex flex-col items-center animate-pulse">
                <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">Analyzing your data...</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">AI is identifying patterns and generating charts.</p>
             </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-200">
                Drag & Drop your dataset here
              </p>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Supports CSV, XLS, and XLSX files. <br/> Max file size 10MB recommended.
              </p>
              
              <label htmlFor="file-upload" className="relative cursor-pointer">
                <span className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm hover:shadow-md">
                  Browse Files
                </span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept=".csv, .xls, .xlsx"
                  onChange={handleChange}
                  disabled={isProcessing}
                />
              </label>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30 animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};