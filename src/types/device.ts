// ===== Device Types =====

export type DeviceType = 'pump' | 'treadmill';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  port: number;
  created_at: string;
  updated_at: string;
  connected?: boolean;
  lastStatus?: DeviceStatus | null;
}

export interface DeviceCreateInput {
  name: string;
  type: DeviceType;
  ip: string;
  port?: number;
}

// ===== Pump (injection pump) =====

export interface MotorStatus {
  id: number;
  speed: number;
  pos: number;
  state: number;
  calibrated: boolean;
  pos_min: number;
  pos_max: number;
  direction_inverted: boolean;
}

export interface KeyFrame {
  t_ms: number;
  speed: number;
}

export interface PeriodStatus {
  enabled: boolean;
  current_cycle: number;
  cycle_progress: number;
  speed_a: number;
  cycles_completed: number;
  elapsed_ms: number;
  target_duration_ms: number;
  interpolated_speed: number;
  active_keyframe: number;
  kf_count: number;
}

export interface PumpStatus {
  type: 'status';
  device_type?: 'pump';
  uptime: number;
  wifi: boolean;
  mode: 'raw' | 'period';
  period?: PeriodStatus;
  motors: MotorStatus[];
}

// ===== Treadmill (小动物跑步机) =====

export type TreadmillState = 'idle' | 'running' | 'paused' | 'estopped';

export interface TreadmillSettings {
  target_speed_mps: number;
  fwd: boolean;
  target_time_sec: number;
}

export interface TreadmillRuntime {
  cur_speed_mps: number;
  elapsed_sec: number;
  distance_m: number;
  target_distance_m: number;
}

export interface TreadmillStatus {
  type: 'status';
  device_type: 'treadmill';
  uptime: number;
  wifi: boolean;
  state: TreadmillState;
  settings: TreadmillSettings;
  runtime: TreadmillRuntime;
}

export type DeviceStatus = PumpStatus | TreadmillStatus;

export function isPumpStatus(s: DeviceStatus | null | undefined): s is PumpStatus {
  return !!s && (s as PumpStatus).mode !== undefined && ((s as PumpStatus).device_type ?? 'pump') === 'pump';
}

export function isTreadmillStatus(s: DeviceStatus | null | undefined): s is TreadmillStatus {
  return !!s && (s as TreadmillStatus).device_type === 'treadmill';
}

// ===== Log Types =====

export interface LogEntry {
  id: number;
  device_id: string | null;
  device_name: string | null;
  action: string;
  details: string | null;
  result: 'success' | 'error';
  created_at: string;
}

export interface PaginatedLogs {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Helpers =====

export const MotorStateMap: Record<number, { label: string; color: string }> = {
  0: { label: '离线', color: 'offline' },
  1: { label: '故障', color: 'error' },
  2: { label: '就绪', color: 'online' },
  3: { label: '启动中', color: 'warning' },
  4: { label: '运行中', color: 'online' },
  5: { label: '急停', color: 'error' },
};

export function getMotorStateLabel(state: number): string {
  return MotorStateMap[state]?.label ?? '未知';
}

export function getMotorStateColor(state: number): 'online' | 'offline' | 'warning' | 'error' {
  return (MotorStateMap[state]?.color ?? 'offline') as 'online' | 'offline' | 'warning' | 'error';
}

export function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}天${hours % 24}小时`;
  if (hours > 0) return `${hours}小时${minutes % 60}分`;
  if (minutes > 0) return `${minutes}分${seconds % 60}秒`;
  return `${seconds}秒`;
}

export const TreadmillStateMap: Record<TreadmillState, { label: string; color: 'online' | 'offline' | 'warning' | 'error' }> = {
  idle:     { label: '空闲',   color: 'offline' },
  running:  { label: '运行中', color: 'online' },
  paused:   { label: '暂停',   color: 'warning' },
  estopped: { label: '急停',   color: 'error' },
};

export function getDeviceTypeLabel(type: DeviceType): string {
  return type === 'treadmill' ? '跑步机' : '注射泵';
}

export function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
