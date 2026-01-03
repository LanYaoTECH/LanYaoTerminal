import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeviceChartProps {
  data?: Array<{ time: string; value: number; }>;
  dataKey?: string;
  title?: string;
  unit?: string;
  color?: string;
}

const DeviceChart: React.FC<DeviceChartProps> = ({
  data = [
    { time: '00:00', value: 22 },
    { time: '04:00', value: 21 },
    { time: '08:00', value: 25 },
    { time: '12:00', value: 28 },
    { time: '16:00', value: 26 },
    { time: '20:00', value: 24 }
  ],
  dataKey = 'value',
  title = '温度趋势',
  unit = '°C',
  color = '#3b82f6'
}) => {
  console.log('设备图表组件渲染：', title, data.length);
  
  return (
    <div data-cmp="DeviceChart" className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">单位: {unit}</span>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeviceChart;