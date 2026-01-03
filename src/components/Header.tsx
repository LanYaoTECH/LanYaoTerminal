import React from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';

const Header: React.FC = () => {
  console.log('顶部栏组件渲染');
  
  const handleNotificationClick = () => {
    console.log('通知按钮点击');
  };
  
  const handleLogout = () => {
    console.log('退出登录');
  };
  
  return (
    <header data-cmp="Header" className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* 搜索框 */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索设备..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      {/* 右侧操作区域 */}
      <div className="flex items-center space-x-4">
        {/* 通知铃铛 */}
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-card"></span>
        </button>
        
        {/* 用户头像 */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">管理员</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
        
        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title="退出登录"
        >
          <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;