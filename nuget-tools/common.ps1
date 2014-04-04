function Update-App($appFolderProjectItem, $moduleName) {
    $modulePattern = "(?sm)(angular\.module\(\'\w*\'\,\s*\[)(((?!\]\)).)*)(\s*\]\s*\))"
    $moduleItem = 2
    $ignoreItem = 3
    $modulePatternItems = 4
        
    try {
        $appFileProjectItem = $appFolderProjectItem.ProjectItems.Item("app.js")
    }
    catch {
        # app.js file not found
        Write-Host "app.js not found"
        return
    }

    if ($appFileProjectItem -eq $null) {
        # app.js file not found
        Write-Host "app.js not found null"
        return
    }

    $appFilePath = $appFileProjectItem.FileNames(1)
    $appTempFilePath = Join-Path $env:TEMP "app.tmp.js"
    $appBackupFilePath = Join-Path $appFolderProjectItem.FileNames(1) "app.pre-aa.js"

    $appFileContent = Get-Content $appFilePath -Raw
        
    if ($appFileContent -match $modulePattern) {
        $appModuleArrayContent = $matches[$moduleItem]

        if ($appModuleArrayContent -match $moduleName) {
            # module already exists
            Write-Host "Module exists"
            return
        }

        #Backup the file
        Copy-Item $appFilePath $appBackupFilePath -Force
        $project.ProjectItems.AddFromFile($appBackupFilePath)

        #If modules exist, insert a comma
        if ($appModuleArrayContent -match "(?sm)\w") {
            $prepend = ","
        }
        else {
            $prepend = ""
        }

        if (!($appModuleArrayContent -match "\n")) {
            #single line, insert after original (may be empty)
            $insertion = ""
            for ($i = 1; $i -le $modulePatternItems; $i++) {
                if ($i -ne $ignoreItem) {
                    $insertion += "`$$i"
                    if ($i -eq $moduleItem) {
                        $insertion += $prepend
                        $insertion += "'$moduleName'"
                    }
                }
            }
        }
        else {
            # multi line
            #break modules into array of lines
            $appModules = $appModuleArrayContent -split "\r\n"
            $lastId = -1
            do {
                $lastModule = $appModules[$lastId--]
            }
            until (($lastModule -eq $null) -or ($lastModule -match "(?sm)\w"))
            if (!($lastModule -eq $null)) {
                #update last module
                $moduleNamePattern = "(\'[\w\.-]*\')(.*)"
                $moduleNameReplacement = "`$1$prepend`$2"
                $lastModuleReplacement = $lastModule -replace $moduleNamePattern, $moduleNameReplacement
                $appModuleArrayContent = $appModuleArrayContent -replace $lastModule, $lastModuleReplacement
                $lastModule -match "^(\s*)\'"
                $indent = $matches[1]
            }
            else {
                $indent = "  "
            }
            
            $insertion = ""
            for ($i = 1; $i -le $modulePatternItems; $i++) {
                if ($i -ne $ignoreItem) {
                    if ($i -eq $moduleItem) {
                        $insertion += $appModuleArrayContent
                        $insertion += $indent
                        $insertion += "'$moduleName'`r`n"
                    }
                    else {
                        $insertion += "`$$i"
                    }
                }
            }
        }

    $appFileContent -replace $modulePattern, $insertion | Add-Content $appTempFilePath -Encoding UTF8

    }
    else {
        # File has no existing matching module
        Write-Host "app module reference not found"
        return
    }

    # Copy over the new app.js file
    Copy-Item $appTempFilePath $appFilePath -Force
    Remove-Item $appTempFilePath -Force
}

function Remove-App($appFolderProjectItem, $moduleName) {
    $modulePattern = "(?sm)(angular\.module\(\'\w*\'\,\s*\[)(((?!\]\)).)*)(\s*\]\s*\))"
    $moduleItem = 2
    $ignoreItem = 3
    $modulePatternItems = 4
        
    try {
        $appFileProjectItem = $appFolderProjectItem.ProjectItems.Item("app.js")
    }
    catch {
        # app.js file not found
        Write-Host "app.js not found"
        return
    }

    if ($appFileProjectItem -eq $null) {
        # app.js file not found
        Write-Host "app.js not found"
        return
    }

    $appFilePath = $appFileProjectItem.FileNames(1)
    $appTempFilePath = Join-Path $env:TEMP "app.tmp.js"
    $appBackupFilePath = Join-Path $appFolderProjectItem.FileNames(1) "app.pre-aa-removal.js"

    $appFileContent = Get-Content $appFilePath -Raw
        
    if ($appFileContent -match $modulePattern) {
        $appModuleArrayContent = $matches[$moduleItem]

        if (!$appModuleArrayContent -match $moduleName) {
            # module does not exists
            Write-Host "Module does not exist"
            return
        }

        #Backup the file
        Copy-Item $appFilePath $appBackupFilePath -Force
        $project.ProjectItems.AddFromFile($appBackupFilePath)
        
        if (!($appModuleArrayContent -match "\n")) {
            #single line, remove 
            $appModules = $appModuleArrayContent -split ","
            $repModules = @()
            for ($i = 0; $i -le $appModules.length; $i++) {
                if ($moduleName -ne $appModules[$i].trim()) {
                    $repModules += $appModules[$i]
                }
            }
            $replacement = $repModules -join ","
        }
        else {
            # multi line
            #break modules into array of lines
            $appModules = $appModuleArrayContent -split "\r\n"

            #if last module, remove previous comma
            $lastId = -1
            do {
                $lastModule = $appModules[$lastId--]
            }
            until (($lastModule -eq $null) -or ($lastModule -match "(?sm)\w"))
            if ($lastModule -match $moduleName) {
                $previousModule = $appModules[$lastId]
                $moduleNamePattern = "(\'[\w\.-]*\'),(.*)"
                $moduleNameReplacement = "`$1`$2"
                $appModules[$lastId] = $previousModule -replace $moduleNamePattern, $moduleNameReplacement
            }
             
            $repModules = @()
            for ($i = 0; $i -le $appModules.length; $i++) {
                if (!($appModules[$i] -match $moduleName)) {
                    $repModules += $appModules[$i]
                }
            }
            $replacement = $repModules -join "`r`n"
        }
        
        $insertion = ""
        for ($i = 1; $i -le $modulePatternItems; $i++) {
            if ($i -ne $ignoreItem) {
                if ($i -eq $moduleItem) {
                    $insertion += $replacement
                }
                else {
                    $insertion += "`$$i"
                }
            }
        }

    $appFileContent -replace $modulePattern, $insertion | Add-Content $appTempFilePath -Encoding UTF8
    }
    else {
        # File has no existing matching module
        Write-Host "app module reference not found"
        return
    }

    # Copy over the new app.js file
    Copy-Item $appTempFilePath $appFilePath -Force
    Remove-Item $appTempFilePath -Force
    Write-Host "done"
}


$packageScriptsFolder = Join-Path $installPath Content\Scripts
$jsFileName = Join-Path $packageScriptsFolder "angulartics*.js" | Get-ChildItem -Exclude "*.min.js" | Split-Path -Leaf
$jsFileName -match "([\w-\.(?!\.js)]*)\.js"
$moduleName = $matches[1]

# Get the project item for the app folder
try {
    $appFolderProjectItem = $project.ProjectItems.Item("app")
    $projectAppFolderPath = $appFolderProjectItem.FileNames(1)
}
catch {
    # No App folder
    Write-Host "No app folder found"
}