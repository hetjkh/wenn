import { app, BrowserWindow, ipcMain, session, Notification, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import userAgent, { getUserAgentForService, getWhatsAppUserAgent } from './utils/userAgent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.show();
    }
  });
}

// Initialize electron-store
const store = new Store({
  name: 'textnexus-data',
  cwd: app.getPath('userData'),
  encryptionKey: 'textnexus-secure-key-2024',
  defaults: {
    services: [],
    activeTab: '',
    sidebarCollapsed: false,
    isDarkMode: false,
    windowBounds: {
      width: 1400,
      height: 900
    },
    sessions: {}
  },
  clearInvalidConfig: true,
  serialize: JSON.stringify,
  deserialize: JSON.parse
});

console.log('📁 Store path:', store.path);
console.log('📋 Initial store data:', store.store);

let mainWindow;
let isQuitting = false;

// Notification system
class NotificationManager {
  constructor() {
    this.notifications = new Map();
    this.isAppVisible = true;
    this.replyCallbacks = new Map();
    this.serviceIcons = this.initializeServiceIcons();
    
    // Set app user model ID for proper notifications
    if (process.platform === 'win32') {
      app.setAppUserModelId('TextNexus');
    }
  }

  initializeServiceIcons() {
    return {
      whatsapp: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
      gmail: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
      messenger: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg',
      slack: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
      telegram: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      discord: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
      default: path.join(__dirname, '../public/3.png')
    };
  }

  setAppVisibility(visible) {
    this.isAppVisible = visible;
  }

  showNotification(serviceId, serviceName, serviceType, title, body, icon) {
    // Only show notifications when app is not visible
    if (this.isAppVisible) return false;

    try {
      // Use service-specific icon or default TextNexus icon
      const notificationIcon = icon || this.serviceIcons[serviceType] || this.serviceIcons.default;
      
      console.log('📱 Creating notification:', {
        serviceId,
        serviceName,
        serviceType,
        title,
        body,
        icon: notificationIcon
      });

      // Ensure we have proper app identification for Windows
      if (process.platform === 'win32') {
        app.setAppUserModelId(`${serviceName || 'TextNexus'}`);
      }

      const notification = new Notification({
        title: `${serviceName || 'TextNexus'}${title ? ' - ' + title : ''}`,
        body: body,
        icon: notificationIcon,
        silent: false,
        urgency: 'normal',
        hasReply: true,
        replyPlaceholder: 'Type your reply...',
        tag: serviceId,      // Tag to identify service
        timeoutType: 'default',
        actions: [
          {
            type: 'button',
            text: 'Reply'
          },
          {
            type: 'button', 
            text: 'Mark as Read'
          }
        ]
      });

      notification.on('click', () => {
        console.log('🖱️ Notification clicked for service:', serviceId);
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
          mainWindow.show();
          
          // Switch to the service that sent the notification
          setTimeout(() => {
            mainWindow.webContents.send('switch-to-service', serviceId);
          }, 500);
        }
      });

      // Handle reply action
      notification.on('reply', (event, reply) => {
        console.log('💬 Notification reply:', reply);
        
        // Send reply to the webview
        if (mainWindow) {
          mainWindow.webContents.send('send-reply', serviceId, reply);
          
          // Show confirmation
          const confirmNotification = new Notification({
            title: `${serviceName || 'TextNexus'} - Reply Sent`,
            body: 'Reply sent successfully!',
            icon: notificationIcon,
            silent: true
          });
          confirmNotification.show();
          
          // Auto-close confirmation after 2 seconds
          setTimeout(() => {
            confirmNotification.close();
          }, 2000);
        }
      });

      // Handle action button clicks
      notification.on('action', (event, index) => {
        if (index === 0) { // Reply button  
          console.log('🔘 Reply button clicked');
          // This will trigger the reply input
        } else if (index === 1) { // Mark as read button
          console.log('✅ Mark as read clicked');
          notification.close();
        }
      });
      
      notification.show();
      this.notifications.set(serviceId, notification);
      
      console.log('✅ Notification shown successfully');
      return true;
    } catch (error) {
      console.error('❌ Error showing notification:', error);
      return false;
    }
  }

  clearNotifications(serviceId) {
    if (this.notifications.has(serviceId)) {
      this.notifications.get(serviceId).close();
      this.notifications.delete(serviceId);
    }
  }

  clearAllNotifications() {
    this.notifications.forEach(notification => notification.close());
    this.notifications.clear();
  }
}

const notificationManager = new NotificationManager();

// Disable security warnings in development
if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

