import type { PumpStatus } from '../types/device';
import { getGatewayWsUrl } from './api';

type StatusCallback = (deviceId: string, data: PumpStatus) => void;
type ConnectionCallback = (deviceId: string, connected: boolean) => void;
type GatewayStateCallback = (connected: boolean) => void;

export class GatewayWebSocket {
  private ws: WebSocket | null = null;
  private statusCallbacks: StatusCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private gatewayStateCallbacks: GatewayStateCallback[] = [];
  private subscribedDevices: Set<string> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;

  get connected(): boolean {
    return this._connected;
  }

  onDeviceStatus(cb: StatusCallback): () => void {
    this.statusCallbacks.push(cb);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((c) => c !== cb);
    };
  }

  onDeviceConnection(cb: ConnectionCallback): () => void {
    this.connectionCallbacks.push(cb);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((c) => c !== cb);
    };
  }

  onGatewayState(cb: GatewayStateCallback): () => void {
    this.gatewayStateCallbacks.push(cb);
    return () => {
      this.gatewayStateCallbacks = this.gatewayStateCallbacks.filter((c) => c !== cb);
    };
  }

  connect(): void {
    if (this.ws) {
      this.ws.close();
    }

    const url = getGatewayWsUrl();
    console.log(`[GatewayWS] Connecting to ${url}`);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[GatewayWS] Connected');
        this._connected = true;
        this.gatewayStateCallbacks.forEach((cb) => cb(true));

        // Re-subscribe to all devices
        for (const deviceId of this.subscribedDevices) {
          this.ws?.send(JSON.stringify({ type: 'subscribe', deviceId }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case 'device_status':
              this.statusCallbacks.forEach((cb) => cb(message.deviceId, message.data));
              break;
            case 'device_connection':
              this.connectionCallbacks.forEach((cb) =>
                cb(message.deviceId, message.connected)
              );
              break;
            case 'command_result':
              // Could be handled via callbacks if needed
              if (!message.success) {
                console.warn(`[GatewayWS] Command failed for ${message.deviceId}:`, message.error);
              }
              break;
          }
        } catch (e) {
          console.error('[GatewayWS] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[GatewayWS] Disconnected');
        this._connected = false;
        this.ws = null;
        this.gatewayStateCallbacks.forEach((cb) => cb(false));
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[GatewayWS] Error:', error);
      };
    } catch (e) {
      console.error('[GatewayWS] Failed to connect:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
  }

  subscribe(deviceId: string): void {
    this.subscribedDevices.add(deviceId);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', deviceId }));
    }
  }

  unsubscribe(deviceId: string): void {
    this.subscribedDevices.delete(deviceId);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', deviceId }));
    }
  }

  sendCommand(deviceId: string, payload: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'command', deviceId, payload }));
    } else {
      console.warn('[GatewayWS] Cannot send command: not connected');
    }
  }
}

// Singleton instance
export const gatewayWs = new GatewayWebSocket();
