import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ChartConfig, ChartType, DataRow } from '../types';
import { BarChart2, TrendingUp, Activity, PieChart as PieIcon, Dot } from 'lucide-react';

interface ChartWidgetProps {
  config: ChartConfig;
  data: DataRow[];
  isDarkMode?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'];

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 border shadow-xl rounded-lg text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
        <p className={`font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className={`capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{entry.name}:</span>
            <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({ config, data, isDarkMode = false }) => {
  const [currentType, setCurrentType] = useState<ChartType>(config.type);
  // Removed isHovering state as buttons should be always visible for better UX
  
  // State for Legend Interactions
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  // Common Props for Axes dependent on theme
  const axisProps = {
    tick: { fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' },
    tickLine: false,
    axisLine: { stroke: isDarkMode ? '#334155' : '#e2e8f0' },
  };
  
  const gridProps = {
    strokeDasharray: "3 3", 
    vertical: false, 
    stroke: isDarkMode ? '#334155' : '#f1f5f9' 
  };

  const handleLegendClick = (e: any) => {
    // For Pie charts, e.value is the category name. For others, e.dataKey is the series key.
    const key = e.dataKey || e.value;
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleLegendMouseEnter = (e: any) => {
    const key = e.dataKey || e.value;
    setHoveredSeries(key);
  };

  const handleLegendMouseLeave = () => {
    setHoveredSeries(null);
  };

  const renderChart = () => {
    const legendProps = {
      wrapperStyle: { paddingTop: '20px', cursor: 'pointer' },
      onClick: handleLegendClick,
      onMouseEnter: handleLegendMouseEnter,
      onMouseLeave: handleLegendMouseLeave,
      formatter: (value: string) => <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{value}</span>
    };

    switch (currentType) {
      case ChartType.BAR:
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={config.xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} />
            <Legend {...legendProps} />
            {config.yKeys.map((key, index) => {
              const isDimmed = hoveredSeries && hoveredSeries !== key;
              return (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                  hide={hiddenSeries.has(key)}
                  opacity={isDimmed ? 0.3 : 1}
                />
              );
            })}
          </BarChart>
        );

      case ChartType.LINE:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={config.xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend {...legendProps} />
            {config.yKeys.map((key, index) => {
              const isDimmed = hoveredSeries && hoveredSeries !== key;
              return (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: isDarkMode ? '#1e293b' : '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  hide={hiddenSeries.has(key)}
                  strokeOpacity={isDimmed ? 0.2 : 1}
                />
              );
            })}
          </LineChart>
        );

      case ChartType.AREA:
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={config.xKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend {...legendProps} />
            {config.yKeys.map((key, index) => {
              const isDimmed = hoveredSeries && hoveredSeries !== key;
              return (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stackId="1" 
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]} 
                  fillOpacity={isDimmed ? 0.1 : 0.6}
                  strokeOpacity={isDimmed ? 0.2 : 1}
                  hide={hiddenSeries.has(key)}
                />
              );
            })}
          </AreaChart>
        );

      case ChartType.PIE:
        const pieData = data.filter(entry => !hiddenSeries.has(String(entry[config.xKey])));

        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey={config.yKeys[0]}
              nameKey={config.xKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
            >
              {pieData.map((entry, index) => {
                const name = String(entry[config.xKey]);
                const originalIndex = data.findIndex(d => String(d[config.xKey]) === name);
                const isDimmed = hoveredSeries && hoveredSeries !== name;
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[originalIndex % COLORS.length]} 
                    fillOpacity={isDimmed ? 0.3 : 1}
                    stroke={isDimmed ? "none" : (isDarkMode ? '#1e293b' : '#fff')}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend 
               layout="vertical" 
               verticalAlign="middle" 
               align="right" 
               wrapperStyle={{ paddingLeft: '20px', cursor: 'pointer' }}
               onClick={handleLegendClick}
               onMouseEnter={handleLegendMouseEnter}
               onMouseLeave={handleLegendMouseLeave}
               formatter={(value: string) => <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{value}</span>}
            />
          </PieChart>
        );
      
      case ChartType.SCATTER:
         return (
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
            <XAxis type="category" dataKey={config.xKey} name={config.xKey} {...axisProps} allowDuplicatedCategory={false} />
            <YAxis type="number" dataKey={config.yKeys[0]} name={config.yKeys[0]} {...axisProps} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend {...legendProps} />
            <Scatter 
              name={config.title} 
              data={data} 
              fill={COLORS[0]} 
              hide={hiddenSeries.has(config.title)}
              opacity={hoveredSeries && hoveredSeries !== config.title ? 0.3 : 1}
            />
          </ScatterChart>
         );

      default:
        return <div className="flex items-center justify-center h-full text-slate-400">Unsupported chart type</div>;
    }
  };

  const chartOptions = [
    { type: ChartType.BAR, icon: BarChart2, label: 'Bar' },
    { type: ChartType.LINE, icon: TrendingUp, label: 'Line' },
    { type: ChartType.AREA, icon: Activity, label: 'Area' },
    { type: ChartType.PIE, icon: PieIcon, label: 'Pie' },
    { type: ChartType.SCATTER, icon: Dot, label: 'Scatter' },
  ];

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300 relative group"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">{config.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{config.description}</p>
        </div>
        
        {/* Chart Switcher - Styled like a segmented control/toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
          {chartOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setCurrentType(option.type)}
              className={`p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                currentType === option.type 
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600/50'
              }`}
              title={`Switch to ${option.label} Chart`}
            >
              <option.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};