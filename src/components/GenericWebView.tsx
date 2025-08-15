import React, { useRef, useEffect, useState } from 'react';
import { Spin, Alert, Space, Typography, Button } from 'antd';
import { ReloadOutlined, GlobalOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';

const { Title, Text } = Typography;

interface ServiceTab {
  id: string;
  name: string;
  type: 'whatsapp';
  iconType: string;
  partition: string;
  workspaceId: string;
}

interface GenericWebViewProps {
  service: ServiceTab;
  isDarkMode: boolean;
}

// Service URLs mapping
const serviceUrls: { [key: string]: string } = {
  gmail: 'https://mail.google.com',
  messenger: 'https://www.messenger.com',
  slack: 'https://slack.com',
  telegram: 'https://web.telegram.org',
  discord: 'https://discord.com/app',
  skype: 'https://web.skype.com',
  teams: 'https://teams.microsoft.com',
  facebook: 'https://www.facebook.com',
  instagram: 'https://www.instagram.com',
  twitter: 'https://twitter.com',
  linkedin: 'https://www.linkedin.com',
  github: 'https://github.com',
  'google-calendar': 'https://calendar.google.com',
  'google-drive': 'https://drive.google.com',
  notion: 'https://www.notion.so',
  trello: 'https://trello.com',
  spotify: 'https://open.spotify.com',
  zoom: 'https://zoom.us',
  netflix: 'https://www.netflix.com',
  youtube: 'https://www.youtube.com',
  tiktok: 'https://www.tiktok.com',
  reddit: 'https://www.reddit.com'
};

// Service colors mapping
const serviceColors: { [key: string]: string } = {
  gmail: '#EA4335',
  messenger: '#0084FF',
  slack: '#4A154B',
  telegram: '#0088CC',
  discord: '#5865F2',
  skype: '#00AFF0',
  teams: '#6264A7',
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  github: '#181717',
  'google-calendar': '#4285F4',
  'google-drive': '#4285F4',
  notion: '#000000',
  trello: '#0079BF',
  spotify: '#1DB954',
  zoom: '#2D8CFF'
};

// Extend the webview element type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        partition?: string;
        useragent?: string;
        preload?: string;
        nodeintegration?: string;
        webpreferences?: string;
        allowpopups?: string;
        disablewebsecurity?: string;
      };
    }
  }
}

