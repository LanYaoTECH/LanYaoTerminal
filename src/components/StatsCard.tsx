import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title = '总设备数',
  value = '0',
  icon: Icon = () => <div className="w-6 h-6 bg-gray-400 rounded" />,
  trend = 'stable',
  trendValue = '0%',
  color = 'blue'
}) => {
  console.log('统计卡片组件渲染：', title, value);
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };
  
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };
  
  const getTrendSymbol = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };
  
  return (
    <div data-cmp="StatsCard" className="bg-card rounded-lg border border-border p-6 shadow-custom">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {getTrendSymbol(trend)} {trendValue}
            </span>
            <span className="text-sm text-muted-foreground ml-2">较上周</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;