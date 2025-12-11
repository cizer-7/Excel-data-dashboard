export type DataRow = Record<string, string | number | boolean | null>;

export interface DataSet {
  fileName: string;
  headers: string[];
  data: DataRow[];
  rowCount: number;
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  AREA = 'area',
  PIE = 'pie',
  SCATTER = 'scatter'
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description: string;
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

export interface DashboardConfig {
  title: string;
  summary: string;
  charts: ChartConfig[];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  config: DashboardConfig | null;
}
