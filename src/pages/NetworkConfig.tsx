import React from 'react';

const NetworkConfig: React.FC = () => {
  console.log('网管配置页面渲染');
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">网管配置</h1>
        <p className="text-muted-foreground mt-1">配置网络参数和连接设置</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">网络配置功能</h2>
        <p className="text-muted-foreground">此功能正在开发中...</p>
      </div>
    </div>
  );
};

export default NetworkConfig;