import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-background">
          {/* 固定宽度布局容器 */}
          <div className="w-full max-w-[1440px] mx-auto flex">
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
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;