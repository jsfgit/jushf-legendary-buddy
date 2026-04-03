# Claude Code Buddy 刷宠物工具 - Windows PowerShell 启动脚本
# 双击此文件即可运行（Windows）

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 颜色输出
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

# 宠物图鉴（序号 - 英文 - 中文）
$PetSpecies = @(
    @{ Num = 1;  En = 'duck';      Cn = '鸭子' },
    @{ Num = 2;  En = 'goose';     Cn = '鹅' },
    @{ Num = 3;  En = 'blob';      Cn = '史莱姆' },
    @{ Num = 4;  En = 'cat';       Cn = '猫' },
    @{ Num = 5;  En = 'dragon';    Cn = '龙' },
    @{ Num = 6;  En = 'octopus';   Cn = '章鱼' },
    @{ Num = 7;  En = 'owl';       Cn = '猫头鹰' },
    @{ Num = 8;  En = 'penguin';   Cn = '企鹅' },
    @{ Num = 9;  En = 'turtle';    Cn = '乌龟' },
    @{ Num = 10; En = 'snail';     Cn = '蜗牛' },
    @{ Num = 11; En = 'ghost';     Cn = '幽灵' },
    @{ Num = 12; En = 'axolotl';   Cn = '蝾螈' },
    @{ Num = 13; En = 'capybara';  Cn = '水豚' },
    @{ Num = 14; En = 'cactus';    Cn = '仙人掌' },
    @{ Num = 15; En = 'robot';     Cn = '机器人' },
    @{ Num = 16; En = 'rabbit';    Cn = '兔子' },
    @{ Num = 17; En = 'mushroom';  Cn = '蘑菇' },
    @{ Num = 18; En = 'chonk';     Cn = '胖猫' }
)

# 显示宠物图鉴
function Show-PetGallery {
    Write-Host ""
    Write-Color "📖 宠物图鉴（18 种）" "Cyan"
    Write-Host ""
    
    # 分两列显示
    for ($i = 0; $i -lt 9; $i++) {
        $j = $i + 9
        $pet = $PetSpecies | Where-Object { $_.Num -eq ($i + 1) }
        $pet2 = $PetSpecies | Where-Object { $_.Num -eq ($j + 1) }
        $left = "$($pet.Num). $($pet.En) ($($pet.Cn))"
        $right = ""
        if ($j -lt 18) {
            $right = "  |  $($pet2.Num). $($pet2.En) ($($pet2.Cn))"
        }
        Write-Host "  $left$right"
    }
    Write-Host ""
}

# 根据输入解析宠物英文名（只支持序号）
function Resolve-PetSpecies {
    param([string]$Input)
    
    $Input = $Input.Trim()
    
    # 只匹配序号（1-18）
    if ($Input -match '^\d+$') {
        $num = [int]$Input
        if ($num -ge 1 -and $num -le 18) {
            $pet = $PetSpecies | Where-Object { $_.Num -eq $num }
            return $pet.En
        }
    }
    
    return $null
}

# 主菜单
function Show-Menu {
    Clear-Host
    Write-Color "🎮 Claude Code Buddy 刷宠物工具" "Cyan"
    Write-Color "   位置：$ScriptDir" "Gray"
    Write-Host ""
    Write-Color "请选择操作:" "Yellow"
    Write-Host ""
    Write-Host "  1. 探索传奇宠物（先选宠物）"
    Write-Host "  2. 检测环境"
    Write-Host "  3. 写入 userID (修复宠物不生效)"
    Write-Host "  0. 退出"
    Write-Host ""
}

# 主循环
while ($true) {
    Show-Menu
    
    $choice = Read-Host "请输入选项 (0-3)"
    
    if ($choice -eq "0") {
        Write-Color "👋 再见！" "Cyan"
        break
    }
    
    switch ($choice) {
        "1" {
            # 显示图鉴
            Show-PetGallery
            
            Write-Color "请选择宠物：" "Yellow"
            Write-Host "  输入序号 (1-18)"
            Write-Host ""
            
            $petInput = Read-Host "宠物选择"
            $petEn = Resolve-PetSpecies $petInput
            
            if (-not $petEn) {
                Write-Color "❌ 无效的宠物序号，请输入 1-18" "Red"
                Start-Sleep -Seconds 1
                continue
            }
            
            Write-Color "✅ 已选择：$petEn" "Green"
            Write-Host ""
            
            # 开始探索
            Write-Color "🎯 开始探索传奇 $petEn..." "Cyan"
            bun "$ScriptDir/scripts/buddy-interactive.js" $petEn legendary 80
        }
        "2" {
            & "$ScriptDir/scripts/buddy-helper.ps1" -Action detect
        }
        "3" {
            & "$ScriptDir/scripts/buddy-helper.ps1" -Action write-uuid
        }
        default {
            Write-Color "❌ 无效选项" "Red"
            Start-Sleep -Seconds 1
        }
    }
    
    Write-Host ""
    Read-Host "按回车键返回菜单"
}
