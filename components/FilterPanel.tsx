import React, { useState, useEffect, useRef } from 'react';
import { DataRow } from '../types';
import { Filter, X, Calendar, Search, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface FilterPanelProps {
  data: DataRow[];
  onFilterChange: (filteredData: DataRow[]) => void;
}

type FilterValue = string | { start: string; end: string };

interface ColumnMeta {
  name: string;
  type: 'categorical' | 'date';
  options?: string[]; // For categorical
  min?: string; // For date (YYYY-MM-DD)
  max?: string; // For date
}

// Custom Searchable Dropdown Component
const SearchableDropdown = ({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  value: string; 
  onChange: (val: string) => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm(""); // Reset search on close
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate mb-1.5 block" title={label}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left text-sm border rounded-lg px-3 py-2 flex items-center justify-between transition-colors
          ${isOpen ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-600'}
          bg-slate-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100
        `}
      >
        <span className="truncate block mr-2">
          {value || <span className="text-slate-400 dark:text-slate-500">All {label}s</span>}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-64 flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-lg">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            <div
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between
                ${value === "" ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
            >
              <span>All {label}s</span>
              {value === "" && <Check className="w-4 h-4" />}
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between
                    ${value === opt ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}
                  `}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-4 h-4" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({ data, onFilterChange }) => {
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, FilterValue>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  // Analyze data to find filterable columns
  useEffect(() => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const detectedColumns: ColumnMeta[] = [];
    const ROW_LIMIT = 200; // Limit analysis to first 200 rows for performance
    const sampleData = data.slice(0, ROW_LIMIT);

    headers.forEach(header => {
      // Get all values for this column (excluding null/undefined)
      const values = sampleData.map(row => row[header]).filter(v => v !== null && v !== undefined);
      
      if (values.length === 0) return;

      const uniqueValues = Array.from(new Set(values));
      const firstVal = values[0];

      // Check for Date
      // Heuristic: string that looks like a date and parses validly
      let isDate = false;
      if (typeof firstVal === 'string' && firstVal.length > 5) {
         const timestamp = Date.parse(firstVal);
         // Check if it's a valid number and not just a pure number string like "2023" (which usually means Year, effectively categorical)
         if (!isNaN(timestamp) && isNaN(Number(firstVal))) {
           isDate = true;
         }
      }

      // Check for Categorical
      // Heuristic: Low cardinality (<= 50 unique values)
      // We allow numbers here too (e.g. Year 2020, 2021)
      const isCategorical = uniqueValues.length <= 50;

      if (isDate) {
        detectedColumns.push({
          name: header,
          type: 'date',
        });
      } else if (isCategorical) {
        // Sort options. If numbers, numerical sort; else alphabetical
        const sortedOptions = uniqueValues.sort((a, b) => {
             if (typeof a === 'number' && typeof b === 'number') return a - b;
             return String(a).localeCompare(String(b));
        }).map(String);

        detectedColumns.push({
          name: header,
          type: 'categorical',
          options: sortedOptions
        });
      }
    });

    setColumns(detectedColumns);
    setActiveFilters({}); // Reset filters on new data
  }, [data]);

  // Apply filters whenever activeFilters changes
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      onFilterChange(data);
      return;
    }

    const filtered = data.filter(row => {
      return Object.entries(activeFilters).every(([key, filterValue]) => {
        const rowValue = row[key];
        
        if (rowValue === null || rowValue === undefined) return false;

        // Categorical Filter
        if (typeof filterValue === 'string') {
          return String(rowValue) === filterValue;
        }

        // Date Filter
        if (typeof filterValue === 'object') {
          const rowDate = new Date(String(rowValue)).getTime();
          const start = filterValue.start ? new Date(filterValue.start).getTime() : -Infinity;
          const end = filterValue.end ? new Date(filterValue.end).getTime() : Infinity;
          
          if (isNaN(rowDate)) return false;
          return rowDate >= start && rowDate <= end;
        }

        return true;
      });
    });

    onFilterChange(filtered);
  }, [activeFilters, data, onFilterChange]);

  const handleCategoryChange = (column: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value === "") {
        delete next[column];
      } else {
        next[column] = value;
      }
      return next;
    });
  };

  const handleDateChange = (column: string, field: 'start' | 'end', value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      const current = (next[column] as { start: string; end: string }) || { start: '', end: '' };
      
      const newDateRange = { ...current, [field]: value };
      
      // If both empty, remove filter
      if (!newDateRange.start && !newDateRange.end) {
        delete next[column];
      } else {
        next[column] = newDateRange;
      }
      return next;
    });
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapse toggle if button is clicked
    setActiveFilters({});
  };

  if (columns.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 transition-colors duration-300 overflow-visible">
      {/* Header / Collapse Trigger */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold text-base">Filter Data</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-2">
            {Object.keys(activeFilters).length} active
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {Object.keys(activeFilters).length > 0 && (
            <button 
              onClick={clearAll}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
          <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`
        overflow-visible transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-700
        ${isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 border-t-0 hidden'}
      `}>
        <div className="p-5 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {columns.map((col) => (
              <div key={col.name}>
                {col.type === 'categorical' && (
                  <SearchableDropdown 
                    label={col.name}
                    options={col.options || []}
                    value={(activeFilters[col.name] as string) || ""}
                    onChange={(val) => handleCategoryChange(col.name, val)}
                  />
                )}

                {col.type === 'date' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate" title={col.name}>
                      {col.name}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="date"
                          className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[38px]"
                          value={(activeFilters[col.name] as any)?.start || ""}
                          onChange={(e) => handleDateChange(col.name, 'start', e.target.value)}
                        />
                      </div>
                      <span className="text-slate-400 dark:text-slate-500">-</span>
                      <div className="relative flex-1">
                        <input
                          type="date"
                          className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 min-h-[38px]"
                          value={(activeFilters[col.name] as any)?.end || ""}
                          onChange={(e) => handleDateChange(col.name, 'end', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};