function createWindow() {
  // Get saved window bounds
  const savedBounds = store.get('windowBounds', { width: 1400, height: 900 });
  
  mainWindow = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../public/icon.ico'),
    title: 'TextNexus',
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      webviewTag: true,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      backgroundThrottling: false
    },
    titleBarStyle: 'default',
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  // Load the URL with the generated user agent
  mainWindow.loadURL(startUrl, {
    userAgent: userAgent()
  });

  // Hide menu bar completely
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window to ensure proper initialization
    if (isDev) {
      mainWindow.focus();
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window focus/blur for notifications
  mainWindow.on('focus', () => {
    console.log('🔍 Window focused - disabling notifications');
    notificationManager.setAppVisibility(true);
    notificationManager.clearAllNotifications();
  });

  mainWindow.on('blur', () => {
    console.log('👁️ Window blurred - enabling notifications');
    notificationManager.setAppVisibility(false);
  });

  mainWindow.on('show', () => {
    console.log('👀 Window shown - disabling notifications');
    notificationManager.setAppVisibility(true);
    notificationManager.clearAllNotifications();
  });

  mainWindow.on('hide', () => {
    console.log('🙈 Window hidden - enabling notifications');
    notificationManager.setAppVisibility(false);
  });

  // Handle close button - minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Show notification about running in background
      if (process.platform !== 'darwin') {
        const notification = new Notification({
          title: 'TextNexus',
          body: 'App is running in the background. You will continue to receive notifications.',
          icon: path.join(__dirname, '../public/3.png')
        });
        notification.show();
      }
      return false;
    }
  });

  // Save window bounds when resized or moved
  let saveTimeout;
  const saveWindowBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      console.log('💾 Window bounds saved:', bounds);
    }, 500);
  };

  mainWindow.on('resize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    saveWindowBounds();
  });

  mainWindow.on('move', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    saveWindowBounds();
  });

  // Handle window resize to ensure webview scales properly
  mainWindow.on('resize', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.executeJavaScript(`
      const webviews = document.querySelectorAll('webview');
      webviews.forEach(webview => {
        webview.style.width = '100%';
        webview.style.height = '100%';
      });
    `).catch(() => {
      // Ignore errors if webview doesn't exist yet
    });
  });
}

