import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 设备状态管理
interface Device {
  id: string
  name: string
  type: string
  status: string
  params: Record<string, any>
  online: boolean
}

export const useDeviceStore = defineStore('device', () => {
  // 设备列表
  const devices = ref<Device[]>([])
  
  // 在线设备数量
  const onlineDeviceCount = computed(() => {
    return devices.value.filter(device => device.online).length
  })

  // 添加设备
  const addDevice = (device: Device) => {
    devices.value.push(device)
  }

  // 删除设备
  const removeDevice = (deviceId: string) => {
    const index = devices.value.findIndex(device => device.id === deviceId)
    if (index !== -1) {
      devices.value.splice(index, 1)
    }
  }

  // 更新设备
  const updateDevice = (deviceId: string, updates: Partial<Device>) => {
    const device = devices.value.find(device => device.id === deviceId)
    if (device) {
      Object.assign(device, updates)
    }
  }

  // 更新设备状态
  const updateDeviceStatus = (deviceId: string, status: string) => {
    const device = devices.value.find(device => device.id === deviceId)
    if (device) {
      device.status = status
    }
  }

  // 更新设备在线状态
  const updateDeviceOnlineStatus = (deviceId: string, online: boolean) => {
    const device = devices.value.find(device => device.id === deviceId)
    if (device) {
      device.online = online
    }
  }

  // 清空设备列表
  const clearDevices = () => {
    devices.value = []
  }

  // 获取设备
  const getDevice = (deviceId: string) => {
    return devices.value.find(device => device.id === deviceId)
  }

  return {
    devices,
    onlineDeviceCount,
    addDevice,
    removeDevice,
    updateDevice,
    updateDeviceStatus,
    updateDeviceOnlineStatus,
    clearDevices,
    getDevice
  }
})