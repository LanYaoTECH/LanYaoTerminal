// 网关信息类型
export interface GatewayInfo {
  gatewayId: string
  name: string
  ip: string
  port: number
  version: string
  model: string
  status: 'online' | 'offline'
}

// 设备信息类型
export interface DeviceInfo {
  id: string
  name: string
  type: string
  status: string
  params: Record<string, any>
  online: boolean
}

// 网关连接状态类型
export type GatewayConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// 通信消息类型
export interface CommunicationMessage {
  msgId: string
  timestamp: string
  type: string
  data?: any
  signature?: string
}

// 认证响应类型
export interface AuthResponse {
  success: boolean
  token: string
  websocketUrl: string
  assignedIp: string
}

// 设备控制请求类型
export interface DeviceControlRequest {
  deviceId: string
  command: string
  params: Record<string, any>
}

// 设备控制响应类型
export interface DeviceControlResponse {
  success: boolean
  deviceId: string
  status: string
  params: Record<string, any>
}