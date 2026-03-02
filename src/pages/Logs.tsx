import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { fetchLogs, fetchLogActions, clearLogs } from '@/services/api';
import { useGateway } from '@/contexts/GatewayContext';
import type { LogEntry, PaginatedLogs } from '@/types/device';

const ACTION_LABELS: Record<string, string> = {
  gateway_started: '网关启动',
  device_added: '设备添加',
  device_deleted: '设备删除',
  device_updated: '设备更新',
  device_connected: '设备连接',
  device_disconnected: '设备断开',
  set_mode: '模式切换',
  move: '电机控制',
  angle: '位置定位',
  period_control: '周期控制',
  calibrate: '校准操作',
  invert_direction: '方向反转',
  bind: 'CAN绑定',
  list: '查询电机',
};

const Logs: React.FC = () => {
  const { devices } = useGateway();
  const [data, setData] = useState<PaginatedLogs | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [filterDevice, setFilterDevice] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchLogs({
        device_id: filterDevice || undefined,
        action: filterAction || undefined,
        page,
        limit: 30,
      });
      setData(result);
    } catch (e) {
      console.error('加载日志失败:', e);
    } finally {
      setLoading(false);
    }
  }, [filterDevice, filterAction, page]);

  const loadActions = useCallback(async () => {
    try {
      const result = await fetchLogActions();
      setActions(result);
    } catch (e) {
      console.error('加载操作类型失败:', e);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const handleClear = async () => {
    if (!confirm('确定要清除所有日志吗？此操作不可恢复。')) return;
    try {
      await clearLogs();
      await loadLogs();
    } catch (e) {
      console.error('清除日志失败:', e);
    }
  };

  const getActionLabel = (action: string) => ACTION_LABELS[action] || action;

  const getResultBadge = (result: string) => {
    if (result === 'success') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">成功</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">失败</span>;
  };

  const formatDetails = (details: string | null): string => {
    if (!details) return '-';
    try {
      const obj = JSON.parse(details);
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
    } catch {
      return details;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">日志查看</h1>
          <p className="text-muted-foreground mt-1">查看系统操作日志和设备状态历史</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors border border-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>清除日志</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">筛选:</span>
        </div>
        <select
          value={filterDevice}
          onChange={(e) => { setFilterDevice(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">所有设备</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">所有操作</option>
          {actions.map((a) => (
            <option key={a} value={a}>{getActionLabel(a)}</option>
          ))}
        </select>
        {data && (
          <span className="text-sm text-muted-foreground ml-auto">
            共 {data.total} 条记录
          </span>
        )}
      </div>

      {/* Log Table */}
      <div className="bg-card rounded-lg border border-border shadow-custom overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">时间</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">设备</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">操作</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">详情</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">结果</th>
            </tr>
          </thead>
          <tbody>
            {data && data.logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  暂无日志记录
                </td>
              </tr>
            ) : (
              data?.logs.map((log: LogEntry) => (
                <tr key={log.id} className="border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors">
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('zh-CN')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{log.device_name || '-'}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground max-w-xs truncate block">
                      {formatDetails(log.details)}
                    </span>
                  </td>
                  <td className="p-4">
                    {getResultBadge(log.result)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            第 {data.page} / {data.totalPages} 页
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex items-center space-x-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors border border-border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一页</span>
            </button>
            <button
              onClick={() => setPage(Math.min(data.totalPages, page + 1))}
              disabled={page >= data.totalPages}
              className="flex items-center space-x-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors border border-border disabled:opacity-50"
            >
              <span>下一页</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;