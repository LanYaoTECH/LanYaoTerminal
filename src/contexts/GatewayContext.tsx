import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { gatewayWs } from '../services/websocket';
import { fetchDevices } from '../services/api';
import type { Device, PumpStatus } from '../types/device';

type AutoDetectCallback = (deviceId: string) => void;

interface GatewayContextValue {
  connected: boolean;
  devices: Device[];
  deviceStatuses: Record<string, PumpStatus | null>;
  deviceConnections: Record<string, boolean>;
  refreshDevices: () => Promise<void>;
  sendCommand: (deviceId: string, payload: Record<string, unknown>) => void;
  onAutoDetectPeriod: (cb: AutoDetectCallback) => () => void;
  loading: boolean;
  error: string | null;
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

export const GatewayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, PumpStatus | null>>({});
  const [deviceConnections, setDeviceConnections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribedRef = useRef<Set<string>>(new Set());
  // Track which device IDs have already fired the auto-detect callback
  const autoDetectedRef = useRef<Set<string>>(new Set());
  const autoDetectCallbacksRef = useRef<Set<AutoDetectCallback>>(new Set());

  const onAutoDetectPeriod = useCallback((cb: AutoDetectCallback) => {
    autoDetectCallbacksRef.current.add(cb);
    return () => { autoDetectCallbacksRef.current.delete(cb); };
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchDevices();
      setDevices(data);

      // Update connection states from HTTP response
      const connMap: Record<string, boolean> = {};
      for (const d of data) {
        connMap[d.id] = d.connected ?? false;
      }
      setDeviceConnections((prev) => ({ ...prev, ...connMap }));

      // Subscribe to new devices, unsubscribe from removed
      const newIds = new Set(data.map((d) => d.id));
      for (const id of subscribedRef.current) {
        if (!newIds.has(id)) {
          gatewayWs.unsubscribe(id);
          subscribedRef.current.delete(id);
        }
      }
      for (const id of newIds) {
        if (!subscribedRef.current.has(id)) {
          gatewayWs.subscribe(id);
          subscribedRef.current.add(id);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '无法连接到网关');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendCommand = useCallback((deviceId: string, payload: Record<string, unknown>) => {
    gatewayWs.sendCommand(deviceId, payload);
  }, []);

  useEffect(() => {
    // Gateway WebSocket lifecycle
    const unsubState = gatewayWs.onGatewayState((state) => {
      setConnected(state);
      if (state) {
        refreshDevices();
      }
    });

    const unsubStatus = gatewayWs.onDeviceStatus((deviceId, data) => {
      setDeviceStatuses((prev) => ({ ...prev, [deviceId]: data }));

      // Auto-detect period mode on first status message per device
      if (data?.mode === 'period' && !autoDetectedRef.current.has(deviceId)) {
        autoDetectedRef.current.add(deviceId);
        autoDetectCallbacksRef.current.forEach((cb) => cb(deviceId));
      }
    });

    const unsubConn = gatewayWs.onDeviceConnection((deviceId, conn) => {
      setDeviceConnections((prev) => ({ ...prev, [deviceId]: conn }));
      // Reset auto-detect flag on reconnect so it fires again if needed
      if (!conn) autoDetectedRef.current.delete(deviceId);
    });

    gatewayWs.connect();
    refreshDevices();

    return () => {
      unsubState();
      unsubStatus();
      unsubConn();
      gatewayWs.disconnect();
    };
  }, [refreshDevices]);

  return (
    <GatewayContext.Provider
      value={{
        connected,
        devices,
        deviceStatuses,
        deviceConnections,
        refreshDevices,
        sendCommand,
        onAutoDetectPeriod,
        loading,
        error,
      }}
    >
      {children}
    </GatewayContext.Provider>
  );
};

export function useGateway(): GatewayContextValue {
  const ctx = useContext(GatewayContext);
  if (!ctx) throw new Error('useGateway must be used within GatewayProvider');
  return ctx;
}
