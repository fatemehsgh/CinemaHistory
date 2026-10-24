$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "سینما لاگ.lnk"
$IconPath = Join-Path $PSScriptRoot "public\favicon.ico"

$ProgramFilesX86 = ${env:ProgramFiles(x86)}
$ProgramFiles = $env:ProgramFiles

if (Test-Path "$ProgramFiles\Google\Chrome\Application\chrome.exe") {
    $TargetExe = "$ProgramFiles\Google\Chrome\Application\chrome.exe"
    $Args = "--app=http://localhost:3000"
} elseif ($ProgramFilesX86 -and (Test-Path "$ProgramFilesX86\Google\Chrome\Application\chrome.exe")) {
    $TargetExe = "$ProgramFilesX86\Google\Chrome\Application\chrome.exe"
    $Args = "--app=http://localhost:3000"
} elseif ($ProgramFilesX86 -and (Test-Path "$ProgramFilesX86\Microsoft\Edge\Application\msedge.exe")) {
    $TargetExe = "$ProgramFilesX86\Microsoft\Edge\Application\msedge.exe"
    $Args = "--app=http://localhost:3000"
} elseif (Test-Path "$ProgramFiles\Microsoft\Edge\Application\msedge.exe") {
    $TargetExe = "$ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    $Args = "--app=http://localhost:3000"
} else {
    $TargetExe = "http://localhost:3000"
}

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
if ($Args) {
    $Shortcut.TargetPath = $TargetExe
    $Shortcut.Arguments = $Args
} else {
    $Shortcut.TargetPath = $TargetExe
}
$Shortcut.IconLocation = "$IconPath, 0"
$Shortcut.Description = "سینما لاگ - تاریخچه فیلم‌های من"
$Shortcut.Save()

Write-Host "شورتکات سینما لاگ با آیکون اختصاصی روی دسک‌تاپ ساخته شد: $ShortcutPath"
