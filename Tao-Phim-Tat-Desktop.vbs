Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\CHESSVERSE - Bách Kỳ Trận.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "D:\Game Overall\Chay-App-Desktop.bat"
oLink.WorkingDirectory = "D:\Game Overall"
oLink.Description = "CHESSVERSE - Đại Sảnh 7 Môn Cờ Đa Dạng"
oLink.Save
WScript.Echo "Đã tạo thành công biểu tượng CHESSVERSE ra màn hình Desktop của bạn!"
