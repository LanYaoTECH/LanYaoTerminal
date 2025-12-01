var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import dgram from 'dgram';
// 网关发现类
var GatewayDiscovery = /** @class */ (function () {
    function GatewayDiscovery() {
        this.udpSocket = null;
        this.discoveryPort = 1900;
        this.timeout = 5000;
        this.discoveredGateways = [];
        this.onGatewayFoundCallback = null;
    }
    // 开始发现网关
    GatewayDiscovery.prototype.startDiscovery = function (onGatewayFound) {
        var _this = this;
        this.onGatewayFoundCallback = onGatewayFound;
        this.discoveredGateways = [];
        // 创建UDP套接字
        this.udpSocket = dgram.createSocket('udp4');
        // 绑定端口
        this.udpSocket.bind(this.discoveryPort, function () {
            console.log("UDP socket bound to port ".concat(_this.discoveryPort));
            _this.sendDiscoveryBroadcast();
        });
        // 监听响应
        this.udpSocket.on('message', function (msg, rinfo) {
            _this.handleGatewayResponse(msg, rinfo);
        });
        // 设置超时
        setTimeout(function () {
            _this.stopDiscovery();
        }, this.timeout);
    };
    // 发送发现广播
    GatewayDiscovery.prototype.sendDiscoveryBroadcast = function () {
        if (!this.udpSocket)
            return;
        var discoveryMessage = {
            msgId: "discover_".concat(Date.now()),
            timestamp: new Date().toISOString(),
            type: 'GATEWAY_DISCOVER',
            data: {
                version: '1.0',
                deviceType: 'LanYaoTerminal'
            }
        };
        var messageBuffer = Buffer.from(JSON.stringify(discoveryMessage));
        // 发送广播
        this.udpSocket.send(messageBuffer, 0, messageBuffer.length, this.discoveryPort, '255.255.255.255', function (err) {
            if (err) {
                console.error('Error sending discovery broadcast:', err);
            }
        });
    };
    // 处理网关响应
    GatewayDiscovery.prototype.handleGatewayResponse = function (msg, rinfo) {
        try {
            var response = JSON.parse(msg.toString());
            if (response.type === 'GATEWAY_DISCOVER_RESPONSE') {
                var gatewayInfo_1 = {
                    gatewayId: response.data.gatewayId,
                    name: response.data.name,
                    ip: rinfo.address,
                    port: response.data.port,
                    version: response.data.version,
                    model: response.data.model,
                    status: response.data.status
                };
                // 检查是否已发现该网关
                var isDuplicate = this.discoveredGateways.some(function (gw) { return gw.gatewayId === gatewayInfo_1.gatewayId; });
                if (!isDuplicate) {
                    this.discoveredGateways.push(gatewayInfo_1);
                    if (this.onGatewayFoundCallback) {
                        this.onGatewayFoundCallback(gatewayInfo_1);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error parsing gateway response:', error);
        }
    };
    // 停止发现
    GatewayDiscovery.prototype.stopDiscovery = function () {
        if (this.udpSocket) {
            this.udpSocket.close();
            this.udpSocket = null;
            console.log('UDP socket closed');
        }
    };
    // 获取已发现的网关列表
    GatewayDiscovery.prototype.getDiscoveredGateways = function () {
        return __spreadArray([], this.discoveredGateways, true);
    };
    return GatewayDiscovery;
}());
export default new GatewayDiscovery();
