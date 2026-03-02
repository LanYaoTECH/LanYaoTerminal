import type { Device, DeviceCreateInput, PaginatedLogs } from '../types/device';

const DEFAULT_GATEWAY_URL = 'http://localhost:3210';

function getGatewayUrl(): string {
  return localStorage.getItem('gateway_url') || DEFAULT_GATEWAY_URL;
}

export function setGatewayUrl(url: string): void {
  localStorage.setItem('gateway_url', url);
}

export function getGatewayWsUrl(): string {
  const httpUrl = getGatewayUrl();
  return httpUrl.replace(/^http/, 'ws') + '/ws';
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getGatewayUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ===== Device API =====

export async function fetchDevices(): Promise<Device[]> {
  return apiFetch<Device[]>('/api/devices');
}

export async function fetchDevice(id: string): Promise<Device> {
  return apiFetch<Device>(`/api/devices/${id}`);
}

export async function createDevice(input: DeviceCreateInput): Promise<Device> {
  return apiFetch<Device>('/api/devices', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDevice(id: string, input: Partial<DeviceCreateInput>): Promise<Device> {
  return apiFetch<Device>(`/api/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteDevice(id: string): Promise<void> {
  await apiFetch(`/api/devices/${id}`, { method: 'DELETE' });
}

export async function sendDeviceCommand(
  id: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  return apiFetch(`/api/devices/${id}/command`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ===== Logs API =====

export async function fetchLogs(params?: {
  device_id?: string;
  action?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedLogs> {
  const searchParams = new URLSearchParams();
  if (params?.device_id) searchParams.set('device_id', params.device_id);
  if (params?.action) searchParams.set('action', params.action);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return apiFetch<PaginatedLogs>(`/api/logs${query ? '?' + query : ''}`);
}

export async function fetchLogActions(): Promise<string[]> {
  return apiFetch<string[]>('/api/logs/actions');
}

export async function clearLogs(): Promise<void> {
  await apiFetch('/api/logs', { method: 'DELETE' });
}

// ===== Health Check =====

export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const baseUrl = getGatewayUrl();
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export { getGatewayUrl };
