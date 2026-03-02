import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { MonitorSpeaker, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import DeviceCard from '@/components/DeviceCard';
import DeviceChart from '@/components/DeviceChart';
import { useGateway } from '@/contexts/GatewayContext';
import type { PumpStatus } from '@/types/device';

const Dashboard: React.FC = () => {
  const { devices, deviceStatuses, deviceConnections, connected } = useGateway();
  
  // Track speed history for chart
  const [speedHistory, setSpeedHistory] = useState<Array<{ time: string; value: number }>>([]);
  const historyRef = useRef(speedHistory);
  historyRef.current = speedHistory;

  // Update speed chart data from live statuses
  const updateSpeedHistory = useCallback(() => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let totalSpeed = 0;
    let motorCount = 0;
    
    for (const status of Object.values(deviceStatuses)) {
      if (status && (status as PumpStatus).motors) {
        for (const motor of (status as PumpStatus).motors) {
          totalSpeed += Math.abs(motor.speed);
          motorCount++;
        }
      }
    }

    const avgSpeed = motorCount > 0 ? totalSpeed / motorCount : 0;
    const prev = historyRef.current;
    const next = [...prev, { time: now, value: Math.round(avgSpeed * 10) / 10 }].slice(-20);
    setSpeedHistory(next);
  }, [deviceStatuses]);

  useEffect(() => {
    const interval = setInterval(updateSpeedHistory, 2000);
    return () => clearInterval(interval);
  }, [updateSpeedHistory]);

  // Compute real stats
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => deviceConnections[d.id]).length;
  const offlineDevices = totalDevices - onlineDevices;

  // Map devices to DeviceCard format
  const deviceCards = useMemo(() => {
    return devices.map((d) => {
      const isConn = deviceConnections[d.id] ?? false;
      const status = deviceStatuses[d.id] as PumpStatus | undefined;
      const avgSpeed = status?.motors
        ? status.motors.reduce((sum, m) => sum + Math.abs(m.speed), 0) / status.motors.length
        : 0;

      return {
        id: d.id,
        name: d.name,
        type: 'pump' as const,
        status: isConn ? ('online' as const) : ('offline' as const),
        isOn: isConn && (status?.motors?.some((m) => m.state === 4) ?? false),
        speed: Math.round(avgSpeed),
      };
    });
  }, [devices, deviceConnections, deviceStatuses]);

  // Position history (using motor positions)
  const [posHistory, setPosHistory] = useState<Array<{ time: string; value: number }>>([]);
  const posHistoryRef = useRef(posHistory);
  posHistoryRef.current = posHistory;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      let totalPos = 0;
      let count = 0;
      for (const status of Object.values(deviceStatuses)) {
        if (status && (status as PumpStatus).motors) {
          for (const motor of (status as PumpStatus).motors) {
            totalPos += Math.abs(motor.pos);
            count++;
          }
        }
      }
      const avgPos = count > 0 ? totalPos / count : 0;
      const prev = posHistoryRef.current;
      const next = [...prev, { time: now, value: Math.round(avgPos) }].slice(-20);
      setPosHistory(next);
    }, 2000);
    return () => clearInterval(interval);
  }, [deviceStatuses]);

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">设备总览</h1>
          <p className="text-muted-foreground mt-1">设备状态监控</p>
        </div>
        <div className="flex items-center space-x-2">
          {connected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          <span className={`text-sm ${connected ? 'text-green-600' : 'text-muted-foreground'}`}>
            网关{connected ? '已连接' : '未连接'}
          </span>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总设备数"
          value={String(totalDevices)}
          icon={MonitorSpeaker}
          trend="stable"
          trendValue={`${totalDevices} 台`}
          color="blue"
        />
        <StatsCard
          title="在线设备"
          value={String(onlineDevices)}
          icon={CheckCircle}
          trend={onlineDevices > 0 ? 'up' : 'stable'}
          trendValue={totalDevices > 0 ? `${Math.round(onlineDevices / totalDevices * 100)}%` : '0%'}
          color="green"
        />
        <StatsCard
          title="离线设备"
          value={String(offlineDevices)}
          icon={AlertTriangle}
          trend={offlineDevices > 0 ? 'down' : 'stable'}
          trendValue={totalDevices > 0 ? `${Math.round(offlineDevices / totalDevices * 100)}%` : '0%'}
          color="red"
        />
        <StatsCard
          title="网关状态"
          value={connected ? '在线' : '离线'}
          icon={connected ? Wifi : WifiOff}
          trend={connected ? 'up' : 'down'}
          trendValue={connected ? '正常' : '断开'}
          color={connected ? 'green' : 'red'}
        />
      </div>
      
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceChart
          title="平均电机转速"
          data={speedHistory.length > 0 ? speedHistory : [{ time: '-', value: 0 }]}
          unit="RPM"
          color="#3b82f6"
        />
        <DeviceChart
          title="平均电机位置"
          data={posHistory.length > 0 ? posHistory : [{ time: '-', value: 0 }]}
          unit="pos"
          color="#10b981"
        />
      </div>
      
      {/* 设备列表 */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">设备状态</h2>
        {deviceCards.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">暂无设备，请在"设备管理"中添加</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deviceCards.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onToggle={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;