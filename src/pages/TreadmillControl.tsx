import React, { useEffect, useState } from 'react';
import {
  Activity, Play, Pause, Square, RotateCw, AlertTriangle, ArrowLeftRight,
  Gauge, Clock, Route, RefreshCw,
} from 'lucide-react';
import { useGateway } from '@/contexts/GatewayContext';
import StatusBadge from '@/components/StatusBadge';
import { TreadmillStateMap, formatSeconds, isTreadmillStatus } from '@/types/device';
import type { TreadmillStatus } from '@/types/device';

const TreadmillControl: React.FC = () => {
  const { devices: allDevices, deviceStatuses, deviceConnections, sendCommand } = useGateway();
  const devices = allDevices.filter((d) => d.type === 'treadmill');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId || devices[0]?.id || null;
  const activeDevice = devices.find((d) => d.id === activeId);

  const rawStatus = activeId ? deviceStatuses[activeId] : null;
  const status: TreadmillStatus | null = isTreadmillStatus(rawStatus) ? rawStatus : null;
  const isConnected = activeId ? (deviceConnections[activeId] ?? false) : false;

  // Form state (uncommitted)
  const [speedMps, setSpeedMps] = useState(0.5);
  const [durationMin, setDurationMin] = useState(10);
  const [fwd, setFwd] = useState(true);

  // Sync form with device settings when device changes or first status arrives
  useEffect(() => {
    if (status) {
      setSpeedMps(status.settings.target_speed_mps);
      setDurationMin(Math.round(status.settings.target_time_sec / 60));
      setFwd(status.settings.fwd);
    }
  }, [activeId, status?.settings.target_speed_mps,
      status?.settings.target_time_sec, status?.settings.fwd]);

  const send = (payload: Record<string, unknown>) => {
    if (activeId) sendCommand(activeId, payload);
  };

  const handleApplySpeed = () => send({ cmd: 'set_speed', m_per_s: speedMps });
  const handleApplyTime  = () => send({ cmd: 'set_time', seconds: durationMin * 60 });
  const handleApplyDir   = (v: boolean) => { setFwd(v); send({ cmd: 'set_dir', fwd: v }); };

  const state = status?.state ?? 'idle';
  const stateInfo = TreadmillStateMap[state];

  const canStart  = isConnected && (state === 'idle' || state === 'estopped');
  const canPause  = isConnected && state === 'running';
  const canResume = isConnected && state === 'paused';
  const canAbort  = isConnected && state !== 'idle';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">跑步机控制</h1>
        <p className="text-muted-foreground mt-1">实时控制小动物跑步机运行参数与状态</p>
      </div>

      {devices.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">暂无跑步机设备</h2>
          <p className="text-muted-foreground">请先在"设备管理"中添加跑步机设备</p>
        </div>
      ) : (
        <>
          {/* Device selector */}
          {devices.length > 1 && (
            <div className="mb-6 flex space-x-2">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    d.id === activeId
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
              {/* Overview */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-custom">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${isConnected ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}>
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{activeDevice.name}</h2>
                      <p className="text-sm text-muted-foreground">{activeDevice.ip}:{activeDevice.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge
                      status={isConnected ? 'online' : 'offline'}
                      text={isConnected ? '已连接' : '未连接'}
                    />
                    <StatusBadge status={stateInfo.color} text={stateInfo.label} />
                  </div>
                </div>

                {status ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">当前速度</p>
                      <p className="text-sm font-medium text-foreground">
                        {status.runtime.cur_speed_mps.toFixed(2)} m/s
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">已用时</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatSeconds(status.runtime.elapsed_sec)}
                        {status.settings.target_time_sec > 0
                          ? ` / ${formatSeconds(status.settings.target_time_sec)}`
                          : ' / ∞'}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">里程</p>
                      <p className="text-sm font-medium text-foreground">
                        {status.runtime.distance_m.toFixed(1)} m
                        {status.runtime.target_distance_m > 0
                          ? ` / ${status.runtime.target_distance_m.toFixed(1)} m`
                          : ''}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">方向</p>
                      <p className="text-sm font-medium text-foreground">
                        {status.settings.fwd ? '正向' : '反向'}
                      </p>
                    </div>
                  </div>
                ) : isConnected ? (
                  <p className="text-sm text-muted-foreground">等待设备状态数据...</p>
                ) : (
                  <p className="text-sm text-muted-foreground">设备未连接，请检查网络</p>
                )}

                {/* Progress bar */}
                {status && status.settings.target_time_sec > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (status.runtime.elapsed_sec / status.settings.target_time_sec) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-custom">
                <h3 className="text-lg font-semibold text-foreground mb-4">运行控制</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => send({ cmd: 'start' })}
                    disabled={!canStart}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" />
                    <span>开始</span>
                  </button>
                  <button
                    onClick={() => send({ cmd: 'pause' })}
                    disabled={!canPause}
                    className="flex items-center space-x-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause className="w-4 h-4" />
                    <span>暂停</span>
                  </button>
                  <button
                    onClick={() => send({ cmd: 'resume' })}
                    disabled={!canResume}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>继续</span>
                  </button>
                  <button
                    onClick={() => send({ cmd: 'abort' })}
                    disabled={!canAbort}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Square className="w-4 h-4" />
                    <span>中止</span>
                  </button>
                  <button
                    onClick={() => send({ cmd: 'estop' })}
                    disabled={!isConnected}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>急停</span>
                  </button>
                </div>
              </div>

              {/* Parameter settings */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-custom space-y-6">
                <h3 className="text-lg font-semibold text-foreground">参数设置</h3>

                {/* Speed */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center space-x-2">
                    <Gauge className="w-4 h-4" />
                    <span>目标速度: {speedMps.toFixed(2)} m/s</span>
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={speedMps}
                      onChange={(e) => setSpeedMps(parseFloat(e.target.value))}
                      disabled={!isConnected}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <button
                      onClick={handleApplySpeed}
                      disabled={!isConnected}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>应用</span>
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>运行时长 (分钟): {durationMin}</span>
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={durationMin}
                      onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
                      disabled={!isConnected}
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleApplyTime}
                      disabled={!isConnected}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>应用</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    预计里程 = {(speedMps * durationMin * 60).toFixed(1)} m
                    {durationMin === 0 ? '（0 分钟 = 无限运行）' : ''}
                  </p>
                </div>

                {/* Direction */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center space-x-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>方向</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplyDir(true)}
                      disabled={!isConnected}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        fwd
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      } disabled:opacity-50`}
                    >
                      正向
                    </button>
                    <button
                      onClick={() => handleApplyDir(false)}
                      disabled={!isConnected}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !fwd
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      } disabled:opacity-50`}
                    >
                      反向
                    </button>
                  </div>
                </div>
              </div>

              {/* Raw status (debug) */}
              {status && (
                <details className="bg-card rounded-lg border border-border p-4 shadow-custom">
                  <summary className="text-sm font-medium text-muted-foreground cursor-pointer flex items-center space-x-2">
                    <Route className="w-4 h-4" />
                    <span>原始状态数据</span>
                  </summary>
                  <pre className="mt-3 text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TreadmillControl;
