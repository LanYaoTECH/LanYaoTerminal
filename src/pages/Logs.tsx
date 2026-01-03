import React from 'react';

const Logs: React.FC = () => {
  console.log('日志查看页面渲染');
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">日志查看</h1>
        <p className="text-muted-foreground mt-1">查看系统操作日志和设备状态历史</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">日志管理功能</h2>
        <p className="text-muted-foreground">此功能正在开发中...</p>
      </div>
    </div>
  );
};

export default Logs;