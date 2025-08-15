import React, { memo } from 'react';
import WhatsAppView from './WhatsAppView';
import GenericWebView from './GenericWebView';

interface ServiceTab {
  id: string;
  name: string;
  type: 'whatsapp';
  iconType: string;
  partition: string;
  workspaceId: string;
}

interface ServiceRendererProps {
  service: ServiceTab;
  isDarkMode: boolean;
  isActive: boolean;
  isDisabled?: boolean;
}

// Memoized service renderer for better performance
const ServiceRenderer: React.FC<ServiceRendererProps> = memo(({ service, isDarkMode, isActive, isDisabled = false }) => {
  // Don't render anything if the service is disabled
  if (isDisabled) {
    return null;
  }
  
  // Always render but control visibility to prevent reload
  const containerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: isActive ? 'block' : 'none',
    position: isActive ? 'relative' : 'absolute',
    top: 0,
    left: 0,
    zIndex: isActive ? 1 : 0
  };

  // Direct component selection without switch case
  const Component = service.iconType === 'whatsapp' ? WhatsAppView : GenericWebView;
  
  return (
    <div style={containerStyle}>
      <Component
        key={service.id}
        {...(service.iconType === 'whatsapp' 
          ? { 
              partition: service.partition, 
              serviceName: service.name,
              isDarkMode,
              isActive
            }
          : { 
              service, 
              isDarkMode,
              isActive
            }
        )}
      />
    </div>
  );
});

ServiceRenderer.displayName = 'ServiceRenderer';

export default ServiceRenderer;