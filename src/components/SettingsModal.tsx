import React, { useState } from 'react';
import { Modal, Switch, Typography, Space, Divider, Button, message } from 'antd';
import { 
  SettingOutlined, 
  BellOutlined, 
  MoonOutlined, 
  SunOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  isDarkMode,
  onToggleTheme,
  notificationsEnabled,
  onToggleNotifications,
  onClearAllData,
  onExportData,
  onImportData
}) => {
  const [localNotifications, setLocalNotifications] = useState(notificationsEnabled);

  const handleNotificationToggle = (checked: boolean) => {
    setLocalNotifications(checked);
    onToggleNotifications(checked);
    message.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleClearData = () => {
    Modal.confirm({
      title: 'Clear All Data',
      content: 'Are you sure you want to clear all data? This action cannot be undone.',
      okText: 'Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        onClearAllData();
        message.success('All data cleared successfully');
        onClose();
      }
    });
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          Settings
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <div style={{ padding: '16px 0' }}>
        {/* Appearance Settings */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
            Appearance
          </Title>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 0'
          }}>
            <Space>
              {isDarkMode ? <MoonOutlined /> : <SunOutlined />}
              <Text style={{ color: isDarkMode ? '#fff' : undefined }}>
                Dark Mode
              </Text>
            </Space>
            <Switch 
              checked={isDarkMode}
              onChange={onToggleTheme}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </div>
        </div>

        <Divider />

        {/* Notification Settings */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
            Notifications
          </Title>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 0'
          }}>
            <Space>
              <BellOutlined />
              <div>
                <Text style={{ color: isDarkMode ? '#fff' : undefined }}>
                  Enable Notifications
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Get notified about new messages
                </Text>
              </div>
            </Space>
            <Switch 
              checked={localNotifications}
              onChange={handleNotificationToggle}
            />
          </div>
        </div>

        <Divider />

        {/* Data Management */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
            Data Management
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              icon={<ExportOutlined />}
              onClick={onExportData}
              style={{ width: '100%', textAlign: 'left' }}
            >
              Export Data
            </Button>
            <Button 
              icon={<ImportOutlined />}
              onClick={onImportData}
              style={{ width: '100%', textAlign: 'left' }}
            >
              Import Data
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearData}
              style={{ width: '100%', textAlign: 'left' }}
            >
              Clear All Data
            </Button>
          </Space>
        </div>

        <Divider />

        {/* App Info */}
        <div>
          <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
            About
          </Title>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              TextNexus v1.0.0
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Multi-Account Messaging Application
            </Text>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;