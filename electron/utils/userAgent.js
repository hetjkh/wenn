import { cpus } from 'node:os';
import {
  chromeVersion,
  is64Bit,
  isMac,
  isWindows,
  osArch,
  osRelease,
} from './environment.js';

// Simple Chrome user agent generator
const generateChromeUserAgent = (os, version) => {
  return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
};

const macOS = () => {
  try {
    // Try to get macOS version from system
    const { execSync } = require('child_process');
    let version = '';
    try {
      version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
    } catch (error) {
      // Fallback to a common version
      version = '10.15.7';
    }
    
    let cpuName = cpus()[0].model.split(' ')[0];
    if (cpuName.includes('(')) {
      cpuName = cpuName.split('(')[0];
    }
    
    return `Macintosh; ${cpuName} Mac OS X ${version.replaceAll('.', '_')}`;
  } catch (error) {
    // Fallback
    return 'Macintosh; Intel Mac OS X 10_15_7';
  }
};

const windows = () => {
  const version = osRelease;
  const [majorVersion, minorVersion] = version.split('.');
  const archString = is64Bit ? 'Win64; x64' : 'Win32';
  return `Windows NT ${majorVersion}.${minorVersion}; ${archString}`;
};

const linux = () => {
  const archString = is64Bit ? 'x86_64' : osArch;
  return `X11; Linux ${archString}`;
};

export default function userAgent() {
  let platformString;

  if (isMac) {
    platformString = macOS();
  } else if (isWindows) {
    platformString = windows();
  } else {
    platformString = linux();
  }

  return generateChromeUserAgent(platformString, chromeVersion);
}

// Predefined user agents for different services
export const getUserAgentForService = (serviceType = 'default') => {
  const baseUserAgent = userAgent();
  
  const serviceUserAgents = {
    whatsapp: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    gmail: baseUserAgent,
    messenger: baseUserAgent,
    slack: baseUserAgent,
    telegram: baseUserAgent,
    discord: baseUserAgent,
    default: baseUserAgent
  };

  return serviceUserAgents[serviceType] || serviceUserAgents.default;
};

// WhatsApp specific user agent (most compatible)
export const getWhatsAppUserAgent = () => {
  if (isMac) {
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';
  } else if (isWindows) {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  } else {
    return 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
};