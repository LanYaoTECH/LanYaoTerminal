import React, { useState } from 'react';
import { Plus, Trash2, Edit, Wifi, WifiOff, X, Check } from 'lucide-react';
import { useGateway } from '@/contexts/GatewayContext';
import { createDevice, deleteDevice, updateDevice } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';

const DeviceManagement: React.FC = () => {
  const { devices, deviceConnections, refreshDevices } = useGateway();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', ip: '', port: '80' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ name: '', ip: '', port: '80' });
    setShowAddForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.ip.trim()) {
      setError('设备名称和IP地址不能为空');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createDevice({
        name: formData.name.trim(),
        type: 'pump',
        ip: formData.ip.trim(),
        port: parseInt(formData.port) || 80,
      });
      resetForm();
      await refreshDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除设备 "${name}" 吗？`)) return;
    try {
      await deleteDevice(id);
      await refreshDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败');
    }
  };

  const handleStartEdit = (device: typeof devices[0]) => {
    setEditingId(device.id);
    setFormData({ name: device.name, ip: device.ip, port: String(device.port) });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateDevice(editingId, {
        name: formData.name.trim(),
        ip: formData.ip.trim(),
        port: parseInt(formData.port) || 80,
      });
      resetForm();
      await refreshDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">设备管理</h1>
          <p className="text-muted-foreground mt-1">管理设备信息、配置和参数</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>添加设备</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Device Form */}
      {showAddForm && (
        <div className="mb-6 bg-card rounded-lg border border-border p-6 shadow-custom">
          <h3 className="text-lg font-semibold text-foreground mb-4">添加新设备</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">设备名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 注射泵-P01"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">IP 地址</label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="例: 192.168.1.100"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">端口</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                placeholder="80"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleAdd}
              disabled={submitting}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? '添加中...' : '确认添加'}</span>
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Device Table */}
      <div className="bg-card rounded-lg border border-border shadow-custom overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">设备名称</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">类型</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">IP 地址</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">端口</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">连接状态</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">添加时间</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  暂无设备，请点击"添加设备"按钮添加
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const isConnected = deviceConnections[device.id] ?? false;
                const isEditing = editingId === device.id;

                return (
                  <tr key={device.id} className="border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-2 py-1 bg-muted border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">{device.name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">注射泵</span>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ip}
                          onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                          className="w-full px-2 py-1 bg-muted border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{device.ip}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={formData.port}
                          onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                          className="w-20 px-2 py-1 bg-muted border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{device.port}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-gray-400" />
                        )}
                        <StatusBadge
                          status={isConnected ? 'online' : 'offline'}
                          text={isConnected ? '已连接' : '未连接'}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(device.created_at).toLocaleString('zh-CN')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              disabled={submitting}
                              className="p-2 rounded-lg hover:bg-green-100 transition-colors text-green-600"
                              title="保存"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={resetForm}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(device)}
                              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(device.id, device.name)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceManagement;