import React from 'react';

const DeviceManagement: React.FC = () => {
  console.log('设备管理页面渲染');
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">设备管理</h1>
        <p className="text-muted-foreground mt-1">管理设备信息、配置和参数</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">设备管理功能</h2>
        <p className="text-muted-foreground">此功能正在开发中...</p>
      </div>
    </div>
  );
};

export default DeviceManagement;