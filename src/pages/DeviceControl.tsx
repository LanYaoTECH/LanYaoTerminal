import React, { useState } from 'react';
import {
  Droplets, RotateCcw, Play, Square, ArrowUp, ArrowDown,
  Gauge, Target, Compass, AlertTriangle, Settings2
} from 'lucide-react';
import { useGateway } from '@/contexts/GatewayContext';
import StatusBadge from '@/components/StatusBadge';
import { getMotorStateLabel, getMotorStateColor, formatUptime } from '@/types/device';
import type { PumpStatus, MotorStatus } from '@/types/device';

const DeviceControl: React.FC = () => {
  const { devices, deviceStatuses, deviceConnections, sendCommand } = useGateway();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [speeds, setSpeeds] = useState<Record<string, number>>({});
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [positionSpeeds, setPositionSpeeds] = useState<Record<string, number>>({});
  const [periodSpeed, setPeriodSpeed] = useState(100);

  // If no device selected, select the first one
  const activeDeviceId = selectedDeviceId || devices[0]?.id || null;
  const activeDevice = devices.find((d) => d.id === activeDeviceId);
  const status: PumpStatus | null = activeDeviceId ? (deviceStatuses[activeDeviceId] as PumpStatus | null) : null;
  const isConnected = activeDeviceId ? (deviceConnections[activeDeviceId] ?? false) : false;

  const send = (payload: Record<string, unknown>) => {
    if (activeDeviceId) sendCommand(activeDeviceId, payload);
  };

  const getSpeedKey = (motorIdx: number) => `${activeDeviceId}-${motorIdx}`;

  const handleMove = (mIdx: number, dir: 'fwd' | 'stop' | 'bwd') => {
    const key = getSpeedKey(mIdx);
    send({ cmd: 'move', m_idx: mIdx, dir, val: speeds[key] ?? 100 });
  };

  const handleGoPosition = (mIdx: number) => {
    const key = getSpeedKey(mIdx);
    send({
      cmd: 'angle',
      m_idx: mIdx,
      val: positions[key] ?? 0,
      speed: positionSpeeds[key] ?? 100,
    });
  };

  const handleSetMode = (mode: 'raw' | 'period') => {
    send({ cmd: 'set_mode', mode });
  };

  const handlePeriodControl = (action: 'start' | 'stop') => {
    if (action === 'start') {
      send({ cmd: 'period_control', action: 'start', speed_a: periodSpeed });
    } else {
      send({ cmd: 'period_control', action: 'stop' });
    }
  };

  const handleCalibrate = (mIdx: number, action: 'enter' | 'set_min' | 'set_max') => {
    send({ cmd: 'calibrate', m_idx: mIdx, action });
  };

  const handleInvertDirection = (mIdx: number, inverted: boolean) => {
    send({ cmd: 'invert_direction', m_idx: mIdx, inverted });
  };

  const handleRebind = (mIdx: number, canId: number) => {
    send({ cmd: 'bind', m_idx: mIdx, can_id: canId });
  };

  const renderMotorCard = (motor: MotorStatus, idx: number) => {
    const key = getSpeedKey(idx);
    const stateLabel = getMotorStateLabel(motor.state);
    const stateColor = getMotorStateColor(motor.state);

    return (
      <div key={idx} className="bg-card rounded-lg border border-border p-6 shadow-custom">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${motor.state === 4 ? 'bg-primary text-primary-foreground' : motor.state === 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">电机 #{idx + 1}</h3>
              <p className="text-sm text-muted-foreground">CAN ID: {motor.id}</p>
            </div>
          </div>
          <StatusBadge status={stateColor} text={stateLabel} />
        </div>

        {/* Motor Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">转速</span>
            </div>
            <span className="text-sm font-medium text-foreground">{motor.speed.toFixed(1)} RPM</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">位置</span>
            </div>
            <span className="text-sm font-medium text-foreground">{motor.pos}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">校准</span>
            </div>
            <span className={`text-sm font-medium ${motor.calibrated ? 'text-green-600' : 'text-yellow-600'}`}>
              {motor.calibrated ? `已校准 (${motor.pos_min} ~ ${motor.pos_max})` : '未校准'}
            </span>
          </div>
          {motor.direction_inverted && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">方向已反转</span>
            </div>
          )}
        </div>

        {/* Raw Mode Controls */}
        {status?.mode === 'raw' && (
          <div className="pt-4 border-t border-border space-y-4">
            {/* Speed Control */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                速度控制: {speeds[key] ?? 100} RPM
              </label>
              <input
                type="range"
                min="0"
                max="3000"
                value={speeds[key] ?? 100}
                onChange={(e) => setSpeeds({ ...speeds, [key]: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleMove(idx, 'fwd')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span>正转</span>
                </button>
                <button
                  onClick={() => handleMove(idx, 'stop')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>停止</span>
                </button>
                <button
                  onClick={() => handleMove(idx, 'bwd')}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>反转</span>
                </button>
              </div>
            </div>

            {/* Position Control */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">位置定位</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={positions[key] ?? 0}
                  onChange={(e) => setPositions({ ...positions, [key]: parseInt(e.target.value) || 0 })}
                  placeholder="目标位置"
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={positionSpeeds[key] ?? 100}
                  onChange={(e) => setPositionSpeeds({ ...positionSpeeds, [key]: parseInt(e.target.value) || 100 })}
                  placeholder="速度"
                  className="w-24 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => handleGoPosition(idx)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  定位
                </button>
              </div>
            </div>

            {/* Rebind CAN ID */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">CAN ID 重绑定</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  defaultValue={motor.id}
                  id={`rebind-${idx}`}
                  className="w-24 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(`rebind-${idx}`) as HTMLInputElement;
                    handleRebind(idx, parseInt(input.value) || motor.id);
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-accent transition-colors border border-border"
                >
                  绑定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Period Mode - Motor Info */}
        {status?.mode === 'period' && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">方向反转</span>
              <button
                onClick={() => handleInvertDirection(idx, !motor.direction_inverted)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  motor.direction_inverted ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  motor.direction_inverted ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Calibration */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">校准操作</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCalibrate(idx, 'enter')}
                  className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-xs hover:bg-accent transition-colors border border-border"
                >
                  进入校准
                </button>
                <button
                  onClick={() => handleCalibrate(idx, 'set_min')}
                  className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-xs hover:bg-accent transition-colors border border-border"
                >
                  设置 MIN
                </button>
                <button
                  onClick={() => handleCalibrate(idx, 'set_max')}
                  className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg text-xs hover:bg-accent transition-colors border border-border"
                >
                  设置 MAX
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">设备控制</h1>
        <p className="text-muted-foreground mt-1">远程控制设备运行状态</p>
      </div>

      {devices.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">暂无设备</h2>
          <p className="text-muted-foreground">请先在"设备管理"中添加设备</p>
        </div>
      ) : (
        <>
          {/* Device Selector */}
          {devices.length > 1 && (
            <div className="mb-6 flex space-x-2">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    d.id === activeDeviceId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}

          {activeDevice && (
            <div className="space-y-6">
              {/* Device Status Overview */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-custom">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${isConnected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{activeDevice.name}</h2>
                      <p className="text-sm text-muted-foreground">{activeDevice.ip}:{activeDevice.port}</p>
                    </div>
                  </div>
                  <StatusBadge
                    status={isConnected ? 'online' : 'offline'}
                    text={isConnected ? '已连接' : '未连接'}
                  />
                </div>

                {status && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">运行时间</p>
                      <p className="text-sm font-medium text-foreground">{formatUptime(status.uptime)}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">WiFi</p>
                      <p className="text-sm font-medium text-foreground">{status.wifi ? '已连接' : '未连接'}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">控制模式</p>
                      <p className="text-sm font-medium text-foreground">{status.mode === 'raw' ? '直接控制' : '周期模式'}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">电机数量</p>
                      <p className="text-sm font-medium text-foreground">{status.motors?.length ?? 0}</p>
                    </div>
                  </div>
                )}

                {!status && isConnected && (
                  <p className="text-sm text-muted-foreground">等待设备状态数据...</p>
                )}
                {!isConnected && (
                  <p className="text-sm text-muted-foreground">设备未连接，请检查网络</p>
                )}
              </div>

              {/* Mode Switch + Period Controls */}
              {status && isConnected && (
                <div className="bg-card rounded-lg border border-border p-6 shadow-custom">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Settings2 className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">模式切换</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSetMode('raw')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          status.mode === 'raw'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        直接控制
                      </button>
                      <button
                        onClick={() => handleSetMode('period')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          status.mode === 'period'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        周期模式
                      </button>
                    </div>
                  </div>

                  {/* Period Mode Controls */}
                  {status.mode === 'period' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          周期速度 A: {periodSpeed} RPM
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="500"
                          value={periodSpeed}
                          onChange={(e) => setPeriodSpeed(parseInt(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handlePeriodControl('start')}
                          disabled={status.period?.enabled}
                          className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          <span>启动周期</span>
                        </button>
                        <button
                          onClick={() => handlePeriodControl('stop')}
                          disabled={!status.period?.enabled}
                          className="flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <Square className="w-4 h-4" />
                          <span>停止周期</span>
                        </button>
                      </div>

                      {/* Period Status */}
                      {status.period && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">状态</p>
                            <p className="text-sm font-medium text-foreground">
                              {status.period.enabled ? '运行中' : '停止'}
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">当前周期</p>
                            <p className="text-sm font-medium text-foreground">
                              Cycle {status.period.current_cycle}
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">进度</p>
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${(status.period.cycle_progress * 100).toFixed(0)}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(status.period.cycle_progress * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">已完成周期</p>
                            <p className="text-sm font-medium text-foreground">
                              {status.period.cycles_completed}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Motor Cards */}
              {status && status.motors && status.motors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">电机列表</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {status.motors.map((motor, idx) => renderMotorCard(motor, idx))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeviceControl;