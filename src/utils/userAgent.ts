// Browser-compatible user agent utility
export const isMac = typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') > -1;
export const isWindows = typeof navigator !== 'undefined' && navigator.platform.indexOf('Win') > -1;
export const isLinux = typeof navigator !== 'undefined' && navigator.platform.indexOf('Linux') > -1;

function macOS() {
  // used fixed version (https://bugzilla.mozilla.org/show_bug.cgi?id=1679929)
  return 'Macintosh; Intel Mac OS X 10_15_7';
}

function windows() {
  return 'Windows NT 10.0; Win64; x64';
}

function linux() {
  return 'X11; Ubuntu; Linux x86_64';
}

export default function userAgent(removeChromeVersion = false) {
  let platformString = '';

  if (isMac) {
    platformString = macOS();
  } else if (isWindows) {
    platformString = windows();
  } else {
    platformString = linux();
  }

  // Use a fixed Chrome version for compatibility
  const chromeVersion = '120.0.0.0';
  
  // TODO: Update AppleWebKit and Safari version after electron update
  return `Mozilla/5.0 (${platformString}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome${!removeChromeVersion ? `/${chromeVersion}` : ''} Safari/537.36`;
}