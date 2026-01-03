import React from 'react';

interface StatusBadgeProps {
  status?: 'online' | 'offline' | 'warning' | 'error';
  text?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'offline',
  text = '离线'
}) => {
  console.log('状态徽章组件渲染：', status, text);
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getDotColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <span data-cmp="StatusBadge" className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      <span className={`w-2 h-2 rounded-full ${getDotColor(status)}`}></span>
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;