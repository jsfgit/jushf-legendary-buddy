@echo off
chcp 65001 >nul
echo.
echo 🎮 Claude Code Buddy 刷宠物工具
echo.
echo 请选择操作:
echo.
echo 1. 显示宠物图鉴
echo 2. 刷传奇宠物 (交互模式)
echo 3. 检测环境
echo.
set /p choice="请输入选项 (1-3): "

if "%choice%"=="1" (
    bun scripts/buddy-interactive.js --gallery
) else if "%choice%"=="2" (
    echo.
    set /p species="请输入宠物名称 (如 dragon, duck, cat): "
    bun scripts/buddy-interactive.js %species% legendary 80
) else if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File scripts/buddy-helper.ps1 -Action detect
) else (
    echo 无效选项
)

echo.
pause
