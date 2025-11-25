# When run from file with params or when locally debugging:
param(
### Latest api docs paths as deployed on dev/staging/release
[string]$docsLatestRoot,
### The new type doc that will be deployed.
[string] $typeDocToDeploy,
### The json file that contains all versions for dev/staging/release
[string] $jsonFile,
### The version tag.
[string]$tag,
### Whether this is the latest verisons, and should overwrite the latest folder.
[bool]$isLatest
)

# When run as inline script in release pipe:
# $docsLatestRoot = "$(stagingFilePath_reactAPI)";
# $typeDocToDeploy = "$(System.ArtifactsDirectory)/TypeDocOutput";
# $jsonFile = "react-api-docs-versions-prod.json";
# $tag = "$(pMajor).$(pMinor).$(pBuild)";
# $isLatest = $True;

Write-Output "Tag is: " $tag

$versionPath = $docsLatestRoot.Replace("typescript\latest", $tag + "\typescript");
$docsLatestTSFolder = [System.IO.Directory]::GetParent($docsLatestRoot);
$docsLatestRootFolder = [System.IO.Directory]::GetParent($docsLatestTSFolder);
Write-Output "version path is:" $versionPath;

$filePath = $docsLatestRootFolder.FullName + "\" + $jsonFile;

Write-Output "json file path is:" $filePath;

#######Delete all other folders starting with <Major>.<Minor>########
#######Since we are going to keep the latest and greatest########
$lastDot = $tag.LastIndexOf('.');
$filter = $tag.Substring(0,$lastDot);
$foldersToDel = Get-ChildItem -Path $docsLatestRootFolder -Directory -Filter $filter*
Write-Output "Folders to delete: " $foldersToDel

try {
foreach($f in $foldersToDel){
    if([System.IO.Directory]::Exists($f.FullName))
        { Write-Output $f.FullName " to be deleted!"
        Remove-Item $f.FullName -Recurse -Force -Verbose } }

        Write-Output $f.FullName " deleted."
    }
catch { Write-Output "Exception while deleting the old folders" }

Write-Output "Starting copying files from: " $typeDocToDeploy "to: " $versionPath;

New-Item -Path $versionPath -ItemType Directory -Force -Verbose
Copy-Item -Path $typeDocToDeploy\* -Destination $versionPath -Recurse -Force -Verbose

Write-Output "Files copied."

###Add metatag inside index.html files' head section
Write-Output "Add metatag inside index.html files' head section";
$indexFiles = Get-ChildItem -Path $versionPath -File -Recurse -Filter index.html
Write-Output "Index files to update:" + $indexFiles.Length;
foreach($indexFile in $indexFiles) {
    Write-Output "Updating file: " + $indexFile.FullName;
    $newText = [System.IO.File]::ReadAllText($indexFile.FullName).Replace("</head>", "    <meta name=`"robots`" content=`"noindex,nofollow`">
</head>");
    [System.IO.File]::WriteAllText($indexFile.FullName, $newText);
    Write-Output "File updated: " $indexFile.FullName;
}

############Update the typescript folders if isLatest flag is true###########
Write-Output "Is latest version?: " $isLatest;
if($isLatest) {
    Write-Output "Updating latest folder since this is latest version.";
    $typeScriptFolder = $versionPath;
    $typeScriptFolderToUpdate = $docsLatestTSFolder.FullName;
    Write-Output "[Latest] typeScriptFolderToUpdate is:" $typeScriptFolderToUpdate;

    #Delete the existing content as octopus option - delete all before deployment
    try {
        Remove-Item $typeScriptFolderToUpdate\* -Recurse -Force -Verbose }
    catch { Write-Output "Exception while deleting the $typeScriptFolderToUpdate" }
    Write-Output "Copy from " $typeScriptFolder "to: "  $typeScriptFolderToUpdate;
    New-Item -Path $typeScriptFolderToUpdate\latest -ItemType Directory -Force -Verbose
    Copy-Item -Path $typeScriptFolder\* -Destination $typeScriptFolderToUpdate\latest -Recurse -Force -Verbose
    Write-Output "Copy Done.";
}

###########Json file content Update###########
Write-Output "Update json file with new version."
### If file does not exits - create it
if (![System.IO.File]::Exists($filePath)) {
    Write-Output "File at: " $filePath "does not exist. Creating new file."
    New-Item -Path $filePath -ItemType File -Force -Verbose
}

Write-Output "Check file exists: " ([System.IO.File]::Exists($filePath))
Write-Output "Check dir exists:" ([System.IO.Directory]::Exists($docsLatestRootFolder));


if([System.IO.File]::Exists($filePath) -and [System.IO.Directory]::Exists($docsLatestRootFolder)) {
    $folders = Get-ChildItem -Path $docsLatestRootFolder -Directory -Exclude $tagFolder,"sass","typescript" -Name | Sort-Object @{Expression = {[double]($_.Substring(0, $_.LastIndexOf('.'))) }};
    Write-Output "Folders found: " + $folders.Length;
    $textToUpdate = "";
    foreach($item in $folders) {
        $textToUpdate += '"' + $item + '"';
    }
    $textToUpdate = "[" +  $textToUpdate.Replace("`"`"","`"`,`"") + "]" ;
    Write-Output "Text to update: " $textToUpdate;

    $content = [System.IO.File]::ReadAllText($filePath);
    if (!$content) {
        ### No Content Yet. Set initial structure.
        Write-Output "File has no previous content. Set initial structure."
        $content = '{"folders": []}';
    }
    $newContent = $content -replace "\[.*\]", $textToUpdate;
    Write-Output "New file content is: " $newContent;
    [System.IO.File]::WriteAllText($filePath,$newContent);
}
