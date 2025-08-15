import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Typography, ConfigProvider, theme, Tooltip } from 'antd';
import { 
  PlusOutlined, 
} from '@ant-design/icons';
import ServiceSelector from './components/ServiceSelector';
import ServiceRenderer from './components/ServiceRenderer';
import WorkspaceIconSidebar from './components/WorkspaceIconSidebar';
import WorkspaceDetailSidebar from './components/WorkspaceDetailSidebar';
import WorkspaceCreator from './components/WorkspaceCreator';
import SettingsModal from './components/SettingsModal';
import { getServiceConfig } from './utils/serviceConfig';
import { storage } from './utils/storage';
import './App.css';

const { Sider, Content } = Layout;
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

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showWorkspaceCreator, setShowWorkspaceCreator] = useState(false);
  const [workspaceDetailVisible, setWorkspaceDetailVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null); // null means not loaded yet
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [disabledServices, setDisabledServices] = useState<Set<string>>(new Set());

  // Listen for Electron events
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for switch to service events (from notifications)
      const handleSwitchToService = (event: any, serviceId: string) => {
        console.log('Switching to service:', serviceId);
        
        // Find the service and its workspace
        const targetService = workspaces.flatMap(w => w.services).find(s => s.id === serviceId);
        if (targetService) {
          setActiveWorkspace(targetService.workspaceId);
          setActiveTab(serviceId);
        }
      };

      window.electronAPI.onSwitchToService(handleSwitchToService);

      return () => {
        // Cleanup listeners if needed
      };
    }
  }, [workspaces]);

  // Get current workspace and its services
  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);
  const services = currentWorkspace?.services || [];

  // Memoized service components map for better performance
  const serviceComponents = React.useMemo(() => {
    const components = new Map();
    services.forEach(service => {
      const isDisabled = disabledServices.has(service.id);
      components.set(service.id, (
        <ServiceRenderer
          key={service.id}
          service={service}
          isDarkMode={isDarkMode}
          isActive={activeTab === service.id}
          isDisabled={isDisabled}
        />
      ));
    });
    return components;
  }, [services, isDarkMode, activeTab, disabledServices]);

  // Load data from electron-store on startup
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('🔄 Loading app data from storage...');
      
      try {
        // Load workspaces using enhanced storage
        const storedWorkspaces = await storage.loadData('workspaces');
        const storedActiveWorkspace = await storage.loadData('activeWorkspace');
        const storedActiveTab = await storage.loadData('activeTab');
        const storedWorkspaceDetailVisible = await storage.loadData('workspaceDetailVisible');
        const storedDarkMode = await storage.loadData('isDarkMode');
        const storedNotifications = await storage.loadData('notificationsEnabled');
        const storedDisabledServices = await storage.loadData('disabledServices');

        console.log('📋 Loaded workspaces:', storedWorkspaces);
        console.log('🏢 Loaded activeWorkspace:', storedActiveWorkspace);
        console.log('🎯 Loaded activeTab:', storedActiveTab);
        console.log('🌙 Loaded darkMode:', storedDarkMode);

        if (storedWorkspaces && Array.isArray(storedWorkspaces) && storedWorkspaces.length > 0) {
          setWorkspaces(storedWorkspaces);
          console.log('✅ Workspaces restored:', storedWorkspaces.length, 'workspaces');
          
          // Set active workspace
          if (storedActiveWorkspace && storedWorkspaces.find(w => w.id === storedActiveWorkspace)) {
            setActiveWorkspace(storedActiveWorkspace);
            console.log('✅ Active workspace restored:', storedActiveWorkspace);
          } else {
            setActiveWorkspace(storedWorkspaces[0].id);
            console.log('✅ Active workspace set to first:', storedWorkspaces[0].id);
          }
          
          // Set active tab within workspace
          const activeWs = storedWorkspaces.find(w => w.id === (storedActiveWorkspace || storedWorkspaces[0].id));
          if (storedActiveTab && activeWs?.services.find(s => s.id === storedActiveTab)) {
            setActiveTab(storedActiveTab);
            console.log('✅ Active tab restored:', storedActiveTab);
          } else if (activeWs?.services.length > 0) {
            setActiveTab(activeWs.services[0].id);
            console.log('✅ Active tab set to first service:', activeWs.services[0].id);
          }
        } else {
          console.log('📝 No workspaces found, starting fresh');
        }
        
        if (typeof storedWorkspaceDetailVisible === 'boolean') {
          setWorkspaceDetailVisible(storedWorkspaceDetailVisible);
        } else {
          setWorkspaceDetailVisible(true);
        }
        if (typeof storedDarkMode === 'boolean') {
          setIsDarkMode(storedDarkMode);
          console.log('✅ Theme restored:', storedDarkMode ? 'Dark' : 'Light');
        } else {
          // If no theme is stored, default to light mode
          setIsDarkMode(false);
          console.log('✅ Theme set to default: Light');
        }
        
        if (typeof storedNotifications === 'boolean') {
          setNotificationsEnabled(storedNotifications);
        }
        
        if (storedDisabledServices && Array.isArray(storedDisabledServices)) {
          setDisabledServices(new Set(storedDisabledServices));
        }
        
        setThemeLoaded(true);
      } catch (error) {
        console.error('❌ Error loading stored data:', error);
        // On error, default to light mode
        setIsDarkMode(false);
        setThemeLoaded(true);
      }
    };

    loadStoredData();
  }, []);

  // Save workspaces to file storage whenever they change
  useEffect(() => {
    if (workspaces.length > 0) {
      console.log('💾 Saving workspaces to storage:', workspaces.length, 'workspaces');
      storage.saveData('workspaces', workspaces);
    }
  }, [workspaces]);

  // Save activeWorkspace to file storage whenever it changes
  useEffect(() => {
    if (!activeWorkspace) return;
    
    console.log('💾 Saving activeWorkspace:', activeWorkspace);
    storage.saveData('activeWorkspace', activeWorkspace);
  }, [activeWorkspace]);

  // Save workspace detail visibility to file storage whenever it changes
  useEffect(() => {
    if (!themeLoaded) return;
    
    console.log('💾 Saving workspace detail visibility:', workspaceDetailVisible);
    storage.saveData('workspaceDetailVisible', workspaceDetailVisible);
  }, [workspaceDetailVisible, themeLoaded]);

  useEffect(() => {
    if (!themeLoaded || isDarkMode === null) return;
    
    console.log('💾 Saving dark mode:', isDarkMode);
    storage.saveData('isDarkMode', isDarkMode);
    
    // Apply theme to body
    document.body.style.background = isDarkMode ? '#141414' : '#f0f2f5';
    document.body.style.color = isDarkMode ? '#fff' : '#000';
  }, [isDarkMode, themeLoaded]);

  // Save notifications setting
  useEffect(() => {
    if (!themeLoaded) return;
    
    console.log('💾 Saving notifications setting:', notificationsEnabled);
    storage.saveData('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled, themeLoaded]);

  // Save disabled services
  useEffect(() => {
    if (!themeLoaded) return;
    
    const disabledArray = Array.from(disabledServices);
    console.log('💾 Saving disabled services:', disabledArray);
    storage.saveData('disabledServices', disabledArray);
  }, [disabledServices, themeLoaded]);

  // Save activeTab to file storage whenever it changes
  useEffect(() => {
    if (!activeTab) return;
    
    console.log('💾 Saving activeTab:', activeTab);
    storage.saveData('activeTab', activeTab);
  }, [activeTab]);

  const addService = (type: 'whatsapp', customName?: string) => {
    const timestamp = Date.now();
    const serviceCount = services.filter(s => s.type === type || s.iconType === type).length + 1;
    
    const newService: ServiceTab = {
      id: `${type}-${timestamp}`,
      name: customName || `${type.charAt(0).toUpperCase() + type.slice(1)} ${serviceCount}`,
      type: 'whatsapp', // Keep type as whatsapp for compatibility, but use iconType for actual service
      iconType: type,
      partition: `${type}-${timestamp}`,
      workspaceId: activeWorkspace
    };

    console.log('➕ Adding new service to workspace:', activeWorkspace, newService);
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === activeWorkspace 
        ? { ...workspace, services: [...workspace.services, newService] }
        : workspace
    ));
    setActiveTab(newService.id);
    setShowServiceSelector(false);
    
    // Force re-render to show updated service count
    setTimeout(() => {
      console.log('✅ Service added successfully:', newService.name);
    }, 100);
  };

  const addWorkspace = (name: string) => {
    const timestamp = Date.now();
    const newWorkspace: Workspace = {
      id: `workspace-${timestamp}`,
      name: name.trim(),
      services: [],
      createdAt: timestamp
    };

    console.log('➕ Adding new workspace:', newWorkspace);
    setWorkspaces(prev => [...prev, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);
    setActiveTab('');
    setShowWorkspaceCreator(false);
  };

  const removeService = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🗑️ Removing service:', id);
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === activeWorkspace 
        ? { ...workspace, services: workspace.services.filter(service => service.id !== id) }
        : workspace
    ));
    
    if (activeTab === id) {
      const remainingServices = services.filter(s => s.id !== id);
      setActiveTab(remainingServices.length > 0 ? remainingServices[0].id : '');
    }
  };

  const reorderServices = (dragIndex: number, hoverIndex: number) => {
    console.log('🔄 Reordering services:', dragIndex, '->', hoverIndex);
    setWorkspaces(prev => prev.map(workspace => {
      if (workspace.id === activeWorkspace) {
        const newServices = [...workspace.services];
        const draggedService = newServices[dragIndex];
        newServices.splice(dragIndex, 1);
        newServices.splice(hoverIndex, 0, draggedService);
        return { ...workspace, services: newServices };
      }
      return workspace;
    }));
  };

  const removeWorkspace = (workspaceId: string) => {
    console.log('🗑️ Removing workspace:', workspaceId);
    setWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));
    
    if (activeWorkspace === workspaceId) {
      const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      if (remainingWorkspaces.length > 0) {
        setActiveWorkspace(remainingWorkspaces[0].id);
        setActiveTab(remainingWorkspaces[0].services.length > 0 ? remainingWorkspaces[0].services[0].id : '');
      } else {
        setActiveWorkspace('');
        setActiveTab('');
      }
    }
  };

  const renameService = (id: string, newName: string) => {
    console.log('✏️ Renaming service:', id, 'to:', newName);
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === activeWorkspace 
        ? { 
            ...workspace, 
            services: workspace.services.map(service => 
              service.id === id ? { ...service, name: newName } : service
            )
          }
        : workspace
    ));
  };

  const renameWorkspace = (workspaceId: string, newName: string) => {
    console.log('✏️ Renaming workspace:', workspaceId, 'to:', newName);
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === workspaceId ? { ...workspace, name: newName } : workspace
    ));
  };

  const toggleWorkspaceDetail = () => {
    setWorkspaceDetailVisible(!workspaceDetailVisible);
  };

  const handleToggleServiceStatus = (serviceId: string, enabled: boolean) => {
    setDisabledServices(prev => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
    
    // If disabling the currently active service, switch to another service or show welcome screen
    if (!enabled && activeTab === serviceId) {
      const remainingEnabledServices = services.filter(s => s.id !== serviceId && !disabledServices.has(s.id));
      if (remainingEnabledServices.length > 0) {
        setActiveTab(remainingEnabledServices[0].id);
      } else {
        setActiveTab('');
      }
    }
  };

  const handleReloadService = (serviceId: string) => {
    // Notify Electron to reload the service
    if (window.electronAPI?.reloadService) {
      window.electronAPI.reloadService(serviceId);
    }
  };

  const handleClearAllData = async () => {
    try {
      await storage.clearAll();
      setWorkspaces([]);
      setActiveWorkspace('');
      setActiveTab('');
      setNotificationsEnabled(true);
      setDisabledServices(new Set());
      console.log('🧹 All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
    }
  };

  const handleExportData = () => {
    const data = {
      workspaces,
      activeTab,
      activeWorkspace,
      sidebarCollapsed,
      isDarkMode,
      notificationsEnabled,
      disabledServices: Array.from(disabledServices),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `textnexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.workspaces) setWorkspaces(data.workspaces);
            if (data.activeWorkspace) setActiveWorkspace(data.activeWorkspace);
            if (data.activeTab) setActiveTab(data.activeTab);
            if (typeof data.sidebarCollapsed === 'boolean') setSidebarCollapsed(data.sidebarCollapsed);
            if (typeof data.isDarkMode === 'boolean') setIsDarkMode(data.isDarkMode);
            if (typeof data.notificationsEnabled === 'boolean') setNotificationsEnabled(data.notificationsEnabled);
            if (data.disabledServices && Array.isArray(data.disabledServices)) {
              setDisabledServices(new Set(data.disabledServices));
            }
            console.log('📥 Data imported successfully');
          } catch (error) {
            console.error('❌ Error importing data:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Show loading screen while theme is being loaded
  if (!themeLoaded || isDarkMode === null) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="./3.png" 
            alt="TextNexus Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              marginBottom: '16px',
              borderRadius: '16px'
            }} 
          />
          <Text style={{ fontSize: '16px', color: '#595959' }}>Loading TextNexus...</Text>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgContainer: isDarkMode ? '#000' : '#fff',
          colorBgElevated: isDarkMode ? '#141414' : '#fff',
          colorBgLayout: isDarkMode ? '#000' : '#f0f2f5',
          colorText: isDarkMode ? '#fff' : 'rgba(0, 0, 0, 0.88)',
          colorTextSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.45)',
          colorBorder: isDarkMode ? '#424242' : '#d9d9d9',
          colorSplit: isDarkMode ? '#424242' : '#f0f0f0'
        },
      }}
    >
      <Layout style={{ height: '100vh', background: isDarkMode ? '#000' : '#f0f2f5' }}>
        {/* Left Sidebar - Workspace Icons */}
        <Sider 
          width={70}
          collapsedWidth={70}
          style={{ 
            background: isDarkMode ? '#000' : '#fff',
            borderRight: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            zIndex: 100
          }}
        >
          <WorkspaceIconSidebar
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onWorkspaceClick={(id) => {
              setActiveWorkspace(id);
              if (!workspaceDetailVisible) {
                setWorkspaceDetailVisible(true);
              }
            }}
            onAddWorkspace={() => setShowWorkspaceCreator(true)}
            onToggleDetail={toggleWorkspaceDetail}
            workspaceDetailVisible={workspaceDetailVisible}
            isDarkMode={isDarkMode}
            onShowSettings={() => setShowSettings(true)}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={setNotificationsEnabled}
            services={services}
            activeTab={activeTab}
            onServiceClick={setActiveTab}
            onAddService={() => setShowServiceSelector(true)}
            onRemoveService={removeService}
            onRenameService={renameService}
            onReorderServices={reorderServices}
            disabledServices={disabledServices}
            onToggleServiceStatus={handleToggleServiceStatus}
            onReloadService={handleReloadService}
          />
        </Sider>

        {/* Right Sidebar - Workspace Details */}
        {workspaceDetailVisible && (
          <Sider 
            width={300}
            collapsedWidth={0}
            style={{ 
              background: isDarkMode ? '#000' : '#fff',
              borderRight: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 99
            }}
          >
            <WorkspaceDetailSidebar
              workspaces={workspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceClick={setActiveWorkspace}
              onAddWorkspace={() => setShowWorkspaceCreator(true)}
              onRemoveWorkspace={removeWorkspace}
              onRenameWorkspace={renameWorkspace}
              services={services}
              activeTab={activeTab}
              onServiceClick={setActiveTab}
              onAddService={() => setShowServiceSelector(true)}
              onRemoveService={removeService}
              onRenameService={renameService}
              isDarkMode={isDarkMode}
              onClose={() => setWorkspaceDetailVisible(false)}
              onReorderServices={reorderServices}
            />
          </Sider>
        )}

        {/* Main Content */}
        <Content style={{ 
          background: isDarkMode ? '#000' : '#fff', 
          position: 'relative',
          overflow: 'hidden',
          marginLeft: 0
        }}>

          {workspaces.length === 0 || services.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: isDarkMode 
                ? 'radial-gradient(circle at center, #141414 0%, #000 100%)'
                : 'radial-gradient(circle at center, #fafafa 0%, #f0f2f5 100%)'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px',
                borderRadius: '16px',
                background: isDarkMode ? '#141414' : '#fff',
                boxShadow: isDarkMode 
                  ? '0 8px 32px rgba(0,0,0,0.3)' 
                  : '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`
              }}>
                <div style={{
                  marginBottom: '24px'
                }}>
                  <img 
                    src="./3.png"
                    alt="TextNexus Logo" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '20px'
                    }} 
                  />
                </div>
                <Text style={{ 
                  fontSize: '24px', 
                  display: 'block', 
                  marginBottom: '12px',
                  fontWeight: 600,
                  color: isDarkMode ? '#fff' : '#262626'
                }}>
                  Welcome to TextNexus
                </Text>
                <Text type="secondary" style={{ 
                  fontSize: '16px',
                  display: 'block',
                  marginBottom: '32px',
                  maxWidth: '400px'
                }}>
                  {workspaces.length === 0 ? 'Create your first workspace to get started.' : 'Add messaging services to this workspace.'}
                  Start by adding your first service below.
                </Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => workspaces.length === 0 ? setShowWorkspaceCreator(true) : setShowServiceSelector(true)}
                  style={{
                    height: '48px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    fontSize: '16px',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(24, 144, 255, 0.3)'
                  }}
                >
                  {workspaces.length === 0 ? 'Create First Workspace' : 'Add Your First Service'}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%' }}>
              {Array.from(serviceComponents.values()).map((component, index) => (
                <div 
                  key={services[index]?.id || index}
                  style={{ 
                    height: '100%',
                    display: activeTab === services[index]?.id ? 'block' : 'none',
                    position: 'relative'
                  }}
                >
                  {disabledServices.has(services[index]?.id || '') ? (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDarkMode ? '#000' : '#fff',
                      flexDirection: 'column'
                    }}>
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        borderRadius: '16px',
                        background: isDarkMode ? '#141414' : '#f9f9f9',
                        border: `2px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                          🚫
                        </div>
                        <Text style={{ 
                          fontSize: '18px', 
                          display: 'block', 
                          marginBottom: '8px',
                          color: isDarkMode ? '#fff' : '#262626'
                        }}>
                          Service Disabled
                        </Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {services[index]?.name} is currently disabled.
                          <br />
                          Right-click on the service icon to enable it.
                        </Text>
                        <div style={{ marginTop: '16px' }}>
                          <Button 
                            type="primary"
                            onClick={() => handleToggleServiceStatus(services[index]?.id || '', true)}
                            style={{
                              background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                              border: 'none'
                            }}
                          >
                            Enable Service
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    component
                  )}
                </div>
              ))}
            </div>
          )}
        </Content>

        <ServiceSelector 
          visible={showServiceSelector}
          onClose={() => setShowServiceSelector(false)}
          onSelectService={addService}
          isDarkMode={isDarkMode}
        />

        <WorkspaceCreator 
          visible={showWorkspaceCreator}
          onClose={() => setShowWorkspaceCreator(false)}
          onCreateWorkspace={addWorkspace}
          isDarkMode={isDarkMode}
        />

        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={setNotificationsEnabled}
          services={services}
          activeTab={activeTab}
          onServiceClick={setActiveTab}
          onAddService={() => setShowServiceSelector(true)}
          onClearAllData={handleClearAllData}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      </Layout>
    </ConfigProvider>
  );
}

export default App;