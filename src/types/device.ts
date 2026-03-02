// ===== Device Types =====

export interface Device {
  id: string;
  name: string;
  type: 'pump';
  ip: string;
  port: number;
  created_at: string;
  updated_at: string;
  connected?: boolean;
  lastStatus?: PumpStatus | null;
}

export interface DeviceCreateInput {
  name: string;
  type: 'pump';
  ip: string;
  port?: number;
}

// ===== Motor & Pump Types =====

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

export interface PeriodStatus {
  enabled: boolean;
  current_cycle: number;
  cycle_progress: number;
  speed_a: number;
  cycles_completed: number;
}

export interface PumpStatus {
  type: 'status';
  uptime: number;
  wifi: boolean;
  mode: 'raw' | 'period';
  period?: PeriodStatus;
  motors: MotorStatus[];
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
