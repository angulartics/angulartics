param($installPath, $toolsPath, $package, $project)

. (Join-Path $toolsPath common.ps1)

if ($appFolderProjectItem -eq $null) {
    # No App folder
    Write-Host "No App folder found"
    exit
}


# Update the app.js file
Remove-App $appFolderProjectItem $moduleName