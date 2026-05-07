Get-ChildItem -Path 'c:\Users\Admin\Downloads\swot-project-main\frontend\src' -Recurse -Include '*.tsx','*.ts' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'font-black') {
        $newContent = $content -replace 'font-black', 'font-bold'
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}
Write-Host "Done!"
