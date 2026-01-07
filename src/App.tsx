import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DeviceControl from "./pages/DeviceControl";
import DeviceManagement from "./pages/DeviceManagement";
import Logs from "./pages/Logs";
import NetworkConfig from "./pages/NetworkConfig";
import UserManagement from "./pages/UserManagement";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => {
  console.log('设备管理系统启动');
  
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const Router = (isFileProtocol ? HashRouter : BrowserRouter) as any;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex min-h-screen w-screen bg-background">
          {/* 自适应宽度容器，去除固定最大宽度 */}
          <div className="w-full flex">
            {/* 左侧导航栏 */}
            <Sidebar />
            
            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col">
              {/* 顶部栏 */}
              <Header />
              
              {/* 页面内容 */}
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/device-control" element={<DeviceControl />} />
                  <Route path="/device-management" element={<DeviceManagement />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/network-config" element={<NetworkConfig />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  {/* 兜底：任何未知路径跳转到总览 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;