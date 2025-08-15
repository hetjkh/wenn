import React, { useState } from 'react';
import { Avatar, Button, Input, Space, Typography, Tooltip } from 'antd';
import { CloseOutlined, EditOutlined, CheckOutlined, WhatsAppOutlined, MessageOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage.js';

const { Text } = Typography;

interface ServiceItemProps {
  service: {
    id: string;
    name: string;
    type: 'whatsapp';
    iconType: string;
    partition: string;
  };
  isActive: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onRename: (newName: string) => void;
  collapsed: boolean;
  isDarkMode: boolean;
}

// Helper function to get icon based on type
const getServiceIcon = (iconType: string) => {
  switch (iconType) {
    case 'whatsapp':
      return <WhatsAppOutlined style={{ color: '#25D366' }} />;
    default:
      return <MessageOutlined />;
  }
};

const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  isActive,
  onClick,
  onRemove,
  onRename,
  collapsed,
  isDarkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(service.name);

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== service.name) {
      onRename(editName.trim());
      
      // Save service data immediately
      storage.saveData(`service-${service.id}`, {
        ...service,
        name: editName.trim(),
        lastModified: Date.now()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(service.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: isActive 
          ? (isDarkMode ? '#1890ff20' : '#e6f7ff') 
          : 'transparent',
        border: isActive 
          ? '1px solid #1890ff' 
          : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={!isEditing ? onClick : undefined}
      onMouseEnter={(e) => {
        if (!isActive && !isEditing) {
          e.currentTarget.style.background = isDarkMode ? '#1f1f1f' : '#fafafa';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isEditing) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }
      }}
    >
      <Avatar 
        size={collapsed ? 32 : 40} 
        icon={getServiceIcon(service.iconType)}
        style={{ 
          flexShrink: 0,
          boxShadow: isActive ? '0 0 0 2px #1890ff40' : 'none',
          transition: 'all 0.3s'
        }}
      />
      
      {!collapsed && (
        <>
          <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                autoFocus
                size="small"
                style={{
                  background: isDarkMode ? '#1f1f1f' : '#fff',
                  borderColor: '#1890ff',
                  color: isDarkMode ? '#fff' : undefined
                }}
                maxLength={50}
              />
            ) : (
              <Text 
                strong 
                style={{ 
                  color: isDarkMode ? '#fff' : undefined,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {service.name}
              </Text>
            )}
          </div>
          
          <Space size="small" style={{ opacity: isActive ? 1 : 0.6 }}>
            {isEditing ? (
              <Button 
                type="text" 
                size="small"
                icon={<CheckOutlined />}
                onClick={handleSave}
                style={{ color: '#52c41a' }}
              />
            ) : (
              <Tooltip title="Rename Service">
                <Button 
                  type="text" 
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  style={{ 
                    color: isDarkMode ? '#fff' : '#595959',
                    opacity: 0.7
                  }}
                />
              </Tooltip>
            )}
            
            <Tooltip title="Remove Service">
              <Button 
                type="text" 
                size="small"
                icon={<CloseOutlined />}
                onClick={onRemove}
                style={{ 
                  color: '#ff4d4f',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
              />
            </Tooltip>
          </Space>
        </>
      )}
    </div>
  );
};

export default ServiceItem;