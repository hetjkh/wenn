; Custom NSIS installer script for TextNexus

; Add custom pages or modifications here
!macro customInstall
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\TextNexus.lnk" "$INSTDIR\TextNexus.exe"
  
  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\TextNexus"
  CreateShortCut "$SMPROGRAMS\TextNexus\TextNexus.lnk" "$INSTDIR\TextNexus.exe"
  CreateShortCut "$SMPROGRAMS\TextNexus\Uninstall TextNexus.lnk" "$INSTDIR\Uninstall TextNexus.exe"
!macroend

!macro customUnInstall
  ; Remove desktop shortcut
  Delete "$DESKTOP\TextNexus.lnk"
  
  ; Remove start menu shortcuts
  RMDir /r "$SMPROGRAMS\TextNexus"
!macroend