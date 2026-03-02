import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Wifi, WifiOff, Check } from 'lucide-react';
import { getGatewayUrl, setGatewayUrl, checkGatewayHealth } from '@/services/api';
import { useGateway } from '@/contexts/GatewayContext';
import { gatewayWs } from '@/services/websocket';

const NetworkConfig: React.FC = () => {
  const { connected } = useGateway();
  const [url, setUrl] = useState(getGatewayUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUrl(getGatewayUrl());
  }, []);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    // Temporarily set the URL for testing
    const originalUrl = getGatewayUrl();
    setGatewayUrl(url);
    const result = await checkGatewayHealth();
    setTestResult(result);
    // Restore if not saving
    setGatewayUrl(originalUrl);
    setTesting(false);
  };

  const handleSave = () => {
    setGatewayUrl(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Reconnect WebSocket with new URL
    gatewayWs.disconnect();
    gatewayWs.connect();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">网管配置</h1>
        <p className="text-muted-foreground mt-1">配置网关连接和网络参数</p>
      </div>

      {/* Gateway Connection Status */}
      <div className="mb-6 bg-card rounded-lg border border-border p-6 shadow-custom">
        <h3 className="text-lg font-semibold text-foreground mb-4">网关连接状态</h3>
        <div className="flex items-center space-x-3">
          {connected ? (
            <Wifi className="w-6 h-6 text-green-500" />
          ) : (
            <WifiOff className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <p className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-muted-foreground'}`}>
              {connected ? '网关已连接' : '网关未连接'}
            </p>
            <p className="text-xs text-muted-foreground">
              当前地址: {getGatewayUrl()}
            </p>
          </div>
        </div>
      </div>

      {/* Gateway URL Configuration */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-custom">
        <h3 className="text-lg font-semibold text-foreground mb-4">网关地址配置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              网关服务器地址
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:3210"
              className="w-full max-w-md px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              填写 RayCoreGateway 后端服务的完整地址（包含端口号）
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors border border-border"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? '测试中...' : '测试连接'}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? '已保存' : '保存并重连'}</span>
            </button>
          </div>

          {testResult !== null && (
            <div className={`p-3 rounded-lg text-sm ${testResult ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {testResult ? '连接成功！网关服务正常运行。' : '连接失败，请检查地址和网关服务是否启动。'}
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-card rounded-lg border border-border p-6 shadow-custom">
        <h3 className="text-lg font-semibold text-foreground mb-4">使用说明</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>1. 确保 RayCoreGateway 后端服务已启动</p>
          <p>2. 在上方输入网关服务地址（默认: http://localhost:3210）</p>
          <p>3. 点击"测试连接"验证连接是否正常</p>
          <p>4. 测试通过后点击"保存并重连"应用配置</p>
          <p>5. 在"设备管理"中添加泵设备的 IP 地址</p>
          <p>6. 前往"设备控制"页面进行泵的操作控制</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkConfig;