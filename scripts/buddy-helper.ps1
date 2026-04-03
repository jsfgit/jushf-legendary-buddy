# Claude Code Buddy 刷宠物辅助脚本
# 用于自动检测环境、处理 OAuth 配置等

param(
    [string]$Action = "detect",
    [string]$Species = "",
    [string]$Rarity = "legendary",
    [int]$MinStats = 80,
    [switch]$Shiny
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsDir = Split-Path -Parent $ScriptDir
$WorkspaceDir = Split-Path -Parent $SkillsDir

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

# 检测 Claude Code 是否安装
function Test-ClaudeCode {
    try {
        $claudeVersion = claude --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# 检测安装方式（npm vs native）
function Get-ClaudeInstallType {
    $claudePath = Get-Command claude -ErrorAction SilentlyContinue
    if ($claudePath) {
        if ($claudePath.Source -like "*node_modules*") {
            return "npm"
        } else {
            return "native"
        }
    }
    return "unknown"
}

# 检测登录方式（OAuth vs 普通）
function Get-LoginType {
    $claudeJsonPath = "$env:USERPROFILE\.claude.json"
    if (Test-Path $claudeJsonPath) {
        $content = Get-Content $claudeJsonPath -Raw | ConvertFrom-Json
        if ($content.accountUuid) {
            return "normal"
        }
    }
    if ($env:CLAUDE_CODE_OAUTH_TOKEN) {
        return "oauth"
    }
    return "unknown"
}

# 主逻辑
switch ($Action) {
    "detect" {
        Write-Color "🔍 检测环境..." "Cyan"
        Write-Host ""
        
        # Bun 检测
        if (Test-Bun) {
            $bunVersion = bun --version
            Write-Color "✅ Bun 已安装 (v$bunVersion)" "Green"
        } else {
            Write-Color "❌ Bun 未安装" "Red"
            Write-Host "   请安装 Bun: https://bun.sh"
            Write-Host "   Windows: powershell -c \"irm bun.sh/install.ps1|iex\""
        }
        Write-Host ""
        
        # Claude Code 检测
        if (Test-ClaudeCode) {
            $claudeVersion = claude --version
            Write-Color "✅ Claude Code 已安装 (v$claudeVersion)" "Green"
            $installType = Get-ClaudeInstallType
            Write-Color "   安装方式：$installType" "Yellow"
        } else {
            Write-Color "❌ Claude Code 未安装" "Red"
            Write-Host "   安装：npm install -g @anthropic-ai/claude-code"
        }
        Write-Host ""
        
        # 登录方式检测
        $loginType = Get-LoginType
        if ($loginType -eq "normal") {
            Write-Color "📝 登录方式：普通登录" "Yellow"
        } elseif ($loginType -eq "oauth") {
            Write-Color "🔑 登录方式：OAuth 登录" "Yellow"
        } else {
            Write-Color "⚠️  未检测到登录信息" "Yellow"
        }
        Write-Host ""
    }
    
    "reroll" {
        Write-Color "🎮 Claude Code Buddy 刷宠物" "Cyan"
        Write-Host ""
        
        # 环境检查
        if (-not (Test-Bun)) {
            Write-Color "❌ 错误：Bun 未安装，无法继续" "Red"
            exit 1
        }
        
        # 构建命令
        $cmd = "bun `"$ScriptDir\buddy-reroll.js`""
        if ($Species) { $cmd += " --species $Species" }
        if ($Rarity) { $cmd += " --rarity $Rarity" }
        if ($MinStats) { $cmd += " --min-stats $MinStats" }
        if ($Shiny) { $cmd += " --shiny" }
        
        Write-Color "执行命令：$cmd" "Gray"
        Write-Host ""
        
        # 执行脚本
        Invoke-Expression $cmd
    }
    
    "oauth-setup" {
        Write-Color "🔑 OAuth 登录配置向导" "Cyan"
        Write-Host ""
        
        $claudeJsonPath = "$env:USERPROFILE\.claude.json"
        
        # 步骤 1：获取 Token
        Write-Color "步骤 1: 获取 OAuth Token" "Yellow"
        Write-Host "运行：claude setup-token"
        Write-Host "复制输出的 token"
        Write-Host ""
        
        $token = Read-Host "粘贴你的 OAuth Token"
        if ($token) {
            $env:CLAUDE_CODE_OAUTH_TOKEN = $token
            Write-Color "✅ 环境变量已设置（当前会话有效）" "Green"
            Write-Host ""
            Write-Host "💡 永久设置（PowerShell）:"
            Write-Host "[Environment]::SetEnvironmentVariable('CLAUDE_CODE_OAUTH_TOKEN', '$token', 'User')"
        }
        Write-Host ""
        
        # 步骤 2：重置配置
        Write-Color "步骤 2: 重置配置文件" "Yellow"
        if (Test-Path $claudeJsonPath) {
            Write-Host "备份现有配置..."
            Copy-Item $claudeJsonPath "$claudeJsonPath.bak"
        }
        
        $config = @{
            hasCompletedOnboarding = $true
            theme = "dark"
        } | ConvertTo-Json
        
        Write-Host "写入新配置到：$claudeJsonPath"
        Set-Content -Path $claudeJsonPath -Value $config
        Write-Color "✅ 配置已重置" "Green"
        Write-Host ""
        
        # 步骤 3：生成完整配置
        Write-Color "步骤 3: 生成完整配置" "Yellow"
        Write-Host "运行：claude"
        Write-Host "启动后直接退出（不要使用 /buddy）"
        Write-Host ""
        
        $continue = Read-Host "已完成？(y/n)"
        if ($continue -eq "y") {
            Write-Host ""
            Write-Color "✅ OAuth 配置完成！" "Green"
            Write-Host ""
            Write-Host "下一步："
            Write-Host "1. 运行：buddy-helper.ps1 -Action reroll --species <宠物>"
            Write-Host "2. 将输出的 userID 写入 ~/.claude.json 的 accountUuid 字段"
            Write-Host "3. 重新启动 claude 并输入 /buddy"
        }
    }
    
    "write-uuid" {
        Write-Color "✍️  写入 userID 到配置文件" "Cyan"
        Write-Host ""
        
        $claudeJsonPath = "$env:USERPROFILE\.claude.json"
        $uuid = Read-Host "粘贴 userID"
        
        if ($uuid) {
            if (Test-Path $claudeJsonPath) {
                # 备份现有配置
                $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
                $backupPath = "$claudeJsonPath.backup.$timestamp"
                Copy-Item $claudeJsonPath $backupPath
                Write-Color "💾 已备份原配置：$backupPath" "Yellow"
                
                # 写入新配置（同时修改 userID 和 accountUuid）
                $config = Get-Content $claudeJsonPath -Raw | ConvertFrom-Json
                $oldUserId = $config.userID
                $oldUuid = $config.accountUuid
                
                # Buddy 系统用 userID 做种子，必须同时修改
                $config.userID = $uuid
                $config.accountUuid = $uuid
                
                # 清除缓存的宠物数据，强制重新生成
                if ($config.companion) {
                    Write-Color "🗑️  清除缓存的宠物数据 (companion)" "Yellow"
                    $config.PSObject.Properties.Remove('companion')
                }
                
                $config | ConvertTo-Json -Depth 10 | Set-Content -Path $claudeJsonPath
                Write-Color "✅ userID + accountUuid 已写入：$uuid" "Green"
                Write-Color "   原 userID:      $oldUserId" "Gray"
                Write-Color "   原 accountUuid: $oldUuid" "Gray"
                Write-Host ""
                Write-Host "💡 如需恢复，运行："
                Write-Host "  Copy-Item '$backupPath' '$claudeJsonPath' -Force"
            } else {
                $config = @{
                    hasCompletedOnboarding = $true
                    theme = "dark"
                    accountUuid = $uuid
                } | ConvertTo-Json
                Set-Content -Path $claudeJsonPath -Value $config
                Write-Color "✅ 配置已创建并写入 userID: $uuid" "Green"
            }
        }
    }
    
    default {
        Write-Color "未知操作：$Action" "Red"
        Write-Host "可用操作：detect, reroll, oauth-setup, write-uuid"
    }
}
