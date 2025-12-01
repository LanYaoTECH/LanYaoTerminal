"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = __importDefault(require("net"));
var ws_1 = __importDefault(require("ws"));
// 网关连接类
var GatewayConnection = /** @class */ (function () {
    function GatewayConnection() {
        this.tcpClient = null;
        this.wsClient = null;
        this.connectionStatus = 'disconnected';
        this.authToken = '';
        this.assignedIp = '';
        this.gatewayInfo = null;
        this.onStatusChangeCallback = null;
        this.onMessageCallback = null;
    }
    // 设置状态变化回调
    GatewayConnection.prototype.onStatusChange = function (callback) {
        this.onStatusChangeCallback = callback;
    };
    // 设置消息回调
    GatewayConnection.prototype.onMessage = function (callback) {
        this.onMessageCallback = callback;
    };
    // 连接到网关
    GatewayConnection.prototype.connect = function (gateway, terminalId, password) {
        var _this = this;
        this.gatewayInfo = gateway;
        this.updateStatus('connecting');
        // 创建TCP连接
        this.tcpClient = new net_1.default.Socket();
        this.tcpClient.connect(gateway.port, gateway.ip, function () {
            console.log("Connected to gateway ".concat(gateway.ip, ":").concat(gateway.port));
            // 发送认证请求
            _this.sendAuthRequest(terminalId, password);
        });
        // 接收数据
        this.tcpClient.on('data', function (data) {
            _this.handleTcpData(data);
        });
        // 连接关闭
        this.tcpClient.on('close', function () {
            console.log('TCP connection closed');
            _this.updateStatus('disconnected');
        });
        // 连接错误
        this.tcpClient.on('error', function (error) {
            console.error('TCP connection error:', error);
            _this.updateStatus('error');
        });
    };
    // 发送认证请求
    GatewayConnection.prototype.sendAuthRequest = function (terminalId, password) {
        if (!this.tcpClient)
            return;
        var authMessage = {
            msgId: "auth_".concat(Date.now()),
            timestamp: new Date().toISOString(),
            type: 'GATEWAY_AUTH',
            data: {
                terminalId: terminalId,
                password: password,
                version: '1.0.0'
            }
        };
        this.tcpClient.write(JSON.stringify(authMessage) + '\n');
    };
    // 处理TCP数据
    GatewayConnection.prototype.handleTcpData = function (data) {
        try {
            var messages = data.toString().split('\n');
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var message = messages_1[_i];
                if (!message.trim())
                    continue;
                var parsedMessage = JSON.parse(message);
                if (parsedMessage.type === 'GATEWAY_AUTH_RESPONSE') {
                    this.handleAuthResponse(parsedMessage);
                }
            }
        }
        catch (error) {
            console.error('Error parsing TCP data:', error);
        }
    };
    // 处理认证响应
    GatewayConnection.prototype.handleAuthResponse = function (message) {
        var authResponse = message.data;
        if (authResponse.success) {
            this.authToken = authResponse.token;
            this.assignedIp = authResponse.assignedIp;
            // 建立WebSocket连接
            this.connectWebSocket(authResponse.websocketUrl);
        }
        else {
            console.error('Authentication failed');
            this.updateStatus('error');
        }
    };
    // 建立WebSocket连接
    GatewayConnection.prototype.connectWebSocket = function (url) {
        var _this = this;
        this.wsClient = new ws_1.default(url, {
            headers: {
                'Authorization': "Bearer ".concat(this.authToken)
            }
        });
        this.wsClient.on('open', function () {
            console.log('WebSocket connection established');
            _this.updateStatus('connected');
            // 开始心跳
            _this.startHeartbeat();
        });
        this.wsClient.on('message', function (data) {
            _this.handleWebSocketMessage(data);
        });
        this.wsClient.on('close', function () {
            console.log('WebSocket connection closed');
            _this.updateStatus('disconnected');
        });
        this.wsClient.on('error', function (error) {
            console.error('WebSocket connection error:', error);
            _this.updateStatus('error');
        });
    };
    // 处理WebSocket消息
    GatewayConnection.prototype.handleWebSocketMessage = function (data) {
        try {
            var message = JSON.parse(data.toString());
            if (this.onMessageCallback) {
                this.onMessageCallback(message);
            }
        }
        catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
    // 发送WebSocket消息
    GatewayConnection.prototype.sendMessage = function (message) {
        if (this.wsClient && this.wsClient.readyState === ws_1.default.OPEN) {
            this.wsClient.send(JSON.stringify(message));
        }
    };
    // 开始心跳
    GatewayConnection.prototype.startHeartbeat = function () {
        var _this = this;
        setInterval(function () {
            if (_this.connectionStatus === 'connected') {
                var heartbeatMessage = {
                    msgId: "heartbeat_".concat(Date.now()),
                    timestamp: new Date().toISOString(),
                    type: 'HEARTBEAT_REQUEST'
                };
                _this.sendMessage(heartbeatMessage);
            }
        }, 30000); // 30秒心跳
    };
    // 断开连接
    GatewayConnection.prototype.disconnect = function () {
        if (this.wsClient) {
            this.wsClient.close();
            this.wsClient = null;
        }
        if (this.tcpClient) {
            this.tcpClient.destroy();
            this.tcpClient = null;
        }
        this.authToken = '';
        this.assignedIp = '';
        this.updateStatus('disconnected');
    };
    // 获取连接状态
    GatewayConnection.prototype.getStatus = function () {
        return this.connectionStatus;
    };
    // 获取分配的IP
    GatewayConnection.prototype.getAssignedIp = function () {
        return this.assignedIp;
    };
    // 获取认证令牌
    GatewayConnection.prototype.getAuthToken = function () {
        return this.authToken;
    };
    // 更新连接状态
    GatewayConnection.prototype.updateStatus = function (status) {
        this.connectionStatus = status;
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(status);
        }
    };
    return GatewayConnection;
}());
exports.default = new GatewayConnection();
