<template>
  <div class="device-control-page">
    <el-card shadow="hover" class="page-card">
      <template #header>
        <div class="card-header">
          <h2>设备控制</h2>
          <el-button type="primary" @click="refreshDevices">
            <el-icon><Refresh /></el-icon>
            刷新设备列表
          </el-button>
        </div>
      </template>

      <!-- 设备列表 -->
      <div class="device-list">
        <el-row :gutter="20">
          <el-col :span="8" v-for="device in devices" :key="device.id">
            <el-card shadow="hover" class="device-card">
              <div class="device-header">
                <h3>{{ device.name }}</h3>
                <el-tag :type="device.online ? 'success' : 'danger'">
                  {{ device.online ? '在线' : '离线' }}
                </el-tag>
              </div>
              
              <div class="device-info">
                <p><strong>设备类型:</strong> {{ device.type }}</p>
                <p><strong>当前状态:</strong> {{ device.status }}</p>
              </div>

              <!-- 开关型设备控制 -->
              <div v-if="device.type === 'light' || device.type === 'socket'" class="device-controls">
                <el-switch
                  v-model="device.status"
                  :active-value="'on'"
                  :inactive-value="'off'"
                  @change="handleDeviceControl(device)"
                  :disabled="!device.online"
                >
                </el-switch>
                <span>{{ device.status === 'on' ? '开启' : '关闭' }}</span>
              </div>

              <!-- 调节型设备控制 -->
              <div v-else-if="device.type === 'air conditioner' || device.type === 'curtain'" class="device-controls">
                <el-slider
                  v-model="device.params.brightness"
                  :min="0"
                  :max="100"
                  @change="handleDeviceControl(device)"
                  :disabled="!device.online"
                >
                </el-slider>
                <span>亮度: {{ device.params.brightness || 0 }}%</span>
              </div>

              <!-- 传感器设备状态 -->
              <div v-else-if="device.type === 'sensor'" class="device-status">
                <p><strong>温度:</strong> {{ device.params.temperature || 0 }}°C</p>
                <p><strong>湿度:</strong> {{ device.params.humidity || 0 }}%</p>
              </div>

              <!-- 查看详情按钮 -->
              <div class="device-actions">
                <el-button type="info" size="small" @click="viewDeviceDetails(device)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 设备详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="设备详情"
        width="50%"
      >
        <div v-if="selectedDevice" class="device-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ selectedDevice.type }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">{{ selectedDevice.status }}</el-descriptions-item>
            <el-descriptions-item label="在线状态">
              <el-tag :type="selectedDevice.online ? 'success' : 'danger'">
                {{ selectedDevice.online ? '在线' : '离线' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="参数信息" :span="2">
              <pre>{{ JSON.stringify(selectedDevice.params, null, 2) }}</pre>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, View } from '@element-plus/icons-vue'

// 设备列表
const devices = ref([
  {
    id: 'DEV123456',
    name: '智能灯泡',
    type: 'light',
    status: 'on',
    params: {
      brightness: 80,
      color: '#FF0000'
    },
    online: true
  },
  {
    id: 'DEV789012',
    name: '智能插座',
    type: 'socket',
    status: 'off',
    params: {},
    online: true
  },
  {
    id: 'DEV345678',
    name: '温度传感器',
    type: 'sensor',
    status: 'active',
    params: {
      temperature: 25.5,
      humidity: 45
    },
    online: true
  },
  {
    id: 'DEV901234',
    name: '智能窗帘',
    type: 'curtain',
    status: 'open',
    params: {
      brightness: 50,
      position: 50
    },
    online: false
  }
])

// 设备详情对话框
const detailDialogVisible = ref(false)
const selectedDevice = ref<any>(null)

// 刷新设备列表
const refreshDevices = () => {
  // 这里可以调用API获取最新设备列表
}

// 设备控制
const handleDeviceControl = (device: any) => {
  // 这里可以调用API发送控制指令
}

// 查看设备详情
const viewDeviceDetails = (device: any) => {
  selectedDevice.value = device
  detailDialogVisible.value = true
}

// 页面挂载时刷新设备列表
onMounted(() => {
  refreshDevices()
})
</script>

<style scoped>
.device-control-page {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-list {
  margin-top: 20px;
}

.device-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.device-header h3 {
  margin: 0;
  font-size: 18px;
}

.device-info {
  margin-bottom: 20px;
}

.device-info p {
  margin: 5px 0;
}

.device-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
}

.device-status {
  margin: 20px 0;
}

.device-status p {
  margin: 10px 0;
}

.device-actions {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}

.device-detail pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>