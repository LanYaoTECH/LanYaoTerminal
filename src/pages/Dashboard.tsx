import React from 'react';
import { MonitorSpeaker, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import DeviceCard from '@/components/DeviceCard';
import DeviceChart from '@/components/DeviceChart';

const Dashboard: React.FC = () => {
  console.log('主页面渲染');
  
  // 模拟设备数据
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
    }
  ];
  
  // 模拟图表数据
  const temperatureData = [
    { time: '00:00', value: 22 },
    { time: '04:00', value: 21 },
    { time: '08:00', value: 25 },
    { time: '12:00', value: 28 },
    { time: '16:00', value: 26 },
    { time: '20:00', value: 24 }
  ];
  
  const powerData = [
    { time: '00:00', value: 850 },
    { time: '04:00', value: 720 },
    { time: '08:00', value: 980 },
    { time: '12:00', value: 1200 },
    { time: '16:00', value: 1100 },
    { time: '20:00', value: 950 }
  ];
  
  const handleDeviceToggle = (deviceId: string, isOn: boolean) => {
    console.log(`设备 ${deviceId} 状态切换为：`, isOn);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">设备总览</h1>
        <p className="text-muted-foreground mt-1">实时监控所有设备状态和性能</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总设备数"
          value="24"
          icon={MonitorSpeaker}
          trend="up"
          trendValue="12%"
          color="blue"
        />
        <StatsCard
          title="在线设备"
          value="22"
          icon={CheckCircle}
          trend="up"
          trendValue="8%"
          color="green"
        />
        <StatsCard
          title="异常设备"
          value="2"
          icon={AlertTriangle}
          trend="down"
          trendValue="25%"
          color="red"
        />
        <StatsCard
          title="总功耗"
          value="2.8kW"
          icon={Zap}
          trend="stable"
          trendValue="0%"
          color="yellow"
        />
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceChart
          title="环境温度趋势"
          data={temperatureData}
          unit="°C"
          color="#10b981"
        />
        <DeviceChart
          title="系统功耗趋势"
          data={powerData}
          unit="W"
          color="#f59e0b"
        />
      </div>
      
      {/* 设备列表 */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">设备状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={handleDeviceToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;