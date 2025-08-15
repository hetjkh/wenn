import React from 'react';
import { Space, Button, Tooltip, Avatar, Dropdown, Menu, message, Modal, Input, Form } from 'antd';
import { 
  PlusOutlined,
  SettingOutlined,
  BellOutlined,
  MenuOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  ReloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getServiceConfig } from '../utils/serviceConfig';

interface ServiceTab {
  id: string;
  name: string;
  type: 'whatsapp';
  iconType: string;
  partition: string;
  workspaceId: string;
}

interface Workspace {
  id: string;
  name: string;
  services: ServiceTab[];
  createdAt: number;
}

interface WorkspaceIconSidebarProps {
  workspaces: Workspace[];
  activeWorkspace: string;
  onWorkspaceClick: (id: string) => void;
  onAddWorkspace: () => void;
  onToggleDetail: () => void;
  workspaceDetailVisible: boolean;
  isDarkMode: boolean;
  onShowSettings: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  // Add new props for services
  services?: ServiceTab[];
  activeTab?: string;
  onServiceClick?: (id: string) => void;
  onAddService?: () => void;
  onRemoveService?: (id: string, e: React.MouseEvent) => void;
  onRenameService?: (id: string, newName: string) => void;
  onReorderServices?: (dragIndex: number, hoverIndex: number) => void;
  disabledServices?: Set<string>;
  onToggleServiceStatus?: (serviceId: string, enabled: boolean) => void;
  onReloadService?: (serviceId: string) => void;
}

