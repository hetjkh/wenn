import React, { useRef, useEffect, useState } from 'react';
import { Spin, Alert, Space, Typography, Button } from 'antd';
import { ReloadOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { storage } from '../utils/storage';

const { Title, Text } = Typography;

interface WhatsAppViewProps {
  partition: string;
  serviceName: string;
  isDarkMode: boolean;
  isActive?: boolean;
}

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

const WhatsAppView: React.FC<WhatsAppViewProps> = ({ partition, serviceName, isDarkMode, isActive = true }) => {
  const webviewRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webviewReady, setWebviewReady] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [userAgent, setUserAgent] = useState<string>('');

  // Listen for Electron events
  useEffect(() => {
    if (window.electronAPI) {
      // Listen for service reload events
      const handleReloadService = (event: any, serviceId: string) => {
        if (serviceId === partition) {
          handleReload();
        }
      };

      // Listen for service toggle events
      const handleToggleService = (event: any, serviceId: string, enabled: boolean) => {
        if (serviceId === partition) {
          console.log('Service toggled:', serviceId, enabled);
          // You can add logic here to show/hide the webview
        }
      };

      // Listen for notification toggle events
      const handleToggleNotifications = (event: any, serviceId: string, enabled: boolean) => {
        if (serviceId === partition) {
          setNotificationsEnabled(enabled);
          console.log('Notifications toggled for service:', serviceId, enabled);
        }
      };

      // Listen for reply events from notifications
      const handleSendReply = (event: any, serviceId: string, replyText: string) => {
        if (serviceId === partition && webviewRef.current) {
          console.log('Sending reply:', replyText);
          
          // Inject reply into WhatsApp Web
          webviewRef.current.executeJavaScript(`
            (function() {
              try {
                // Find the message input field
                const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]') ||
                                   document.querySelector('[contenteditable="true"][data-tab="10"]') ||
                                   document.querySelector('div[contenteditable="true"]');
                
                if (messageInput) {
                  // Set the reply text
                  messageInput.focus();
                  messageInput.classList.add('reply-highlight');
                  messageInput.innerHTML = '${replyText.replace(/'/g, "\\'")}';
                  
                  // Trigger input event
                  const inputEvent = new Event('input', { bubbles: true });
                  messageInput.dispatchEvent(inputEvent);
                  
                  // Find and click send button
                  setTimeout(() => {
                    const sendButton = document.querySelector('[data-testid="send"]') ||
                                     document.querySelector('button[aria-label="Send"]') ||
                                     document.querySelector('span[data-testid="send"]');
                    
                    if (sendButton) {
                      sendButton.click();
                      console.log('Reply sent successfully');
                      
                      // Remove highlight after sending
                      setTimeout(() => {
                        messageInput.classList.remove('reply-highlight');
                      }, 1000);
                    } else {
                      // Try keyboard shortcut as fallback
                      const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                      });
                      messageInput.dispatchEvent(enterEvent);
                      
                      // Remove highlight after sending
                      setTimeout(() => {
                        messageInput.classList.remove('reply-highlight');
                      }, 1000);
                    }
                  }, 100);
                } else {
                  console.log('Message input not found');
                }
              } catch (error) {
                console.error('Error sending reply:', error);
              }
            })();
          `);
        }
      };
      window.electronAPI.onReloadService(handleReloadService);
      window.electronAPI.onToggleService(handleToggleService);
      window.electronAPI.onToggleServiceNotifications(handleToggleNotifications);
      
      // Add reply listener
      if (window.electronAPI.onSendReply) {
        window.electronAPI.onSendReply(handleSendReply);
      }

      return () => {
        // Cleanup listeners if needed
      };
    }
  }, [partition]);

  // Load session data on mount
  useEffect(() => {
    const loadUserAgent = async () => {
      try {
        if (window.electronAPI?.getWhatsAppUserAgent) {
          const ua = await window.electronAPI.getWhatsAppUserAgent();
          setUserAgent(ua);
          console.log('🔧 WhatsApp User Agent loaded:', ua);
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
        const data = await storage.loadData(`session-${partition}`);
        if (data) {
          setSessionData(data);
          console.log('📱 Session data loaded for:', partition);
        }
      } catch (error) {
        console.error('❌ Error loading session data:', error);
      }
    };
    
    loadUserAgent();
    loadSessionData();
  }, [partition]);

  // Save session data periodically
  useEffect(() => {
    const saveSessionData = async () => {
      if (webviewRef.current && webviewReady) {
        try {
          // Save session info
          const sessionInfo = {
            partition,
            serviceName,
            lastAccessed: Date.now(),
            url: 'https://web.whatsapp.com/'
          };
          
          await storage.saveData(`session-${partition}`, sessionInfo);
          console.log('💾 Session data saved for:', partition);
        } catch (error) {
          console.error('❌ Error saving session data:', error);
        }
      }
    };

    // Save session data every 30 seconds
    const interval = setInterval(saveSessionData, 30000);
    
    // Save on unmount
    return () => {
      clearInterval(interval);
      saveSessionData();
    };
  }, [partition, serviceName, webviewReady]);

  useEffect(() => {
    // Only start timer if this service is active
    if (isActive) {
      const timer = setTimeout(() => {
        if (!webviewReady) {
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [webviewReady, isActive]);

  const handleReload = () => {
    setLoading(true);
    setError(false);
    setWebviewReady(false);
    setHasInitialized(false);
    
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  useEffect(() => {
    // Only initialize webview when it becomes active for the first time
    if (webviewRef.current && isActive && !hasInitialized) {
      const webview = webviewRef.current;
      
      // Set attributes before adding event listeners
      webview.setAttribute('src', 'https://web.whatsapp.com/');
      webview.setAttribute('useragent', userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15');
      webview.setAttribute('partition', `persist:${partition}`);
      webview.setAttribute('allowpopups', 'true');
      webview.setAttribute('disablewebsecurity', 'true');
      webview.setAttribute('webpreferences', 'contextIsolation=false,nodeIntegration=false,webSecurity=false,allowRunningInsecureContent=true');
      
      const handleDomReady = () => {
        console.log('WebView DOM ready');
        console.log('Using partition:', partition);
        setWebviewReady(true);
        setLoading(false);
        setError(false);
        setHasInitialized(true);
        
        // Inject CSS to fix WhatsApp Web display
        webview.insertCSS(`
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          
          #app {
            height: 100vh !important;
            width: 100vw !important;
          }
          
          ._2Ts6i {
            height: 100vh !important;
          }
          
          /* Hide download prompts */
          [data-testid="download-prompt"],
          .download-prompt,
          ._3q4NP {
            display: none !important;
          }
          
          /* Ensure main container takes full space */
          ._2Ts6i ._1jJ70 {
            height: 100vh !important;
          }
          
          /* Add highlight for reply messages */
          .reply-highlight {
            background: #e3f2fd !important;
            border: 2px solid #2196f3 !important;
            border-radius: 8px !important;
          }
        `);
        
        // Execute JavaScript to ensure proper initialization
        webview.executeJavaScript(`
          (function() {
            // Prevent multiple instances
            let lastMessageCount = 0;
            let isMonitoring = false;
            let notificationQueue = [];
            let isProcessingQueue = false;
            
            if (isMonitoring) return; // Prevent multiple instances
            isMonitoring = true;
            
            console.log('🔔 Starting WhatsApp notification monitoring for: ${serviceName}');
            
            // Enhanced notification function with better error handling
            function sendNotification(title, body, senderName, serviceType) {
              try {
                if (window.electronAPI && window.electronAPI.showNotification) {
                  const notificationData = {
                    serviceId: '${partition}',
                    serviceName: '${serviceName}',
                    serviceType: serviceType || 'whatsapp',
                    title: title || 'New Message',
                    body: body || 'You have a new message',
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
                    senderName: senderName || 'Unknown Contact'
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
            
            // Process notification queue to avoid spam
            function processNotificationQueue() {
              if (isProcessingQueue || notificationQueue.length === 0) return;
              
              isProcessingQueue = true;
              const notification = notificationQueue.shift();
              
              sendNotification(notification.title, notification.body, notification.senderName, notification.serviceType)
                .finally(() => {
                  isProcessingQueue = false;
                  // Process next notification after delay
                  setTimeout(processNotificationQueue, 1000);
                });
            }
            
            // Add notification to queue
            function queueNotification(title, body, senderName, serviceType) {
              notificationQueue.push({ title, body, senderName, serviceType });
              processNotificationQueue();
            }
            
            function checkForNewMessages() {
              try {
                // Enhanced message detection
                const messageElements = document.querySelectorAll(
                  '[data-testid="msg-container"], ' +
                  '.message-in, ' +
                  '.message-out, ' +
                  '[data-testid="conversation-panel-messages"] > div > div, ' +
                  '._3_7SH'
                );
                const currentMessageCount = messageElements.length;
                
                if (currentMessageCount > lastMessageCount && lastMessageCount > 0) {
                  console.log('📨 New message detected! Count:', currentMessageCount, 'Previous:', lastMessageCount);
                  
                  // Get the latest messages (could be multiple new messages)
                  const newMessageCount = currentMessageCount - lastMessageCount;
                  const newMessages = Array.from(messageElements).slice(-newMessageCount);
                  
                  newMessages.forEach((messageElement, index) => {
                    try {
                      // Extract message text with multiple selectors
                      const messageTextEl = messageElement.querySelector(
                        '[data-testid="conversation-text"], ' +
                        '.copyable-text, ' +
                        'span[dir="ltr"], ' +
                        '._11JPr, ' +
                        '.selectable-text, ' +
                        '._3Whw5'
                      );
                      
                      let messageText = 'New message received';
                      if (messageTextEl) {
                        messageText = messageTextEl.textContent || messageTextEl.innerText || 'New message received';
                      }
                      
                      // Get sender name with enhanced detection
                      let senderName = '${serviceName}';
                      
                      // Try multiple methods to get sender name
                      const chatHeaderSelectors = [
                        '[data-testid="conversation-info-header"] span[title]',
                        '[data-testid="conversation-info-header"] span',
                        '._3ko75 span[title]',
                        '._3ko75 span',
                        '.chat-title',
                        '._19vo_ span'
                      ];
                      
                      for (const selector of chatHeaderSelectors) {
                        const headerEl = document.querySelector(selector);
                        if (headerEl) {
                          const name = headerEl.textContent || headerEl.getAttribute('title');
                          if (name && name.trim() && !name.includes('WhatsApp')) {
                            senderName = name.trim();
                            break;
                          }
                        }
                      }
                      
                      // If still no sender name, try to get from message bubble
                      if (senderName === '${serviceName}') {
                        const messageSenderEl = messageElement.querySelector(
                          '._3DFk6, ' +
                          '.message-author, ' +
                          '._2_1wd, ' +
                          '[data-testid="author"]'
                        );
                        if (messageSenderEl) {
                          const name = messageSenderEl.textContent || messageSenderEl.innerText;
                          if (name && name.trim()) {
                            senderName = name.trim();
                          }
                        }
                      }
                      
                      // Clean message text
                      messageText = messageText.replace(/\\n/g, ' ').trim();
                      if (messageText.length > 100) {
                        messageText = messageText.substring(0, 100) + '...';
                      }
                      
                      // Create notification title with service name and sender
                      const notificationTitle = senderName === '${serviceName}' 
                        ? '${serviceName}'
                        : senderName;
                      
                      console.log('📱 Preparing notification:', {
                        title: notificationTitle,
                        body: messageText,
                        sender: senderName,
                        service: '${serviceName}',
                        serviceId: '${partition}'
                      });
                      
                      // Queue notification with delay for multiple messages
                      setTimeout(() => {
                        queueNotification(notificationTitle, messageText, senderName, 'whatsapp');
                      }, index * 500); // Stagger multiple notifications
                    
                    } catch (messageError) {
                      console.error('❌ Error processing message:', messageError);
                    }
                  });
                }
                
                lastMessageCount = currentMessageCount;
              } catch (error) {
                console.error('❌ Notification monitoring error:', error);
              }
            }
            
            // Enhanced DOM observer
            const observer = new MutationObserver(function(mutations) {
              let hasNewMessages = false;
              let shouldCheck = false;
              
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                      // Check for new message containers
                      if (node.matches && (
                          node.matches('[data-testid="msg-container"]') ||
                          node.matches('.message-in') ||
                          node.matches('.message-out') ||
                          node.matches('._3_7SH') ||
                          (node.querySelector && node.querySelector('[data-testid="msg-container"], .message-in, .message-out, ._3_7SH'))
                      )) {
                        hasNewMessages = true;
                      }
                      
                      // Also check for text changes that might indicate new messages
                      if (node.matches && (
                          node.matches('[data-testid="conversation-text"]') ||
                          node.matches('.copyable-text') ||
                          node.matches('.selectable-text')
                      )) {
                        shouldCheck = true;
                      }
                    }
                  });
                }
                
                // Check for text content changes
                if (mutation.type === 'characterData' || mutation.type === 'attributes') {
                  shouldCheck = true;
                }
              });
              
              if (hasNewMessages) {
                console.log('👀 DOM observer detected new messages');
                setTimeout(checkForNewMessages, 500);
              } else if (shouldCheck) {
                setTimeout(checkForNewMessages, 1000);
              }
            });
            
            // Observe with enhanced options
            const observeTarget = document.querySelector('[data-testid="conversation-panel-messages"]') || 
                                document.querySelector('#main') || 
                                document.querySelector('#app') ||
                                document.body;
            
            if (observeTarget) {
              observer.observe(observeTarget, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: false
              });
              console.log('👀 Enhanced observer attached to:', observeTarget.tagName);
            } else {
              console.warn('⚠️ Could not find suitable container to observe');
            }
            
            // Initial check after page load
            setTimeout(() => {
              console.log('🔍 Initial message check for ${serviceName}');
              checkForNewMessages();
            }, 3000);
            
            // Periodic check as backup
            setInterval(checkForNewMessages, 5000);
            
            // Enhanced title monitoring
            let originalTitle = document.title;
            const titleObserver = new MutationObserver(() => {
              const currentTitle = document.title;
              if (currentTitle !== originalTitle) {
                console.log('📱 Title change detected:', currentTitle);
                if (currentTitle.includes('(') || currentTitle.includes('•') || /\\d+/.test(currentTitle)) {
                  setTimeout(checkForNewMessages, 500);
                }
                originalTitle = document.title;
              }
            });
            
            // Observe title changes
            titleObserver.observe(document.querySelector('title') || document.head, {
              childList: true,
              characterData: true,
              subtree: true
            });
            
            // Listen for visibility changes
            document.addEventListener('visibilitychange', () => {
              if (document.hidden) {
                console.log('📱 ${serviceName} tab hidden, notifications enabled');
              } else {
                console.log('📱 ${serviceName} tab visible, notifications may be disabled');
                // Clear notification queue when tab becomes visible
                notificationQueue.length = 0;
              }
            });
            
            // Enhanced error handling
            window.addEventListener('error', (e) => {
              console.error('❌ WhatsApp Web error:', e.error);
            });
            
            window.addEventListener('unhandledrejection', (e) => {
              console.error('❌ WhatsApp Web unhandled rejection:', e.reason);
            });
            
            console.log('✅ Enhanced WhatsApp notification system initialized for ${serviceName}');
          })();
        `).catch(error => {
          console.error('❌ Error injecting WhatsApp script:', error);
        });
      };
      
      const handleDidFailLoad = () => {
        console.log('WebView failed to load');
        setLoading(false);
        setError(true);
      };
      
      const handleDidFinishLoad = () => {
        console.log('WebView finished loading');
        // Additional check after load
        setTimeout(() => {
          webview.executeJavaScript(`
            // Check if we're on the right page
            if (document.body.innerHTML.includes('Download WhatsApp') || 
                document.body.innerHTML.includes('Get WhatsApp Desktop')) {
              window.location.href = 'https://web.whatsapp.com/';
            }
          `);
        }, 2000);
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
  }, [partition, isActive, hasInitialized]);

  // Handle visibility changes for performance
  useEffect(() => {
    if (webviewRef.current && hasInitialized) {
      const webview = webviewRef.current;
      
      if (isActive) {
        // Show webview and resume if needed
        webview.style.display = 'flex';
        
        // Focus the webview when it becomes active
        setTimeout(() => {
          try {
            webview.focus();
          } catch (error) {
            console.log('Could not focus webview:', error);
          }
        }, 100);
      } else {
        // Hide webview but keep it loaded
        webview.style.display = 'none';
      }
    }
  }, [isActive, hasInitialized]);

  const openInNewTab = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div 
        style={{ 
          padding: '12px 16px', 
          borderBottom: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          height: '60px'
        }} 
        className="whatsapp-header"
      >
        <Space>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
            alt="WhatsApp" 
            style={{ width: '24px', height: '24px' }}
          />
          <Title level={5} style={{ margin: 0, color: 'white' }}>{serviceName}</Title>
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
        {loading && isActive && (
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
                <WhatsAppOutlined style={{ fontSize: '64px', color: '#25D366' }} />
              </div>
              <div>
                <Title level={4}>Loading WhatsApp Web</Title>
                <Text type="secondary">Please wait while we load your messages...</Text>
              </div>
              <Spin size="large" />
            </Space>
          </div>
        )}

        {error && isActive && (
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
              message="WhatsApp Web Loading Issue"
              description={
                <div>
                  <p>There was an issue loading WhatsApp Web.</p>
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
          src="https://web.whatsapp.com/"
          style={{
            width: '100%',
            height: '100%',
            display: (loading || error) && isActive ? 'none' : 'flex',
            border: 'none',
            outline: 'none',
            flex: 1
          }}
          useragent={userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15"}
          partition={`persist:${partition}`}
          allowpopups="true"
          webpreferences="contextIsolation=false,nodeIntegration=false,webSecurity=false,allowRunningInsecureContent=true"
          disablewebsecurity="true"
        />
      </div>

      {/* Info Bar */}
      {isActive && (
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
            Scan the QR code with your phone to connect your WhatsApp account
          </Text>
        </div>
      )}
    </div>
  );
};

export default WhatsAppView;