[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri "https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip" -OutFile "Inter.zip"
Expand-Archive -Path "Inter.zip" -DestinationPath "Inter" -Force
Copy-Item "Inter\Inter Desktop\Inter-Regular.otf" -Destination "src\lib\pdf\fonts\"
Copy-Item "Inter\Inter Desktop\Inter-Bold.otf" -Destination "src\lib\pdf\fonts\"
Copy-Item "Inter\Inter Desktop\Inter-Italic.otf" -Destination "src\lib\pdf\fonts\"
Remove-Item "Inter.zip"
Remove-Item "Inter" -Recurse -Force