const WorkspaceIconSidebar: React.FC<WorkspaceIconSidebarProps> = ({
  workspaces,
  activeWorkspace,
  onWorkspaceClick,
  onAddWorkspace,
  onToggleDetail,
  workspaceDetailVisible,
  isDarkMode,
  onShowSettings,
  notificationsEnabled,
  onToggleNotifications,
  services = [],
  activeTab = '',
  onServiceClick,
  onAddService,
  onRemoveService,
  onRenameService,
  onReorderServices,
  disabledServices = new Set(),
  onToggleServiceStatus,
  onReloadService
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = React.useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editingService, setEditingService] = React.useState<ServiceTab | null>(null);
  const [form] = Form.useForm();

  // Memoized service configs for better performance
  const serviceConfigs = React.useMemo(() => {
    return services.map(service => ({
      ...service,
      config: getServiceConfig(service.iconType)
    }));
  }, [services]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderServices) {
      onReorderServices(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleServiceReload = (serviceId: string, serviceName: string) => {
    if (onReloadService) {
      onReloadService(serviceId);
      message.success(`${serviceName} reloaded`);
    } else if (window.electronAPI?.reloadService) {
      window.electronAPI.reloadService(serviceId);
      message.success(`${serviceName} reloaded`);
    }
    setContextMenuVisible(null);
  };

  const handleServiceEdit = (service: ServiceTab) => {
    setEditingService(service);
    form.setFieldsValue({ serviceName: service.name });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    form.validateFields()
      .then((values) => {
        if (values.serviceName && values.serviceName.trim() && onRenameService && editingService) {
          onRenameService(editingService.id, values.serviceName.trim());
          message.success('Service renamed successfully');
          setIsEditModalVisible(false);
          setContextMenuVisible(null);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setContextMenuVisible(null);
  };

  const handleServiceRemove = (service: ServiceTab, e: React.MouseEvent) => {
    if (window.confirm(`Are you sure you want to remove "${service.name}"?`)) {
      if (onRemoveService) {
        onRemoveService(service.id, e);
        message.success('Service removed');
      }
    }
    setContextMenuVisible(null);
  };

  const handleServiceToggle = (serviceId: string, serviceName: string, currentlyDisabled: boolean) => {
    const newStatus = !currentlyDisabled;
    if (onToggleServiceStatus) {
      onToggleServiceStatus(serviceId, newStatus);
    }
    
    // Also notify Electron if available
    if (window.electronAPI?.toggleService) {
      window.electronAPI.toggleService(serviceId, newStatus);
    }
    
    message.success(`${serviceName} ${newStatus ? 'enabled' : 'disabled'}`);
    setContextMenuVisible(null);
  };

  const handleContextMenu = (e: React.MouseEvent, service: ServiceTab, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isDisabled = disabledServices.has(service.id);
    
    const menuItems = [
      {
        key: 'reload',
        label: 'Reload Service',
        icon: <ReloadOutlined />,
        onClick: () => handleServiceReload(service.id, service.name)
      },
      {
        key: 'edit',
        label: 'Edit Service',
        icon: <EditOutlined />,
        onClick: () => handleServiceEdit(service)
      },
      {
        key: 'toggle',
        label: isDisabled ? 'Enable Service' : 'Disable Service',
        icon: isDisabled ? <EyeOutlined /> : <EyeInvisibleOutlined />,
        onClick: () => handleServiceToggle(service.id, service.name, isDisabled)
      },
      {
        key: 'divider',
        type: 'divider'
      },
      {
        key: 'remove',
        label: 'Remove Service',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleServiceRemove(service, e)
      }
    ];

    // Create custom context menu
    const showContextMenu = (items: any[], x: number, y: number) => {
      // Remove any existing context menu
      const existingMenu = document.getElementById('service-context-menu');
      if (existingMenu) {
        document.body.removeChild(existingMenu);
      }

      const menu = document.createElement('div');
      menu.id = 'service-context-menu';
      menu.style.position = 'fixed';
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.zIndex = '9999';
      menu.style.background = isDarkMode ? '#1f1f1f' : '#fff';
      menu.style.border = `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`;
      menu.style.borderRadius = '8px';
      menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      menu.style.padding = '8px 0';
      menu.style.minWidth = '160px';
      menu.style.fontSize = '14px';
      menu.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      items.forEach(item => {
        if (item.type === 'divider') {
          const divider = document.createElement('div');
          divider.style.height = '1px';
          divider.style.background = isDarkMode ? '#434343' : '#f0f0f0';
          divider.style.margin = '4px 0';
          menu.appendChild(divider);
          return;
        }

        const menuItem = document.createElement('div');
        menuItem.style.padding = '8px 16px';
        menuItem.style.cursor = 'pointer';
        menuItem.style.display = 'flex';
        menuItem.style.alignItems = 'center';
        menuItem.style.gap = '12px';
        menuItem.style.color = item.danger ? '#ff4d4f' : (isDarkMode ? '#fff' : '#262626');
        menuItem.style.transition = 'background-color 0.2s';
        
        // Create icon element
        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '14px';
        iconSpan.style.display = 'flex';
        iconSpan.style.alignItems = 'center';
        iconSpan.style.width = '16px';
        iconSpan.style.height = '16px';
        
        // Add icon based on type
        if (item.key === 'reload') {
          iconSpan.innerHTML = '↻';
        } else if (item.key === 'edit') {
          iconSpan.innerHTML = '✏️';
        } else if (item.key === 'toggle') {
          iconSpan.innerHTML = isDisabled ? '👁️' : '🚫';
        } else if (item.key === 'remove') {
          iconSpan.innerHTML = '🗑️';
        }
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = item.label;
        
        menuItem.appendChild(iconSpan);
        menuItem.appendChild(labelSpan);
        
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = isDarkMode ? '#262626' : '#f0f0f0';
        });
        
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'transparent';
        });
        
        menuItem.addEventListener('click', (event) => {
          event.stopPropagation();
          item.onClick();
          document.body.removeChild(menu);
        });
        
        menu.appendChild(menuItem);
      });

      document.body.appendChild(menu);

      // Position menu to stay within viewport
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (rect.right > viewportWidth) {
        menu.style.left = `${x - rect.width}px`;
      }
      
      if (rect.bottom > viewportHeight) {
        menu.style.top = `${y - rect.height}px`;
      }

      // Remove menu on click outside or escape key
      const handleClickOutside = (event: MouseEvent) => {
        if (!menu.contains(event.target as Node)) {
          document.body.removeChild(menu);
          document.removeEventListener('click', handleClickOutside);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          document.body.removeChild(menu);
          document.removeEventListener('click', handleClickOutside);
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }, 100);
    };

    showContextMenu(menuItems, e.clientX, e.clientY);
  };

  return (
    <>
      <Modal
        title="Edit Service Name"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ serviceName: editingService?.name || '' }}
        >
          <Form.Item
            name="serviceName"
            label="Service Name"
            rules={[
              { required: true, message: 'Please enter a service name' },
              { max: 50, message: 'Name must be less than 50 characters' }
            ]}
          >
            <Input placeholder="Enter service name" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: isDarkMode ? '#000' : '#fff'
      }}>
      {/* Logo */}
      <div style={{ 
        padding: '16px 8px', 
        borderBottom: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
        textAlign: 'center',
        background: isDarkMode ? '#000' : '#fff'
      }}>
        <img 
          src="./3.png"
          alt="TextNexus Logo" 
          style={{ 
            width: '90px', 
            height: '36px', 
            borderRadius: '8px'
          }} 
        />
      </div>

      {/* Service Icons */}
      <div style={{
        flex: 1,
        // overflowY: 'auto',
        padding: '16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {serviceConfigs.map(({ config, ...service }, index) => (
          <Tooltip 
            key={service.id} 
            title={disabledServices.has(service.id) ? `${service.name} (Disabled)` : service.name}
            placement="right"
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onContextMenu={(e) => handleContextMenu(e, service, index)}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: disabledServices.has(service.id)
                  ? (isDarkMode ? '#1a1a1a' : '#f5f5f5')
                  : activeTab === service.id 
                    ? config.color
                    : (isDarkMode ? '#262626' : '#f0f0f0'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabledServices.has(service.id) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                border: disabledServices.has(service.id)
                  ? `2px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`
                  : activeTab === service.id 
                    ? `2px solid ${config.color}` 
                    : dragOverIndex === index 
                      ? '2px dashed #1890ff'
                      : '2px solid transparent',
                position: 'relative',
                boxShadow: disabledServices.has(service.id)
                  ? 'none'
                  : activeTab === service.id 
                    ? `0 4px 12px ${config.color}40` 
                    : draggedIndex === index 
                      ? '0 8px 24px rgba(0,0,0,0.3)'
                      : 'none',
                transform: draggedIndex === index ? 'rotate(5deg) scale(1.05)' : 'none',
                opacity: disabledServices.has(service.id) 
                  ? 0.5 
                  : draggedIndex === index 
                    ? 0.8 
                    : 1
              }}
              onClick={() => {
                if (!disabledServices.has(service.id)) {
                  onServiceClick?.(service.id);
                }
              }}
              onMouseEnter={(e) => {
                if (activeTab !== service.id && draggedIndex === null && !disabledServices.has(service.id)) {
                  e.currentTarget.style.background = `${config.color}80`;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== service.id && draggedIndex === null && !disabledServices.has(service.id)) {
                  e.currentTarget.style.background = disabledServices.has(service.id)
                    ? (isDarkMode ? '#1a1a1a' : '#f5f5f5')
                    : (isDarkMode ? '#262626' : '#f0f0f0');
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {/* Drag indicator */}
              <div style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                opacity: disabledServices.has(service.id) ? 0.2 : 0.3,
                fontSize: '8px',
                color: disabledServices.has(service.id) 
                  ? (isDarkMode ? '#666' : '#999')
                  : activeTab === service.id 
                    ? 'white' 
                    : (isDarkMode ? '#fff' : '#595959')
              }}>
                <DragOutlined />
              </div>
              
              <div style={{
                color: disabledServices.has(service.id)
                  ? (isDarkMode ? '#666' : '#999')
                  : activeTab === service.id 
                    ? 'white' 
                    : (isDarkMode ? '#fff' : '#595959'),
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: disabledServices.has(service.id)
                    ? (isDarkMode ? '#666' : '#999')
                    : activeTab === service.id 
                      ? 'white' 
                      : config.color
                }}>
                  {React.cloneElement(config.icon, { style: { fontSize: '24px' } })}
                </div>
              </div>
              
              {/* Drop indicator */}
              {dragOverIndex === index && draggedIndex !== index && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  border: '2px dashed #1890ff',
                  borderRadius: '12px',
                  background: 'rgba(24, 144, 255, 0.1)',
                  pointerEvents: 'none'
                }} />
              )}
              
              {/* Disabled indicator */}
              {disabledServices.has(service.id) && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: isDarkMode ? '#666' : '#999',
                  background: isDarkMode ? '#000' : '#fff',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                  whiteSpace: 'nowrap'
                }}>
                  Disabled
                </div>
              )}
            </div>
          </Tooltip>
        ))}
        
        {/* Add service button */}
        <Tooltip title="Add WhatsApp Service" placement="right">
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'transparent',
              border: `2px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={onAddService}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#25D366';
              e.currentTarget.style.background = isDarkMode ? '#25D36610' : '#f6ffed';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#d9d9d9';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <PlusOutlined style={{ color: isDarkMode ? '#fff' : '#595959', fontSize: '16px' }} />
          </div>
        </Tooltip>
      </div>

      {/* Bottom Controls */}
      <div style={{ 
        padding: '16px 8px',
        borderTop: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
        background: isDarkMode ? '#000' : '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Toggle Detail Sidebar */}
        <Tooltip title={workspaceDetailVisible ? "Hide workspace details" : "Show workspace details"} placement="right">
          <Button 
            type="text" 
            icon={<MenuOutlined />}
            onClick={onToggleDetail}
            style={{
              width: '54px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#fff' : '#595959',
              background: workspaceDetailVisible ? (isDarkMode ? '#1890ff20' : '#e6f7ff') : 'transparent',
              border: workspaceDetailVisible ? '1px solid #1890ff' : 'none',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              if (!workspaceDetailVisible) {
                e.currentTarget.style.background = isDarkMode ? '#262626' : '#f0f0f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!workspaceDetailVisible) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          />
        </Tooltip>

        {/* Notifications Toggle */}
        <Tooltip title={`Notifications ${notificationsEnabled ? 'On' : 'Off'}`} placement="right">
          <Button 
            type="text" 
            icon={<BellOutlined style={{ color: notificationsEnabled ? '#52c41a' : undefined }} />}
            onClick={() => onToggleNotifications(!notificationsEnabled)}
            style={{
              width: '54px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#fff' : '#595959',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#262626' : '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          />
        </Tooltip>

        {/* Settings Button */}
        <Tooltip title="Settings" placement="right">
          <Button 
            type="text" 
            icon={<SettingOutlined />}
            onClick={onShowSettings}
            style={{
              width: '54px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#fff' : '#595959',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#262626' : '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          />
        </Tooltip>
      </div>
      </div>
    </>
  );
};

export default WorkspaceIconSidebar;