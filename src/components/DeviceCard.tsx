import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  Power,
  Snowflake,
  RotateCcw
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import DeviceSwitch from './DeviceSwitch';

interface DeviceData {
  id: string;
  name: string;
  type: 'switch' | 'centrifuge' | 'pump' | 'refrigerator';
  status: 'online' | 'offline' | 'warning' | 'error';
  isOn: boolean;
  temperature?: number;
  humidity?: number;
  power?: number;
  speed?: number;
}

interface DeviceCardProps {
  device?: DeviceData;
  onToggle?: (deviceId: string, isOn: boolean) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device = {
    id: '1',
    name: '智能开关-001',
    type: 'switch',
    status: 'online',
    isOn: true,
    power: 120
  },
  onToggle = () => console.log('设备开关切换')
}) => {
  console.log('设备卡片组件渲染：', device.name, device.status);
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'centrifuge':
        return <RotateCcw className="w-6 h-6" />;
      case 'pump':
        return <Droplets className="w-6 h-6" />;
      case 'refrigerator':
        return <Snowflake className="w-6 h-6" />;
      default:
        return <Power className="w-6 h-6" />;
    }
  };
  
  const getDeviceTypeName = (type: string) => {
    switch (type) {
      case 'centrifuge':
        return '离心机';
      case 'pump':
        return '注射泵';
      case 'refrigerator':
        return '冰箱';
      default:
        return '智能开关';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'warning':
        return '警告';
      case 'error':
        return '故障';
      default:
        return '离线';
    }
  };
  
  return (
    <div data-cmp="DeviceCard" className="bg-card rounded-lg border border-border p-6 shadow-custom hover:shadow-lg transition-shadow">
      {/* 设备头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${device.status === 'online' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{device.name}</h3>
            <p className="text-sm text-muted-foreground">{getDeviceTypeName(device.type)}</p>
          </div>
        </div>
        <StatusBadge status={device.status} text={getStatusText(device.status)} />
      </div>
      
      {/* 设备参数 */}
      <div className="space-y-3 mb-4">
        {device.temperature !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">温度</span>
            </div>
            <span className="text-sm font-medium text-foreground">{device.temperature}°C</span>
          </div>
        )}
        
        {device.humidity !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">湿度</span>
            </div>
            <span className="text-sm font-medium text-foreground">{device.humidity}%</span>
          </div>
        )}
        
        {device.power !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">功率</span>
            </div>
            <span className="text-sm font-medium text-foreground">{device.power}W</span>
          </div>
        )}
        
        {device.speed !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">转速</span>
            </div>
            <span className="text-sm font-medium text-foreground">{device.speed} RPM</span>
          </div>
        )}
      </div>
      
      {/* 控制开关 */}
      <div className="pt-4 border-t border-border">
        <DeviceSwitch
          isOn={device.isOn}
          onToggle={(value) => onToggle(device.id, value)}
          deviceName={device.name}
        />
      </div>
    </div>
  );
};

export default DeviceCard;