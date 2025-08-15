import React, { useState } from 'react';
import { Typography, Space, Button, Tooltip, Input, Modal, Avatar } from 'antd';
import { 
  AppstoreOutlined, 
  WhatsAppOutlined, 
  MessageOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text } = Typography;

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

interface WorkspaceSectionProps {
  workspaces: Workspace[];
  activeWorkspace: string;
  onWorkspaceClick: (id: string) => void;
  onAddWorkspace: () => void;
  onRemoveWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  services: ServiceTab[];
  activeTab: string;
  onServiceClick: (id: string) => void;
  onAddService: () => void;
  onRemoveService: (id: string, e: React.MouseEvent) => void;
  onRenameService: (id: string, newName: string) => void;
  collapsed: boolean;
  isDarkMode: boolean;
}

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({
  workspaces,
  activeWorkspace,
  onWorkspaceClick,
  onAddWorkspace,
  onRemoveWorkspace,
  onRenameWorkspace,
  services,
  activeTab,
  onServiceClick,
  onAddService,
  onRemoveService,
  onRenameService,
  collapsed,
  isDarkMode
}) => {
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return <WhatsAppOutlined style={{ color: '#25D366', fontSize: '16px' }} />;
      default:
        return <MessageOutlined style={{ fontSize: '16px' }} />;
    }
  };

  const handleWorkspaceEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace.id);
    setEditName(workspace.name);
  };

  const handleServiceEdit = (service: ServiceTab) => {
    setEditingService(service.id);
    setEditName(service.name);
  };

  const handleSaveWorkspace = () => {
    if (editName.trim() && editingWorkspace) {
      onRenameWorkspace(editingWorkspace, editName.trim());
    }
    setEditingWorkspace(null);
    setEditName('');
  };

  const handleSaveService = () => {
    if (editName.trim() && editingService) {
      onRenameService(editingService, editName.trim());
    }
    setEditingService(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingWorkspace(null);
    setEditingService(null);
    setEditName('');
  };

  const handleDeleteWorkspace = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Delete Workspace',
      content: 'Are you sure you want to delete this workspace? All services in this workspace will be removed.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => onRemoveWorkspace(workspaceId)
    });
  };

  if (collapsed) {
    return (
      <div style={{ padding: '8px' }}>
        {/* Collapsed view - show only icons */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {workspaces.map(workspace => (
            <Tooltip key={workspace.id} title={workspace.name} placement="right">
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: activeWorkspace === workspace.id 
                    ? 'linear-gradient(135deg, #1890ff, #722ed1)' 
                    : (isDarkMode ? '#262626' : '#f0f0f0'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: activeWorkspace === workspace.id ? '2px solid #1890ff' : 'none'
                }}
                onClick={() => onWorkspaceClick(workspace.id)}
                onMouseEnter={(e) => {
                  if (activeWorkspace !== workspace.id) {
                    e.currentTarget.style.background = isDarkMode ? '#434343' : '#e6f7ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeWorkspace !== workspace.id) {
                    e.currentTarget.style.background = isDarkMode ? '#262626' : '#f0f0f0';
                  }
                }}
              >
                <AppstoreOutlined style={{ 
                  color: activeWorkspace === workspace.id ? 'white' : (isDarkMode ? '#fff' : '#595959'), 
                  fontSize: '20px' 
                }} />
              </div>
            </Tooltip>
          ))}
          
          {/* Add workspace button */}
          <Tooltip title="Add new workspace" placement="right">
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
              onClick={onAddWorkspace}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff';
                e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#d9d9d9';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <PlusOutlined style={{ color: isDarkMode ? '#fff' : '#595959', fontSize: '16px' }} />
            </div>
          </Tooltip>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header with Settings */}
      <div style={{ 
        padding: '16px 20px',
        borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isDarkMode ? '#000' : '#fafafa'
      }}>
        <Text 
          style={{ 
            fontSize: '16px',
            fontWeight: 600,
            color: isDarkMode ? '#fff' : '#262626'
          }}
        >
          Workspaces
        </Text>
        <Button
          type="text"
          icon={<SettingOutlined />}
          size="small"
          style={{
            color: isDarkMode ? '#fff' : '#595959',
            opacity: 0.7
          }}
        />
      </div>

      {/* All Services Section */}
      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: isDarkMode ? '#141414' : '#f8f9fa',
            border: `1px solid ${isDarkMode ? '#434343' : '#e8e8e8'}`,
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#1f1f1f' : '#f0f2f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#141414' : '#f8f9fa';
          }}
        >
          <Text strong style={{ color: isDarkMode ? '#fff' : '#262626', fontSize: '14px' }}>
            All services
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Messenger, Gmail, Franz ToDos, WhatsApp 2s, W...
          </Text>
        </div>

        {/* Workspaces List */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {workspaces.map(workspace => (
            <div key={workspace.id}>
              {/* Workspace Item */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: editingWorkspace === workspace.id ? 'default' : 'pointer',
                  background: activeWorkspace === workspace.id 
                    ? (isDarkMode ? '#1890ff15' : '#e6f7ff') 
                    : 'transparent',
                  border: activeWorkspace === workspace.id 
                    ? '1px solid #1890ff' 
                    : '1px solid transparent',
                  transition: 'all 0.3s',
                  marginBottom: '4px'
                }}
                onClick={editingWorkspace === workspace.id ? undefined : () => onWorkspaceClick(workspace.id)}
                onMouseEnter={(e) => {
                  if (activeWorkspace !== workspace.id && editingWorkspace !== workspace.id) {
                    e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeWorkspace !== workspace.id && editingWorkspace !== workspace.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {editingWorkspace === workspace.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveWorkspace();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={handleSaveWorkspace}
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
                      <>
                        <Text 
                          strong 
                          style={{ 
                            color: isDarkMode ? '#fff' : '#262626',
                            fontSize: '14px'
                          }}
                        >
                          {workspace.name}
                        </Text>
                        <br />
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px'
                          }}
                        >
                          {workspace.services.length > 0 
                            ? workspace.services.map(s => s.name.split(' ')[0]).join(', ')
                            : 'No services'
                          }
                        </Text>
                      </>
                    )}
                  </div>
                  
                  {activeWorkspace === workspace.id && (
                    <Space size="small" style={{ opacity: 0.7 }}>
                      {editingWorkspace === workspace.id ? (
                        <>
                          <Button 
                            type="text" 
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={handleSaveWorkspace}
                            style={{ color: '#52c41a' }}
                          />
                          <Button 
                            type="text" 
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelEdit}
                            style={{ color: '#ff4d4f' }}
                          />
                        </>
                      ) : (
                        <>
                          <Tooltip title="Rename Workspace">
                            <Button 
                              type="text" 
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWorkspaceEdit(workspace);
                              }}
                              style={{ 
                                color: isDarkMode ? '#fff' : '#595959',
                                opacity: 0.7
                              }}
                            />
                          </Tooltip>
                          
                          {workspaces.length > 1 && (
                            <Tooltip title="Delete Workspace">
                              <Button 
                                type="text" 
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                                style={{ 
                                  color: '#ff4d4f',
                                  opacity: 0.7
                                }}
                              />
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Space>
                  )}
                </div>
              </div>

              {/* Services in Active Workspace */}
              {activeWorkspace === workspace.id && (
                <div style={{ marginLeft: '16px', marginTop: '8px', marginBottom: '16px' }}>
                  {services.map(service => (
                    <div
                      key={service.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: editingService === service.id ? 'default' : 'pointer',
                        background: activeTab === service.id 
                          ? (isDarkMode ? '#25D36615' : '#f6ffed') 
                          : 'transparent',
                        border: activeTab === service.id 
                          ? '1px solid #25D366' 
                          : '1px solid transparent',
                        transition: 'all 0.3s',
                        marginBottom: '4px'
                      }}
                      onClick={editingService === service.id ? undefined : () => onServiceClick(service.id)}
                      onMouseEnter={(e) => {
                        if (activeTab !== service.id && editingService !== service.id) {
                          e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : '#f9f9f9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== service.id && editingService !== service.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Avatar 
                        size={28}
                        icon={getServiceIcon(service.iconType)}
                        style={{ 
                          background: '#25D366',
                          flexShrink: 0,
                          boxShadow: activeTab === service.id ? '0 0 0 2px #25D36640' : 'none',
                        }}
                      />
                      
                      <div style={{ marginLeft: '12px', minWidth: 0, flex: 1 }}>
                        {editingService === service.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveService();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            onBlur={handleSaveService}
                            autoFocus
                            size="small"
                            style={{
                              background: isDarkMode ? '#1f1f1f' : '#fff',
                              borderColor: '#25D366',
                              color: isDarkMode ? '#fff' : undefined
                            }}
                            maxLength={50}
                          />
                        ) : (
                          <Text 
                            style={{ 
                              color: isDarkMode ? '#fff' : '#262626',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          >
                            {service.name}
                          </Text>
                        )}
                      </div>
                      
                      <Space size="small" style={{ opacity: activeTab === service.id ? 1 : 0.6 }}>
                        {editingService === service.id ? (
                          <>
                            <Button 
                              type="text" 
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={handleSaveService}
                              style={{ color: '#52c41a' }}
                            />
                            <Button 
                              type="text" 
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={handleCancelEdit}
                              style={{ color: '#ff4d4f' }}
                            />
                          </>
                        ) : (
                          <>
                            <Tooltip title="Rename Service">
                              <Button 
                                type="text" 
                                size="small"
                                icon={<EditOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceEdit(service);
                                }}
                                style={{ 
                                  color: isDarkMode ? '#fff' : '#595959',
                                  opacity: 0.7
                                }}
                              />
                            </Tooltip>
                            
                            <Tooltip title="Remove Service">
                              <Button 
                                type="text" 
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={(e) => onRemoveService(service.id, e)}
                                style={{ 
                                  color: '#ff4d4f',
                                  opacity: 0.7
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                      </Space>
                    </div>
                  ))}

                  {/* Add Service Button */}
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={onAddService}
                    style={{ 
                      width: '100%',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
                      fontSize: '13px',
                      marginTop: '8px',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1890ff';
                      e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode ? '#8c8c8c' : '#8c8c8c';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ marginLeft: '8px' }}>
                      Add new service
                    </span>
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Add New Workspace */}
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddWorkspace}
            style={{ 
              width: '100%',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
              fontSize: '13px',
              marginTop: '12px',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDarkMode ? '#8c8c8c' : '#8c8c8c';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ marginLeft: '8px' }}>
              Add new workspace
            </span>
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default WorkspaceSection;