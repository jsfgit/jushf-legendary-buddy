# Claude Code Buddy 刷宠物工具 - Windows PowerShell 启动脚本
# 双击此文件即可运行（Windows）

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 颜色输出
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

# 检测 Bun 是否安装
function Test-Bun {
    try {
        $bunVersion = bun --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# 主菜单
function Show-Menu {
    Clear-Host
    Write-Color "🎮 Claude Code Buddy 刷宠物工具" "Cyan"
    Write-Color "   位置：$ScriptDir" "Gray"
    Write-Host ""
    Write-Color "请选择操作:" "Yellow"
    Write-Host ""
    Write-Host "  1. 显示宠物图鉴"
    Write-Host "  2. 刷传奇宠物 (交互模式)"
    Write-Host "  3. 检测环境"
    Write-Host "  4. 写入 userID (修复宠物不生效)"
    Write-Host "  0. 退出"
    Write-Host ""
}

# 主循环
while ($true) {
    Show-Menu
    
    $choice = Read-Host "请输入选项 (0-4)"
    
    switch ($choice) {
        "1" {
            bun "$ScriptDir/scripts/buddy-interactive.js" --gallery
        }
        "2" {
            Write-Host ""
            $species = Read-Host "请输入宠物名称 (如 dragon, duck, cat)"
            bun "$ScriptDir/scripts/buddy-interactive.js" $species legendary 80
        }
        "3" {
            & "$ScriptDir/scripts/buddy-helper.ps1" -Action detect
        }
        "4" {
            & "$ScriptDir/scripts/buddy-helper.ps1" -Action write-uuid
        }
        "0" {
            Write-Color "👋 再见！" "Cyan"
            break
        }
        default {
            Write-Color "❌ 无效选项" "Red"
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Read-Host "按回车键返回菜单"
    }
}
