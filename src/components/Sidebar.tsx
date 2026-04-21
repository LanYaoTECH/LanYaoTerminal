import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  MonitorSpeaker, 
  FileText, 
  Network, 
  Users, 
  Home,
  Activity
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  console.log('侧边栏组件渲染，当前路径：', location.pathname);
  
  const menuItems = [
    {
      path: '/',
      label: '总览',
      icon: Home
    },
    {
      path: '/device-control',
      label: '注射泵控制',
      icon: Settings
    },
    {
      path: '/treadmill-control',
      label: '跑步机控制',
      icon: Activity
    },
    {
      path: '/device-management',
      label: '设备管理',
      icon: MonitorSpeaker
    },
    {
      path: '/logs',
      label: '日志查看',
      icon: FileText
    },
    {
      path: '/network-config',
      label: '网管配置',
      icon: Network
    },
    {
      path: '/user-management',
      label: '用户管理',
      icon: Users
    }
  ];
  
  return (
    <aside data-cmp="Sidebar" className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">鳐芯终端</h1>
            <p className="text-sm text-muted-foreground">RayCoreManager</p>
          </div>
        </div>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-custom'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* 底部版本信息 */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>版本 v1.0.0 Beta</p>
          <p className="mt-1">© 2026 鳐芯终端</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;