app.whenReady().then(() => {
  // Configure session for WhatsApp Web compatibility
  const filter = {
    urls: ['*://web.whatsapp.com/*', '*://*.whatsapp.com/*', '*://*.whatsapp.net/*', '*://*.facebook.com/*']
  };
  
  // Configure for all sessions (default and partitioned)
  const configureSession = (ses) => {
    const defaultUserAgent = userAgent();
    const whatsappUserAgent = getWhatsAppUserAgent();
    
    ses.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      // Use WhatsApp specific user agent for WhatsApp domains
      if (details.url.includes('whatsapp.com') || details.url.includes('whatsapp.net')) {
        details.requestHeaders['User-Agent'] = whatsappUserAgent;
      } else {
        details.requestHeaders['User-agent'] = defaultUserAgent;
      }
      details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.9';
      details.requestHeaders['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8';
      details.requestHeaders['Sec-Fetch-Site'] = 'none';
      details.requestHeaders['Sec-Fetch-Mode'] = 'navigate';
      details.requestHeaders['Sec-Fetch-User'] = '?1';
      details.requestHeaders['Sec-Fetch-Dest'] = 'document';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
  
    // Remove frame restrictions for WhatsApp Web
    ses.webRequest.onHeadersReceived(filter, (details, callback) => {
      if (details.responseHeaders) {
        delete details.responseHeaders['x-frame-options'];
        delete details.responseHeaders['X-Frame-Options'];
        delete details.responseHeaders['content-security-policy'];
        delete details.responseHeaders['Content-Security-Policy'];
        delete details.responseHeaders['content-security-policy-report-only'];
        delete details.responseHeaders['Content-Security-Policy-Report-Only'];
        
        // Add headers to prevent download prompts
        if (details.responseHeaders) {
          details.responseHeaders['Cache-Control'] = ['no-cache, no-store, must-revalidate'];
          details.responseHeaders['Pragma'] = ['no-cache'];
          details.responseHeaders['Expires'] = ['0'];
        }
      }
      callback({ cancel: false, responseHeaders: details.responseHeaders });
    });

    // Set up permissions for WhatsApp Web
    ses.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['notifications', 'microphone', 'camera', 'media', 'geolocation', 'midi', 'midiSysex', 'clipboard-read', 'clipboard-write'];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    });

    // Disable web security for WhatsApp Web
    ses.webRequest.onBeforeRequest(filter, (details, callback) => {
      // Redirect any download page requests back to web interface
      if (details.url.includes('whatsapp.com/download') || 
          details.url.includes('whatsapp.com/desktop')) {
        callback({ 
          cancel: false, 
          redirectURL: 'https://web.whatsapp.com/' 
        });
      } else {
        callback({ cancel: false });
      }
    });
  
    // Additional session configuration
    ses.webRequest.onCompleted(filter, (details) => {
      // Log successful loads for debugging
      if (details.statusCode === 200) {
        console.log('WhatsApp Web loaded successfully:', details.url);
      }
    });
  };

  // Configure default session
  configureSession(session.defaultSession);

  // Configure partitioned sessions when they are created
  session.defaultSession.on('will-create-partition', (event, partition) => {
    console.log('Creating partition:', partition);
  });

  // Listen for partition creation and configure them
  const originalFromPartition = session.fromPartition;
  session.fromPartition = function(partition, options) {
    const partitionSession = originalFromPartition.call(this, partition, options);
    if (partition.includes('whatsapp') || partition.includes('persist:')) {
      console.log('Configuring WhatsApp partition:', partition);
      configureSession(partitionSession);
    }
    return partitionSession;
  };

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Don't quit the app, keep it running for notifications
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  } else if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('https://web.whatsapp.com')) {
    // Ignore certificate errors for WhatsApp Web in development
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// IPC handler for getting user agent
ipcMain.handle('get-user-agent', async (event, serviceType) => {
  return getUserAgentForService(serviceType);
});

ipcMain.handle('get-whatsapp-user-agent', async () => {
  return getWhatsAppUserAgent();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Get app name for notifications
ipcMain.handle('get-app-name', () => {
  return app.getName();
});

// Notification handlers
ipcMain.handle('show-notification', async (event, data) => {
  try {
    const { serviceId, serviceName, serviceType, title, body, icon } = data;
    console.log('📨 Received notification request:', data);
    
    // Ensure we have proper app identification
    app.setAppUserModelId(`${serviceName || 'TextNexus'}`);
    
    const result = notificationManager.showNotification(serviceId, serviceName, serviceType || 'whatsapp', title, body, icon);
    console.log('📱 Notification result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error in show-notification handler:', error);
    return false;
  }
});

ipcMain.handle('clear-notifications', async (event, serviceId) => {
  if (serviceId) {
    notificationManager.clearNotifications(serviceId);
  } else {
    notificationManager.clearAllNotifications();
  }
  return true;
});

// Service management handlers
ipcMain.handle('reload-service', async (event, serviceId) => {
  console.log('🔄 Reloading service:', serviceId);
  mainWindow.webContents.send('reload-service', serviceId);
  return true;
});

ipcMain.handle('toggle-service', async (event, serviceId, enabled) => {
  console.log('🔄 Toggling service:', serviceId, enabled);
  mainWindow.webContents.send('toggle-service', serviceId, enabled);
  return true;
});

ipcMain.handle('toggle-service-notifications', async (event, serviceId, enabled) => {
  console.log('🔔 Toggling service notifications:', serviceId, enabled);
  mainWindow.webContents.send('toggle-service-notifications', serviceId, enabled);
  return true;
});

// Store handlers
ipcMain.handle('store-get', async (event, key) => {
  try {
    const value = store.get(key);
    console.log('📖 Store GET:', key, '=', value, typeof value);
    return value;
  } catch (error) {
    console.error('❌ Store GET error:', error);
    // Try to get from backup
    try {
      const backupValue = store.get(`backup-${key}`);
      if (backupValue) {
        console.log('📖 Restored from backup:', key);
        return backupValue;
      }
    } catch (backupError) {
      console.error('❌ Backup restore failed:', backupError);
    }
    return undefined;
  }
});

ipcMain.handle('store-set', async (event, key, value) => {
  try {
    console.log('💾 Store SET:', key, '=', value);
    
    // Create backup before setting
    try {
      const currentValue = store.get(key);
      if (currentValue) {
        store.set(`backup-${key}`, currentValue);
      }
    } catch (backupError) {
      console.warn('⚠️ Backup creation failed:', backupError);
    }
    
    store.set(key, value);
    
    // Verify the data was saved
    const savedValue = store.get(key);
    if (JSON.stringify(savedValue) !== JSON.stringify(value)) {
      throw new Error('Data verification failed');
    }
    
    console.log('✅ Store SET complete');
    return true;
  } catch (error) {
    console.error('❌ Store SET error:', error);
    return false;
  }
});

ipcMain.handle('store-delete', async (event, key) => {
  try {
    console.log('🗑️ Store DELETE:', key);
    store.delete(key);
    return true;
  } catch (error) {
    console.error('❌ Store DELETE error:', error);
    return false;
  }
});

ipcMain.handle('store-clear', async () => {
  try {
    console.log('🧹 Store CLEAR');
    store.clear();
    return true;
  } catch (error) {
    console.error('❌ Store CLEAR error:', error);
    return false;
  }
});

// Log store changes for debugging
store.onDidChange('services', (newValue, oldValue) => {
  console.log('🔄 Services changed in store:', oldValue?.length || 0, '->', newValue?.length || 0);
});