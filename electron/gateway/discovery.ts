import dgram from 'dgram'
import { GatewayInfo } from './types'

// 网关发现类
class GatewayDiscovery {
  private udpSocket: dgram.Socket | null = null
  private discoveryPort = 1900
  private timeout = 5000
  private discoveredGateways: GatewayInfo[] = []
  private onGatewayFoundCallback: ((gateway: GatewayInfo) => void) | null = null

  // 开始发现网关
  startDiscovery(onGatewayFound: (gateway: GatewayInfo) => void): void {
    this.onGatewayFoundCallback = onGatewayFound
    this.discoveredGateways = []

    // 创建UDP套接字
    this.udpSocket = dgram.createSocket('udp4')

    // 绑定端口
    this.udpSocket.bind(this.discoveryPort, () => {
      console.log(`UDP socket bound to port ${this.discoveryPort}`)
      this.sendDiscoveryBroadcast()
    })

    // 监听响应
    this.udpSocket.on('message', (msg, rinfo) => {
      this.handleGatewayResponse(msg, rinfo)
    })

    // 设置超时
    setTimeout(() => {
      this.stopDiscovery()
    }, this.timeout)
  }

  // 发送发现广播
  private sendDiscoveryBroadcast(): void {
    if (!this.udpSocket) return

    const discoveryMessage = {
      msgId: `discover_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'GATEWAY_DISCOVER',
      data: {
        version: '1.0',
        deviceType: 'LanYaoTerminal'
      }
    }

    const messageBuffer = Buffer.from(JSON.stringify(discoveryMessage))

    // 发送广播
    this.udpSocket.send(messageBuffer, 0, messageBuffer.length, this.discoveryPort, '255.255.255.255', (err) => {
      if (err) {
        console.error('Error sending discovery broadcast:', err)
      }
    })
  }

  // 处理网关响应
  private handleGatewayResponse(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    try {
      const response = JSON.parse(msg.toString())
      
      if (response.type === 'GATEWAY_DISCOVER_RESPONSE') {
        const gatewayInfo: GatewayInfo = {
          gatewayId: response.data.gatewayId,
          name: response.data.name,
          ip: rinfo.address,
          port: response.data.port,
          version: response.data.version,
          model: response.data.model,
          status: response.data.status
        }

        // 检查是否已发现该网关
        const isDuplicate = this.discoveredGateways.some(gw => gw.gatewayId === gatewayInfo.gatewayId)
        if (!isDuplicate) {
          this.discoveredGateways.push(gatewayInfo)
          if (this.onGatewayFoundCallback) {
            this.onGatewayFoundCallback(gatewayInfo)
          }
        }
      }
    } catch (error) {
      console.error('Error parsing gateway response:', error)
    }
  }

  // 停止发现
  stopDiscovery(): void {
    if (this.udpSocket) {
      this.udpSocket.close()
      this.udpSocket = null
      console.log('UDP socket closed')
    }
  }

  // 获取已发现的网关列表
  getDiscoveredGateways(): GatewayInfo[] {
    return [...this.discoveredGateways]
  }
}

export default new GatewayDiscovery()