// Note: This file has now become devoid of all references to values deduced from the remote process - all those now live in the `environment-remote.js` file

import { arch, release } from 'node:os';

export const isMac = typeof process !== 'undefined' ? process.platform === 'darwin' : typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') > -1;
export const isWindows = typeof process !== 'undefined' ? process.platform === 'win32' : typeof navigator !== 'undefined' && navigator.platform.indexOf('Win') > -1;
export const isLinux = typeof process !== 'undefined' ? process.platform === 'linux' : typeof navigator !== 'undefined' && navigator.platform.indexOf('Linux') > -1;
export const isWinPortable = typeof process !== 'undefined' ? process.env.PORTABLE_EXECUTABLE_FILE != null : false;

export const isWayland = isLinux && typeof process !== 'undefined' && process.env.XDG_SESSION_TYPE === 'wayland';
export const isSnap = isLinux && typeof process !== 'undefined' && process.env.SNAP != null;

export const electronVersion: string = typeof process !== 'undefined' ? (process.versions?.electron ?? '') : '';
export const chromeVersion: string = typeof process !== 'undefined' ? (process.versions?.chrome ?? '') : '120.0.0.0';
export const nodeVersion: string = typeof process !== 'undefined' ? process.versions.node : '';

export const osArch: string = typeof process !== 'undefined' ? arch() : 'x64';
export const osRelease: string = typeof process !== 'undefined' ? release() : '10.0';
export const is64Bit: RegExpMatchArray | null = osArch.match(/64/);

// for accelerator, show the shortform that electron/OS understands
// for tooltip, show symbol
const ctrlKey: string = isMac ? '⌘' : 'Ctrl';
const cmdKey: string = isMac ? 'Cmd' : 'Ctrl';

export const altKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⌥' : 'Alt';
export const shiftKey = (isAccelerator = true) =>
  !isAccelerator && isMac ? '⇧' : 'Shift';

// Platform specific shortcut keys
export const cmdOrCtrlShortcutKey = (isAccelerator = true) =>
  isAccelerator ? cmdKey : ctrlKey;
export const lockFerdiumShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+L`;
export const todosToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+T`;
export const workspaceToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+D`;
export const muteFerdiumShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${shiftKey(isAccelerator)}+M`;
export const addNewServiceShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+N`;
export const splitModeToggleShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${altKey(isAccelerator)}+S`;
export const settingsShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+${isMac ? ',' : 'P'}`;
export const downloadsShortcutKey = (isAccelerator = true) =>
  `${cmdOrCtrlShortcutKey(isAccelerator)}+J`;
export const toggleFullScreenKey = () =>
  isMac ? `CTRL + ${cmdKey} + F` : 'F11';