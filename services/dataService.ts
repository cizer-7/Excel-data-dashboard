import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DataSet, DataRow } from '../types';

export const parseFile = async (file: File): Promise<DataSet> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file);
  } else if (['xls', 'xlsx'].includes(extension || '')) {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel files.');
  }
};

const parseCSV = (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          // Log errors but try to proceed if we have data
          console.warn('CSV Parse errors:', results.errors);
        }
        
        const data = results.data as DataRow[];
        if (!data || data.length === 0) {
          reject(new Error('No data found in CSV file'));
          return;
        }

        const headers = results.meta.fields || Object.keys(data[0]);

        resolve({
          fileName: file.name,
          headers,
          data,
          rowCount: data.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

const parseExcel = (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume the first sheet is the target
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet) as DataRow[];
        
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in Excel file'));
          return;
        }

        const headers = Object.keys(jsonData[0]);

        resolve({
          fileName: file.name,
          headers,
          data: jsonData,
          rowCount: jsonData.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

/**
 * Prepares a sample of the dataset for the AI model to analyze.
 * We limit to top 50 rows and just the headers to save tokens.
 */
export const prepareDataSample = (dataset: DataSet): string => {
  const sampleSize = 50;
  const sampleData = dataset.data.slice(0, sampleSize);
  
  return JSON.stringify({
    headers: dataset.headers,
    rowCount: dataset.rowCount,
    sample: sampleData
  }, null, 2);
};
