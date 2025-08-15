/// <reference types="vite/client" />

interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getUserAgent: (serviceType?: string) => Promise<string>;
  getWhatsAppUserAgent: () => Promise<string>;
  platform: string;
  isElectron: boolean;
  showNotification: (data: {
    serviceId: string;
    serviceName: string;
    title: string;
    body: string;
    icon?: string;
  }) => Promise<boolean>;
  clearNotifications: (serviceId?: string) => Promise<boolean>;
  reloadService: (serviceId: string) => Promise<boolean>;
  toggleService: (serviceId: string, enabled: boolean) => Promise<boolean>;
  toggleServiceNotifications: (serviceId: string, enabled: boolean) => Promise<boolean>;
  onSwitchToService: (callback: (event: any, serviceId: string) => void) => void;
  onReloadService: (callback: (event: any, serviceId: string) => void) => void;
  onToggleService: (callback: (event: any, serviceId: string, enabled: boolean) => void) => void;
  onToggleServiceNotifications: (callback: (event: any, serviceId: string, enabled: boolean) => void) => void;
  onSendReply: (callback: (event: any, serviceId: string, replyText: string) => void) => void;
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
