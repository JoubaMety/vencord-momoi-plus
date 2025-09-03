$_originalContext = Get-Location
function Write-Message {
    param (
        [string]$Message
    )
    Write-Host "[momoiPlus] " -NoNewline -ForegroundColor Yellow
    Write-Host $Message
}
# check if OS is Windows
if ($env:OS -ne "Windows_NT") {
    Write-Message "This script is intended to run on Windows."
    exit
}

$links = @{
    "vencordGit"        = "https://github.com/Vendicated/Vencord.git"
    "vencordRelease"    = "https://github.com/Vendicated/Vencord/archive/refs/heads/main.zip"
    "momoiPlusGit"      = "https://github.com/ddddjBlue/vencord-momoi-plus.git"
    "momoiPlusRelease"  = "https://github.com/ddddjBlue/vencord-momoi-plus/archive/refs/heads/main.zip"
    "pnpmInstallScript" = "https://get.pnpm.io/install.ps1"
}
$defaultInstallPath = Join-Path $env:TMP "vencord-momoi-plus"
$momoiPlusPath = Join-Path -Path $defaultInstallPath "\src\userplugins\vencord-momoi-plus"

$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
$pnpmInstalled = Get-Command pnpm -ErrorAction SilentlyContinue

if (-not ($pnpmInstalled)) {
    Write-Message "pnpm is not installed. Installing pnpm..."
    Invoke-WebRequest -Uri $links.pnpmInstallScript -UseBasicParsing | Invoke-Expression
    $pnpmInstalled = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmInstalled) {
        Write-Message "pnpm installed successfully."
    }
    else {
        Write-Message "Failed to install pnpm. Please install it manually and re-run the script. (https://pnpm.io/installation#)"
        exit
    }
}
else {
    Write-Message "pnpm is already installed."
}
# if defaultInstallPath folder doesn't exist, create one
if (-not (Test-Path -Path $defaultInstallPath)) {
    if ($gitInstalled) {
        git clone $links.vencordGit $defaultInstallPath && Write-Message "Cloned Vencord repository to $defaultInstallPath"
    }
    else {
        New-Item -ItemType Directory -Path $defaultInstallPath && Write-Message "Created directory $defaultInstallPath"
    }
}
# If git is not installed, download the release zip and extract it to /dist
if (-not ($gitInstalled)) {
    # Download VencordRelease
    Invoke-WebRequest -Uri $links.vencordRelease -OutFile "$defaultInstallPath\VencordRelease.zip"
    # Extract VencordRelease
    Expand-Archive -Path "$defaultInstallPath\VencordRelease.zip" -DestinationPath "$defaultInstallPath\dist" -Force
    Remove-Item -Path "$defaultInstallPath\VencordRelease.zip" -Force
    # Test if extraction was successful
    if (Test-Path -Path "$defaultInstallPath\dist\src") {
        Write-Message "Vencord source files were successfully extracted."
    }
    else {
        Write-Message "Failed to extract Vencord source files."
        exit
    }
}
else {
    # If git is installed, pull the latest changes
    Set-Location -Path $defaultInstallPath
    git pull origin main
    Set-Location -Path $_originalContext
}


# Check if folder userplugins exists
if (-not (Test-Path -Path "$defaultInstallPath\src\userplugins")) {
    New-Item -ItemType Directory -Path "$defaultInstallPath\src\userplugins" && Write-Message "Created directory $defaultInstallPath\src\userplugins"
}
# Check if momoiPlus is already installed
if (-not (Test-Path -Path $momoiPlusPath)) {
    if ($gitInstalled) {
        git clone $links.momoiPlusGit $momoiPlusPath && Write-Message "Cloned MomoiPlus repository to $momoiPlusPath"
    }
    else {
        New-Item -ItemType Directory -Path $momoiPlusPath && Write-Message "Created directory $momoiPlusPath"
        Invoke-WebRequest -Uri $links.momoiPlusRelease -OutFile "$momoiPlusPath\MomoiPlusRelease.zip"
        Expand-Archive -Path "$momoiPlusPath\MomoiPlusRelease.zip" -DestinationPath "$momoiPlusPath" -Force
        Remove-Item -Path "$momoiPlusPath\MomoiPlusRelease.zip" -Force
    }
}
else {
    # If momoiPlus is already installed, pull the latest changes
    if ($gitInstalled) {
        Set-Location -Path $momoiPlusPath
        git pull origin main
        Set-Location -Path $_originalContext
    }
    else {
        Invoke-WebRequest -Uri $links.momoiPlusRelease -OutFile "$momoiPlusPath\MomoiPlusRelease.zip"
        Expand-Archive -Path "$momoiPlusPath\MomoiPlusRelease.zip" -DestinationPath "$momoiPlusPath" -Force
        Remove-Item -Path "$momoiPlusPath\MomoiPlusRelease.zip" -Force
    }
    Write-Message "MomoiPlus updated successfully."
}
# Install dependencies using pnpm
Set-Location -Path "$defaultInstallPath"
Write-Message "Installing dependencies using pnpm..."
pnpm install && Write-Message "Dependencies installed successfully."
# Build Vencord
Write-Message "Building Vencord..."
pnpm build && Write-Message "Vencord built successfully."
# Inject Vencord
Write-Message "Injecting Vencord..."
pnpm inject && Write-Message "Vencord injected successfully." && Write-Host "Life... is Kuyashi."
# Return to original location
Set-Location -Path $_originalContext
