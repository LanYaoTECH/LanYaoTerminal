import net from 'net'
import WebSocket from 'ws'
import { GatewayInfo, GatewayConnectionStatus, CommunicationMessage, AuthResponse } from './types'

// 网关连接类
class GatewayConnection {
  private tcpClient: net.Socket | null = null
  private wsClient: WebSocket | null = null
  private connectionStatus: GatewayConnectionStatus = 'disconnected'
  private authToken: string = ''
  private assignedIp: string = ''
  private gatewayInfo: GatewayInfo | null = null
  private onStatusChangeCallback: ((status: GatewayConnectionStatus) => void) | null = null
  private onMessageCallback: ((message: CommunicationMessage) => void) | null = null

  // 设置状态变化回调
  onStatusChange(callback: (status: GatewayConnectionStatus) => void): void {
    this.onStatusChangeCallback = callback
  }

  // 设置消息回调
  onMessage(callback: (message: CommunicationMessage) => void): void {
    this.onMessageCallback = callback
  }

  // 连接到网关
  connect(gateway: GatewayInfo, terminalId: string, password: string): void {
    this.gatewayInfo = gateway
    this.updateStatus('connecting')

    // 创建TCP连接
    this.tcpClient = new net.Socket()

    this.tcpClient.connect(gateway.port, gateway.ip, () => {
      console.log(`Connected to gateway ${gateway.ip}:${gateway.port}`)
      // 发送认证请求
      this.sendAuthRequest(terminalId, password)
    })

    // 接收数据
    this.tcpClient.on('data', (data) => {
      this.handleTcpData(data)
    })

    // 连接关闭
    this.tcpClient.on('close', () => {
      console.log('TCP connection closed')
      this.updateStatus('disconnected')
    })

    // 连接错误
    this.tcpClient.on('error', (error) => {
      console.error('TCP connection error:', error)
      this.updateStatus('error')
    })
  }

  // 发送认证请求
  private sendAuthRequest(terminalId: string, password: string): void {
    if (!this.tcpClient) return

    const authMessage: CommunicationMessage = {
      msgId: `auth_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'GATEWAY_AUTH',
      data: {
        terminalId,
        password,
        version: '1.0.0'
      }
    }

    this.tcpClient.write(JSON.stringify(authMessage) + '\n')
  }

  // 处理TCP数据
  private handleTcpData(data: Buffer): void {
    try {
      const messages = data.toString().split('\n')
      
      for (const message of messages) {
        if (!message.trim()) continue
        
        const parsedMessage: CommunicationMessage = JSON.parse(message)
        
        if (parsedMessage.type === 'GATEWAY_AUTH_RESPONSE') {
          this.handleAuthResponse(parsedMessage)
        }
      }
    } catch (error) {
      console.error('Error parsing TCP data:', error)
    }
  }

  // 处理认证响应
  private handleAuthResponse(message: CommunicationMessage): void {
    const authResponse = message.data as AuthResponse
    
    if (authResponse.success) {
      this.authToken = authResponse.token
      this.assignedIp = authResponse.assignedIp
      
      // 建立WebSocket连接
      this.connectWebSocket(authResponse.websocketUrl)
    } else {
      console.error('Authentication failed')
      this.updateStatus('error')
    }
  }

  // 建立WebSocket连接
  private connectWebSocket(url: string): void {
    this.wsClient = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    })

    this.wsClient.on('open', () => {
      console.log('WebSocket connection established')
      this.updateStatus('connected')
      // 开始心跳
      this.startHeartbeat()
    })

    this.wsClient.on('message', (data) => {
      this.handleWebSocketMessage(data)
    })

    this.wsClient.on('close', () => {
      console.log('WebSocket connection closed')
      this.updateStatus('disconnected')
    })

    this.wsClient.on('error', (error) => {
      console.error('WebSocket connection error:', error)
      this.updateStatus('error')
    })
  }

  // 处理WebSocket消息
  private handleWebSocketMessage(data: WebSocket.Data): void {
    try {
      const message: CommunicationMessage = JSON.parse(data.toString())
      
      if (this.onMessageCallback) {
        this.onMessageCallback(message)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  // 发送WebSocket消息
  sendMessage(message: CommunicationMessage): void {
    if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
      this.wsClient.send(JSON.stringify(message))
    }
  }

  // 开始心跳
  private startHeartbeat(): void {
    setInterval(() => {
      if (this.connectionStatus === 'connected') {
        const heartbeatMessage: CommunicationMessage = {
          msgId: `heartbeat_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'HEARTBEAT_REQUEST'
        }
        this.sendMessage(heartbeatMessage)
      }
    }, 30000) // 30秒心跳
  }

  // 断开连接
  disconnect(): void {
    if (this.wsClient) {
      this.wsClient.close()
      this.wsClient = null
    }
    
    if (this.tcpClient) {
      this.tcpClient.destroy()
      this.tcpClient = null
    }
    
    this.authToken = ''
    this.assignedIp = ''
    this.updateStatus('disconnected')
  }

  // 获取连接状态
  getStatus(): GatewayConnectionStatus {
    return this.connectionStatus
  }

  // 获取分配的IP
  getAssignedIp(): string {
    return this.assignedIp
  }

  // 获取认证令牌
  getAuthToken(): string {
    return this.authToken
  }

  // 更新连接状态
  private updateStatus(status: GatewayConnectionStatus): void {
    this.connectionStatus = status
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status)
    }
  }
}

export default new GatewayConnection()