const GenericWebView: React.FC<GenericWebViewProps> = ({ service, isDarkMode }) => {
  const webviewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webviewReady, setWebviewReady] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userAgent, setUserAgent] = useState<string>('');

  const serviceUrl = serviceUrls[service.iconType] || 'https://www.google.com';
  const serviceColor = serviceColors[service.iconType] || '#1890ff';

  // Listen for Electron events
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for service reload events
      const handleReloadService = (event: any, serviceId: string) => {
        if (serviceId === service.partition) {
          handleReload();
        }
      };

      // Listen for service toggle events
      const handleToggleService = (event: any, serviceId: string, enabled: boolean) => {
        if (serviceId === service.partition) {
          console.log('Service toggled:', serviceId, enabled);
        }
      };

      // Listen for notification toggle events
      const handleToggleNotifications = (event: any, serviceId: string, enabled: boolean) => {
        if (serviceId === service.partition) {
          setNotificationsEnabled(enabled);
          console.log('Notifications toggled for service:', serviceId, enabled);
        }
      };

      window.electronAPI.onReloadService(handleReloadService);
      window.electronAPI.onToggleService(handleToggleService);
      window.electronAPI.onToggleServiceNotifications(handleToggleNotifications);

      return () => {
        // Cleanup listeners if needed
      };
    }
  }, [service.partition]);

  // Load session data on mount
  useEffect(() => {
    const loadUserAgent = async () => {
      try {
        if (window.electronAPI?.getUserAgent) {
          const ua = await window.electronAPI.getUserAgent(service.iconType);
          setUserAgent(ua);
          console.log('🔧 User Agent loaded for', service.iconType, ':', ua);
        } else {
          // Fallback user agent
          setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15');
        }
      } catch (error) {
        console.error('❌ Error loading user agent:', error);
        setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15');
      }
    };
    
    const loadSessionData = async () => {
      try {
        const data = await storage.loadData(`session-${service.partition}`);
        if (data) {
          console.log('📱 Session data loaded for:', service.partition);
        }
      } catch (error) {
        console.error('❌ Error loading session data:', error);
      }
    };
    
    loadUserAgent();
    loadSessionData();
  }, [service.partition]);

  // Save session data periodically
  useEffect(() => {
    const saveSessionData = async () => {
      if (webviewRef.current && webviewReady) {
        try {
          const sessionInfo = {
            partition: service.partition,
            serviceName: service.name,
            serviceType: service.iconType,
            lastAccessed: Date.now(),
            url: serviceUrl
          };
          
          await storage.saveData(`session-${service.partition}`, sessionInfo);
          console.log('💾 Session data saved for:', service.partition);
        } catch (error) {
          console.error('❌ Error saving session data:', error);
        }
      }
    };

    const interval = setInterval(saveSessionData, 30000);
    
    return () => {
      clearInterval(interval);
      saveSessionData();
    };
  }, [service.partition, service.name, service.iconType, serviceUrl, webviewReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!webviewReady) {
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [webviewReady]);

  const handleReload = () => {
    setLoading(true);
    setError(false);
    setWebviewReady(false);
    
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  useEffect(() => {
    if (webviewRef.current) {
      const webview = webviewRef.current;
      
      webview.setAttribute('src', serviceUrl);
      webview.setAttribute('useragent', userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15');
      webview.setAttribute('partition', `persist:${service.partition}`);
      webview.setAttribute('allowpopups', 'true');
      webview.setAttribute('disablewebsecurity', 'true');
      webview.setAttribute('webpreferences', 'contextIsolation=false,nodeIntegration=false,webSecurity=false,allowRunningInsecureContent=true');
      
      const handleDomReady = () => {
        console.log('WebView DOM ready for:', service.name);
        setWebviewReady(true);
        setLoading(false);
        setError(false);
        
        // Inject basic CSS for better display
        webview.insertCSS(`
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        `);
        
        // Add notification monitoring for generic services
        webview.executeJavaScript(`
          (function() {
            // Prevent multiple instances
            let isMonitoring = false;
            let notificationQueue = [];
            let isProcessingQueue = false;
            
            if (isMonitoring) return;
            isMonitoring = true;
            
            console.log('🔔 Starting notification monitoring for: ${service.name}');
            
            // Enhanced notification function
            function sendNotification(title, body, serviceType) {
              try {
                if (window.electronAPI && window.electronAPI.showNotification) {
                  const notificationData = {
                    serviceId: '${service.partition}',
                    serviceName: '${service.name}',
                    serviceType: '${service.iconType}',
                    title: title || '${service.name}',
                    body: body || 'New activity in ${service.name}',
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png'
                  };
                  
                  console.log('📱 Sending notification:', notificationData);
                  
                  return window.electronAPI.showNotification(notificationData)
                    .then(result => {
                      console.log('✅ Notification sent successfully:', result);
                      return result;
                    })
                    .catch(error => {
                      console.error('❌ Notification error:', error);
                      return false;
                    });
                } else {
                  console.warn('⚠️ Electron API not available for notifications');
                  return Promise.resolve(false);
                }
              } catch (error) {
                console.error('❌ Error in sendNotification:', error);
                return Promise.resolve(false);
              }
            }
            
            // Process notification queue
            function processNotificationQueue() {
              if (isProcessingQueue || notificationQueue.length === 0) return;
              
              isProcessingQueue = true;
              const notification = notificationQueue.shift();
              
              sendNotification(notification.title, notification.body, '${service.iconType}')
                .finally(() => {
                  isProcessingQueue = false;
                  setTimeout(processNotificationQueue, 1000);
                });
            }
            
            // Add notification to queue
            function queueNotification(title, body) {
              notificationQueue.push({ title, body });
              processNotificationQueue();
            }
            
            // Monitor for title changes (common notification indicator)
            let originalTitle = document.title;
            
            const checkForNotifications = () => {
              try {
                const currentTitle = document.title;
                
                // Check if title indicates new messages (common patterns)
                if (currentTitle !== originalTitle && 
                    (currentTitle.includes('(') || 
                     currentTitle.includes('•') || 
                     currentTitle.includes('*') ||
                     currentTitle.match(/\\d+/) ||
                     currentTitle.toLowerCase().includes('new') ||
                     currentTitle.toLowerCase().includes('message'))) {
                  
                  console.log('📨 Notification detected via title change:', currentTitle);
                  
                  // Extract notification count if present
                  const countMatch = currentTitle.match(/\\((\\d+)\\)/);
                  const count = countMatch ? countMatch[1] : '1';
                  
                  const notificationTitle = '${service.name} - New Activity';
                  const notificationBody = count === '1' 
                    ? 'New activity'
                    : \`\${count} new notifications\`;
                  
                  queueNotification(notificationTitle, notificationBody);
                  
                  originalTitle = currentTitle;
                }
              } catch (error) {
                console.error('❌ Notification monitoring error:', error);
              }
            };
            
            // Enhanced monitoring with multiple methods
            setInterval(checkForNotifications, 2000);
            
            // Monitor DOM changes for notification indicators
            const observer = new MutationObserver(() => {
              setTimeout(checkForNotifications, 500);
            });
            
            // Observe title changes
            const titleElement = document.querySelector('title');
            if (titleElement) {
              observer.observe(titleElement, {
                childList: true,
                characterData: true
              });
            }
            
            // Also observe common notification areas
            const notificationAreas = document.querySelectorAll(
              '.notification, .badge, .counter, [class*="notification"], [class*="badge"], [class*="counter"]'
            );
            
            notificationAreas.forEach(area => {
              observer.observe(area, {
                childList: true,
                characterData: true,
                attributes: true
              });
            });
            
            // Also check on visibility change
            document.addEventListener('visibilitychange', () => {
              if (!document.hidden) {
                // Reset title when tab becomes visible
                setTimeout(() => {
                  originalTitle = document.title;
                  // Clear notification queue when tab becomes visible
                  notificationQueue.length = 0;
                }, 1000);
              }
            });
            
            // Enhanced error handling
            window.addEventListener('error', (e) => {
              console.error('❌ Service error:', e.error);
            });
            
            console.log('✅ Enhanced notification system initialized for ${service.name}');
          })();
        `).catch(error => {
          console.error('❌ Error injecting service script:', error);
        });
      };
      
      const handleDidFailLoad = () => {
        console.log('WebView failed to load:', service.name);
        setLoading(false);
        setError(true);
      };
      
      const handleDidFinishLoad = () => {
        console.log('WebView finished loading:', service.name);
      };
      
      webview.addEventListener('dom-ready', handleDomReady);
      webview.addEventListener('did-fail-load', handleDidFailLoad);
      webview.addEventListener('did-finish-load', handleDidFinishLoad);
      
      return () => {
        webview.removeEventListener('dom-ready', handleDomReady);
        webview.removeEventListener('did-fail-load', handleDidFailLoad);
        webview.removeEventListener('did-finish-load', handleDidFinishLoad);
      };
    }
  }, [service.partition, service.name, serviceUrl]);

  const openInNewTab = () => {
    window.open(serviceUrl, '_blank');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div 
        style={{ 
          padding: '12px 16px', 
          borderBottom: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
          background: `linear-gradient(135deg, ${serviceColor}, ${serviceColor}CC)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          height: '60px'
        }}
      >
        <Space>
          <GlobalOutlined style={{ color: 'white', fontSize: '20px' }} />
          <Title level={5} style={{ margin: 0, color: 'white' }}>{service.name}</Title>
        </Space>
        <Space>
          <Button 
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleReload}
            loading={loading}
            style={{ borderColor: 'white', color: 'white' }}
          >
            Reload
          </Button>
        </Space>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        background: isDarkMode ? '#000' : '#fff',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode ? '#000' : '#fff',
            zIndex: 1000
          }}>
            <Space direction="vertical" size="large" style={{ textAlign: 'center' }}>
              <div className="loading-pulse">
                <GlobalOutlined style={{ fontSize: '64px', color: serviceColor }} />
              </div>
              <div>
                <Title level={4}>Loading {service.name}</Title>
                <Text type="secondary">Please wait while we load the service...</Text>
              </div>
              <Spin size="large" />
            </Space>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkMode ? '#000' : '#fff',
            zIndex: 1000,
            padding: '20px'
          }}>
            <Alert
              message={`${service.name} Loading Issue`}
              description={
                <div>
                  <p>There was an issue loading {service.name}.</p>
                  <p>Please try reloading or open in a new browser tab.</p>
                </div>
              }
              type="warning"
              showIcon
              action={
                <Space direction="vertical">
                  <Button type="primary" onClick={openInNewTab}>
                    Open in Browser
                  </Button>
                  <Button onClick={handleReload}>
                    Try Again
                  </Button>
                </Space>
              }
            />
          </div>
        )}

        <webview
          ref={webviewRef}
          src={serviceUrl}
          style={{
            width: '100%',
            height: '100%',
            display: loading || error ? 'none' : 'flex',
            border: 'none',
            outline: 'none',
            flex: 1
          }}
          useragent={userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"}
          partition={`persist:${service.partition}`}
          allowpopups="true"
          webpreferences="contextIsolation=false,nodeIntegration=false,webSecurity=false,allowRunningInsecureContent=true"
          disablewebsecurity="true"
        />
      </div>

      {/* Info Bar */}
      <div style={{ 
        padding: '8px 16px', 
        borderTop: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
        background: isDarkMode ? '#141414' : '#f0f2f5',
        fontSize: '12px',
        flexShrink: 0,
        height: '40px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Text type="secondary">
          {service.name} - Web Application
        </Text>
      </div>
    </div>
  );
};

export default GenericWebView;