import { GatewayInfo } from './types';
declare class GatewayDiscovery {
    private udpSocket;
    private discoveryPort;
    private timeout;
    private discoveredGateways;
    private onGatewayFoundCallback;
    startDiscovery(onGatewayFound: (gateway: GatewayInfo) => void): void;
    private sendDiscoveryBroadcast;
    private handleGatewayResponse;
    stopDiscovery(): void;
    getDiscoveredGateways(): GatewayInfo[];
}
declare const _default: GatewayDiscovery;
export default _default;
