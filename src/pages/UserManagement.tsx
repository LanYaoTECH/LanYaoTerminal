import React from 'react';

const UserManagement: React.FC = () => {
  console.log('用户管理页面渲染');
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
        <p className="text-muted-foreground mt-1">管理系统用户账户和权限</p>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">用户管理功能</h2>
        <p className="text-muted-foreground">此功能正在开发中...</p>
      </div>
    </div>
  );
};

export default UserManagement;