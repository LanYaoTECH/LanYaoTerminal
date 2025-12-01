export interface GatewayInfo {
    gatewayId: string;
    name: string;
    ip: string;
    port: number;
    version: string;
    model: string;
    status: 'online' | 'offline';
}
export interface DeviceInfo {
    id: string;
    name: string;
    type: string;
    status: string;
    params: Record<string, any>;
    online: boolean;
}
export type GatewayConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export interface CommunicationMessage {
    msgId: string;
    timestamp: string;
    type: string;
    data?: any;
    signature?: string;
}
export interface AuthResponse {
    success: boolean;
    token: string;
    websocketUrl: string;
    assignedIp: string;
}
export interface DeviceControlRequest {
    deviceId: string;
    command: string;
    params: Record<string, any>;
}
export interface DeviceControlResponse {
    success: boolean;
    deviceId: string;
    status: string;
    params: Record<string, any>;
}
