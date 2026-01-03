import React from 'react';

interface DeviceSwitchProps {
  isOn?: boolean;
  onToggle?: (value: boolean) => void;
  deviceName?: string;
}

const DeviceSwitch: React.FC<DeviceSwitchProps> = ({
  isOn = false,
  onToggle = () => console.log('设备开关切换'),
  deviceName = '设备'
}) => {
  console.log('设备开关组件渲染：', deviceName, isOn);
  
  const handleToggle = () => {
    const newValue = !isOn;
    console.log(`${deviceName} 开关状态变更为：`, newValue);
    onToggle(newValue);
  };
  
  return (
    <div data-cmp="DeviceSwitch" className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">电源控制</span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isOn ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default DeviceSwitch;