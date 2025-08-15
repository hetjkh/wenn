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
  SettingOutlined,
  DownOutlined,
  RightOutlined,
  MailOutlined,
  SlackOutlined,
  SkypeOutlined,
  TeamOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  CalendarOutlined,
  CloudOutlined,
  FileOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  RedditOutlined,
  TikTokOutlined,
  YoutubeOutlined,
  SpotifyOutlined
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

interface WorkspaceDetailSidebarProps {
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
  isDarkMode: boolean;
  onClose: () => void;
  onReorderServices?: (dragIndex: number, hoverIndex: number) => void;
}

const WorkspaceDetailSidebar: React.FC<WorkspaceDetailSidebarProps> = ({
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
  isDarkMode,
  onClose,
  onReorderServices
}) => {
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set([activeWorkspace]));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return <WhatsAppOutlined style={{ color: '#25D366', fontSize: '18px' }} />;
      case 'gmail':
        return <MailOutlined style={{ color: '#EA4335', fontSize: '18px' }} />;
      case 'messenger':
        return <MessageOutlined style={{ color: '#0084FF', fontSize: '18px' }} />;
      case 'slack':
        return <SlackOutlined style={{ color: '#4A154B', fontSize: '18px' }} />;
      case 'telegram':
        return <MessageOutlined style={{ color: '#0088CC', fontSize: '18px' }} />;
      case 'discord':
        return <MessageOutlined style={{ color: '#5865F2', fontSize: '18px' }} />;
      case 'skype':
        return <SkypeOutlined style={{ color: '#00AFF0', fontSize: '18px' }} />;
      case 'teams':
        return <TeamOutlined style={{ color: '#6264A7', fontSize: '18px' }} />;
      case 'facebook':
        return <FacebookOutlined style={{ color: '#1877F2', fontSize: '18px' }} />;
      case 'instagram':
        return <InstagramOutlined style={{ color: '#E4405F', fontSize: '18px' }} />;
      case 'twitter':
        return <TwitterOutlined style={{ color: '#1DA1F2', fontSize: '18px' }} />;
      case 'linkedin':
        return <LinkedinOutlined style={{ color: '#0A66C2', fontSize: '18px' }} />;
      case 'github':
        return <GithubOutlined style={{ color: '#181717', fontSize: '18px' }} />;
      case 'google-calendar':
        return <CalendarOutlined style={{ color: '#4285F4', fontSize: '18px' }} />;
      case 'google-drive':
        return <CloudOutlined style={{ color: '#4285F4', fontSize: '18px' }} />;
      case 'notion':
        return <FileOutlined style={{ color: '#000000', fontSize: '18px' }} />;
      case 'trello':
        return <FileOutlined style={{ color: '#0079BF', fontSize: '18px' }} />;
      case 'asana':
        return <FileOutlined style={{ color: '#F06A6A', fontSize: '18px' }} />;
      case 'spotify':
        return <SpotifyOutlined style={{ color: '#1DB954', fontSize: '18px' }} />;
      case 'netflix':
        return <VideoCameraOutlined style={{ color: '#E50914', fontSize: '18px' }} />;
      case 'twitch':
        return <VideoCameraOutlined style={{ color: '#9146FF', fontSize: '18px' }} />;
      case 'zoom':
        return <VideoCameraOutlined style={{ color: '#2D8CFF', fontSize: '18px' }} />;
      case 'youtube':
        return <YoutubeOutlined style={{ color: '#FF0000', fontSize: '18px' }} />;
      case 'tiktok':
        return <TikTokOutlined style={{ color: '#000000', fontSize: '18px' }} />;
      case 'reddit':
        return <RedditOutlined style={{ color: '#FF4500', fontSize: '18px' }} />;
      case 'salesforce':
        return <GlobalOutlined style={{ color: '#00A1E0', fontSize: '18px' }} />;
      case 'hubspot':
        return <GlobalOutlined style={{ color: '#FF7A59', fontSize: '18px' }} />;
      default:
        return <GlobalOutlined style={{ color: '#1890ff', fontSize: '18px' }} />;
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

  const handleDeleteService = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Remove Service',
      content: 'Are you sure you want to remove this service? This action cannot be undone.',
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => onRemoveService(serviceId, e)
    });
  };

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);

  const toggleWorkspaceExpansion = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

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

  const handleDrop = (e: React.DragEvent, dropIndex: number, workspaceServices: ServiceTab[]) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderServices) {
      console.log('🔄 Reordering services:', draggedIndex, '->', dropIndex);
      onReorderServices(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleServiceContextMenu = (e: React.MouseEvent, service: ServiceTab) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create context menu
    const contextMenuItems = [
      {
        key: 'edit',
        label: 'Edit Service',
        icon: <EditOutlined />,
        onClick: () => handleServiceEdit(service)
      },
      {
        key: 'remove',
        label: 'Remove Service',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteService(service.id, e)
      }
    ];

    // Show custom context menu
    const showContextMenu = (items: any[], x: number, y: number) => {
      const menu = document.createElement('div');
      menu.style.position = 'fixed';
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.zIndex = '9999';
      menu.style.background = isDarkMode ? '#1f1f1f' : '#fff';
      menu.style.border = `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`;
      menu.style.borderRadius = '6px';
      menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      menu.style.padding = '4px 0';
      menu.style.minWidth = '120px';

      items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.style.padding = '8px 12px';
        menuItem.style.cursor = 'pointer';
        menuItem.style.display = 'flex';
        menuItem.style.alignItems = 'center';
        menuItem.style.gap = '8px';
        menuItem.style.fontSize = '13px';
        menuItem.style.color = item.danger ? '#ff4d4f' : (isDarkMode ? '#fff' : '#262626');
        menuItem.innerHTML = `<span>${item.label}</span>`;
        
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = isDarkMode ? '#262626' : '#f0f0f0';
        });
        
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'transparent';
        });
        
        menuItem.addEventListener('click', () => {
          item.onClick();
          document.body.removeChild(menu);
        });
        
        menu.appendChild(menuItem);
      });

      document.body.appendChild(menu);

      // Remove menu on click outside
      const handleClickOutside = (event: MouseEvent) => {
        if (!menu.contains(event.target as Node)) {
          document.body.removeChild(menu);
          document.removeEventListener('click', handleClickOutside);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
    };

    showContextMenu(contextMenuItems, e.clientX, e.clientY);
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: isDarkMode ? '#000' : '#fff'
    }}>
      {/* Header */}
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
          icon={<CloseOutlined />}
          size="small"
          onClick={onClose}
          style={{
            color: isDarkMode ? '#fff' : '#595959',
            opacity: 0.7
          }}
        />
      </div>

      {/* All Services Section */}
      <div style={{ padding: '16px 20px' }}>
        {/* Other Workspaces Section */}
        {workspaces.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {workspaces.map(workspace => (
                <div key={workspace.id}>
                  {/* Workspace Header */}
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid transparent',
                      transition: 'all 0.3s',
                      position: 'relative',
                      borderLeft: activeWorkspace === workspace.id 
                        ? '3px solid #1890ff' 
                        : '3px solid transparent'
                    }}
                    onClick={() => {
                      onWorkspaceClick(workspace.id);
                      // Auto-close sidebar when selecting a workspace
                      setTimeout(() => {
                        onClose();
                      }, 150);
                    }}
                    onMouseEnter={(e) => {
                      if (activeWorkspace !== workspace.id) {
                        e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeWorkspace !== workspace.id) {
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
                              color: isDarkMode ? '#fff' : undefined,
                              fontSize: '14px'
                            }}
                            maxLength={50}
                          />
                        ) : (
                          <Text 
                            style={{ 
                              color: activeWorkspace === workspace.id 
                                ? '#1890ff' 
                                : (isDarkMode ? '#fff' : '#262626'),
                              fontSize: '14px',
                              fontWeight: activeWorkspace === workspace.id ? 600 : 500
                            }}
                          >
                            {workspace.name}
                          </Text>
                        )}
                        <br />
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px',
                            color: activeWorkspace === workspace.id 
                              ? '#1890ff80' 
                              : undefined
                          }}
                        >
                          {workspace.services.length} services
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {editingWorkspace === workspace.id ? (
                          <>
                            <Button 
                              type="text" 
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveWorkspace();
                              }}
                              style={{ color: '#52c41a' }}
                            />
                            <Button 
                              type="text" 
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              style={{ color: '#ff4d4f' }}
                            />
                          </>
                        ) : (
                          <>
                            <Tooltip title="Edit Workspace">
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
                                  opacity: 0.6
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '0.6';
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
                                    opacity: 0.6
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = '0.6';
                                  }}
                                />
                              </Tooltip>
                            )}
                            
                            {/* Expand/Collapse Arrow */}
                            <Button
                              type="text"
                              size="small"
                              icon={expandedWorkspaces.has(workspace.id) ? <DownOutlined /> : <RightOutlined />}
                              style={{
                                color: activeWorkspace === workspace.id 
                                  ? '#1890ff' 
                                  : (isDarkMode ? '#fff' : '#595959'),
                                opacity: 0.6,
                                marginLeft: '4px',
                                transition: 'all 0.3s'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWorkspaceExpansion(workspace.id);
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Services */}
                  {expandedWorkspaces.has(workspace.id) && (
                    <div style={{ marginLeft: '16px', marginTop: '8px', marginBottom: '8px' }}>
                      {workspace.services.map((service, serviceIndex) => (
                        <div key={service.id}>
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, serviceIndex)}
                            onDragOver={(e) => handleDragOver(e, serviceIndex)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, serviceIndex, workspace.services)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleServiceContextMenu(e, service)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: activeTab === service.id 
                                ? (isDarkMode ? '#1890ff15' : '#e6f7ff') 
                                : 'transparent',
                              border: activeTab === service.id 
                                ? '1px solid #1890ff' 
                                : dragOverIndex === serviceIndex 
                                  ? '1px dashed #1890ff'
                                  : '1px solid transparent',
                              borderLeft: activeTab === service.id 
                                ? '3px solid #1890ff' 
                                : '3px solid transparent',
                              transition: 'all 0.3s',
                              marginBottom: '4px',
                              transform: draggedIndex === serviceIndex ? 'rotate(2deg) scale(1.02)' : 'none',
                              opacity: draggedIndex === serviceIndex ? 0.8 : 1,
                              boxShadow: draggedIndex === serviceIndex ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                            }}
                            onClick={() => {
                              onServiceClick(service.id);
                              // Auto-close sidebar when selecting a service
                              setTimeout(() => {
                                onClose();
                              }, 150);
                            }}
                            onMouseEnter={(e) => {
                              if (activeTab !== service.id && draggedIndex === null) {
                                e.currentTarget.style.background = isDarkMode ? '#1a1a1a' : '#f9f9f9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (activeTab !== service.id && draggedIndex === null) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {/* Drag handle */}
                            <div style={{
                              marginRight: '4px',
                              opacity: 0.3,
                              fontSize: '10px',
                              color: isDarkMode ? '#fff' : '#595959'
                            }}>
                              ⋮⋮
                            </div>
                            
                            <Avatar 
                              size={24}
                              icon={getServiceIcon(service.iconType)}
                              style={{ 
                                background: 'transparent',
                                border: `1px solid ${activeTab === service.id ? '#1890ff' : 'transparent'}`,
                                flexShrink: 0,
                                boxShadow: activeTab === service.id ? '0 0 0 2px #1890ff40' : 'none',
                              }}
                            />
                            
                            <div style={{ marginLeft: '8px', minWidth: 0, flex: 1 }}>
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
                                    borderColor: '#1890ff',
                                    color: isDarkMode ? '#fff' : undefined,
                                    fontSize: '13px'
                                  }}
                                  maxLength={50}
                                />
                              ) : (
                                <Text 
                                  style={{ 
                                    color: activeTab === service.id 
                                      ? '#1890ff' 
                                      : (isDarkMode ? '#fff' : '#262626'),
                                    fontSize: '13px',
                                    fontWeight: activeTab === service.id ? 600 : 500
                                  }}
                                >
                                  {service.name}
                                </Text>
                              )}
                            </div>
                            
                            {/* Service Edit/Delete Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '8px' }}>
                              {editingService === service.id ? (
                                <>
                                  <Button 
                                    type="text" 
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveService();
                                    }}
                                    style={{ color: '#52c41a', fontSize: '12px' }}
                                  />
                                  <Button 
                                    type="text" 
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelEdit();
                                    }}
                                    style={{ color: '#ff4d4f', fontSize: '12px' }}
                                  />
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit Service">
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
                                        opacity: 0.5,
                                        fontSize: '12px'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.5';
                                      }}
                                    />
                                  </Tooltip>
                                  
                                  <Tooltip title="Remove Service">
                                    <Button 
                                      type="text" 
                                      size="small"
                                      icon={<CloseOutlined />}
                                      onClick={(e) => handleDeleteService(service.id, e)}
                                      style={{ 
                                        color: '#ff4d4f',
                                        opacity: 0.5,
                                        fontSize: '12px'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.5';
                                      }}
                                    />
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Drop indicator */}
                          {dragOverIndex === serviceIndex && draggedIndex !== serviceIndex && (
                            <div style={{
                              height: '2px',
                              background: '#1890ff',
                              margin: '2px 12px',
                              borderRadius: '1px'
                            }} />
                          )}
                          
                          {/* Line separator after each WhatsApp service */}
                          <div style={{
                            height: '1px',
                            background: isDarkMode ? '#434343' : '#f0f0f0',
                            margin: '6px 12px',
                            opacity: 0.4
                          }} />
                        </div>
                      ))}

                      {/* Add Service Button for expanded workspace */}
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          onWorkspaceClick(workspace.id);
                          onAddService();
                        }}
                        style={{ 
                          width: '100%',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
                          fontSize: '12px',
                          marginTop: '4px',
                          border: `1px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1890ff';
                          e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
                          e.currentTarget.style.borderColor = '#1890ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isDarkMode ? '#8c8c8c' : '#8c8c8c';
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#d9d9d9';
                        }}
                      >
                        <span style={{ marginLeft: '8px' }}>
                          Add Service
                        </span>
                      </Button>
                    </div>
                  )}
                  
                  {/* Separator line after each workspace */}
                  <div style={{
                    height: '1px',
                    background: isDarkMode ? '#434343' : '#f0f0f0',
                    margin: '12px 0',
                    opacity: 0.5
                  }} />
                </div>
              ))}
            </Space>
          </div>
        )}

        {/* Add New Workspace */}
        <div style={{ marginTop: '24px' }}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddWorkspace}
            style={{ 
              width: '100%',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
              fontSize: '13px',
              border: `1px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`,
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1890ff';
              e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
              e.currentTarget.style.borderColor = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDarkMode ? '#8c8c8c' : '#8c8c8c';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#d9d9d9';
            }}
          >
            <span style={{ marginLeft: '8px' }}>
              Add new workspace
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetailSidebar;