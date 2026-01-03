import React from 'react';
import DeviceCard from '@/components/DeviceCard';

const DeviceControl: React.FC = () => {
  console.log('设备控制页面渲染');
  
  const devices = [
    {
      id: 'dev-001',
      name: '智能开关-001',
      type: 'switch' as const,
      status: 'online' as const,
      isOn: true,
      power: 120
    },
    {
      id: 'dev-002',
      name: '离心机-A01',
      type: 'centrifuge' as const,
      status: 'online' as const,
      isOn: true,
      temperature: 25,
      power: 450,
      speed: 3000
    },
    {
      id: 'dev-003',
      name: '注射泵-P01',
      type: 'pump' as const,
      status: 'warning' as const,
      isOn: false,
      power: 80
    },
    {
      id: 'dev-004',
      name: '冰箱-R01',
      type: 'refrigerator' as const,
      status: 'online' as const,
      isOn: true,
      temperature: 4,
      humidity: 65,
      power: 200
    },
    {
      id: 'dev-005',
      name: '智能开关-002',
      type: 'switch' as const,
      status: 'offline' as const,
      isOn: false,
      power: 0
    },
    {
      id: 'dev-006',
      name: '离心机-A02',
      type: 'centrifuge' as const,
      status: 'error' as const,
      isOn: false,
      temperature: 35,
      power: 0,
      speed: 0
    }
  ];
  
  const handleDeviceToggle = (deviceId: string, isOn: boolean) => {
    console.log(`设备控制：${deviceId} 状态切换为：`, isOn);
  };
  
  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">设备控制</h1>
        <p className="text-muted-foreground mt-1">远程控制设备开关状态</p>
      </div>
      
      {/* 设备控制网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onToggle={handleDeviceToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default DeviceControl;