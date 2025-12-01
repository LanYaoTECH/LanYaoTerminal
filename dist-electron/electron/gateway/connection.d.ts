import { GatewayInfo, GatewayConnectionStatus, CommunicationMessage } from './types';
declare class GatewayConnection {
    private tcpClient;
    private wsClient;
    private connectionStatus;
    private authToken;
    private assignedIp;
    private gatewayInfo;
    private onStatusChangeCallback;
    private onMessageCallback;
    onStatusChange(callback: (status: GatewayConnectionStatus) => void): void;
    onMessage(callback: (message: CommunicationMessage) => void): void;
    connect(gateway: GatewayInfo, terminalId: string, password: string): void;
    private sendAuthRequest;
    private handleTcpData;
    private handleAuthResponse;
    private connectWebSocket;
    private handleWebSocketMessage;
    sendMessage(message: CommunicationMessage): void;
    private startHeartbeat;
    disconnect(): void;
    getStatus(): GatewayConnectionStatus;
    getAssignedIp(): string;
    getAuthToken(): string;
    private updateStatus;
}
declare const _default: GatewayConnection;
export default _default;
