#!/bin/bash
# buddy-helper.sh
# Claude Code Buddy 跨平台辅助脚本 (macOS/Linux)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACE_DIR="$(dirname "$SKILLS_DIR")"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

print_color() {
    echo -e "${2}${1}${NC}"
}

# 检测 Bun 是否安装
test_bun() {
    if command -v bun &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 检测 Claude Code 是否安装
test_claude() {
    if command -v claude &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 获取 Claude 安装类型
get_claude_install_type() {
    local claude_path=$(which claude 2>/dev/null)
    if [[ "$claude_path" == *"node_modules"* ]]; then
        echo "npm"
    else
        echo "native"
    fi
}

# 获取登录类型
get_login_type() {
    local claude_json="$HOME/.claude.json"
    if [[ -f "$claude_json" ]]; then
        if grep -q "accountUuid" "$claude_json" 2>/dev/null || grep -q "userID" "$claude_json" 2>/dev/null; then
            echo "normal"
        fi
    fi
    if [[ -n "$CLAUDE_CODE_OAUTH_TOKEN" ]]; then
        echo "oauth"
    fi
    echo "unknown"
}

# 检测环境
action_detect() {
    print_color "🔍 检测环境..." "$CYAN"
    echo ""
    
    # Bun 检测
    if test_bun; then
        local bun_version=$(bun --version)
        print_color "✅ Bun 已安装 (v$bun_version)" "$GREEN"
    else
        print_color "❌ Bun 未安装" "$RED"
        echo "   请安装 Bun: https://bun.sh"
        echo "   安装命令：curl -fsSL https://bun.sh/install | bash"
    fi
    echo ""
    
    # Claude Code 检测
    if test_claude; then
        local claude_version=$(claude --version 2>&1 | head -1)
        print_color "✅ Claude Code 已安装 ($claude_version)" "$GREEN"
        local install_type=$(get_claude_install_type)
        print_color "   安装方式：$install_type" "$YELLOW"
    else
        print_color "❌ Claude Code 未安装" "$RED"
        echo "   安装：npm install -g @anthropic-ai/claude-code"
    fi
    echo ""
    
    # 登录方式检测
    local login_type=$(get_login_type)
    if [[ "$login_type" == "normal" ]]; then
        print_color "📝 登录方式：普通登录" "$YELLOW"
    elif [[ "$login_type" == "oauth" ]]; then
        print_color "🔑 登录方式：OAuth 登录" "$YELLOW"
    else
        print_color "⚠️  未检测到登录信息" "$YELLOW"
    fi
    echo ""
}

# 刷宠物
action_reroll() {
    print_color "🎮 Claude Code Buddy 刷宠物" "$CYAN"
    echo ""
    
    # 环境检查
    if ! test_bun; then
        print_color "❌ 错误：Bun 未安装，无法继续" "$RED"
        exit 1
    fi
    
    # 构建命令
    local cmd="bun \"$SCRIPT_DIR/buddy-reroll.js\""
    [[ -n "$SPECIES" ]] && cmd="$cmd --species $SPECIES"
    [[ -n "$RARITY" ]] && cmd="$cmd --rarity $RARITY"
    [[ -n "$MIN_STATS" ]] && cmd="$cmd --min-stats $MIN_STATS"
    [[ "$SHINY" == "true" ]] && cmd="$cmd --shiny"
    
    print_color "执行命令：$cmd" "$GRAY"
    echo ""
    
    # 执行脚本
    eval $cmd
}

# OAuth 配置向导
action_oauth_setup() {
    print_color "🔑 OAuth 登录配置向导" "$CYAN"
    echo ""
    
    local claude_json="$HOME/.claude.json"
    
    # 步骤 1：获取 Token
    print_color "步骤 1: 获取 OAuth Token" "$YELLOW"
    echo "运行：claude setup-token"
    echo "复制输出的 token"
    echo ""
    
    read -p "粘贴你的 OAuth Token: " token
    if [[ -n "$token" ]]; then
        export CLAUDE_CODE_OAUTH_TOKEN="$token"
        print_color "✅ 环境变量已设置（当前会话有效）" "$GREEN"
        echo ""
        print_color "💡 永久设置:" "$YELLOW"
        echo "添加到 ~/.bashrc 或 ~/.zshrc:"
        echo "  export CLAUDE_CODE_OAUTH_TOKEN='$token'"
    fi
    echo ""
    
    # 步骤 2：重置配置
    print_color "步骤 2: 重置配置文件" "$YELLOW"
    if [[ -f "$claude_json" ]]; then
        echo "备份现有配置..."
        cp "$claude_json" "$claude_json.bak.$(date +%Y%m%d-%H%M%S)"
    fi
    
    cat > "$claude_json" << EOF
{
  "hasCompletedOnboarding": true,
  "theme": "dark"
}
EOF
    print_color "✅ 配置已重置" "$GREEN"
    echo ""
    
    # 步骤 3：生成完整配置
    print_color "步骤 3: 生成完整配置" "$YELLOW"
    echo "运行：claude"
    echo "启动后直接退出（不要使用 /buddy）"
    echo ""
    
    read -p "已完成？(y/n): " continue
    if [[ "$continue" == "y" ]]; then
        echo ""
        print_color "✅ OAuth 配置完成！" "$GREEN"
        echo ""
        echo "下一步："
        echo "1. 运行：./buddy-helper.sh -a reroll --species <宠物>"
        echo "2. 将输出的 userID 写入 ~/.claude.json 的 accountUuid 字段"
        echo "3. 重新启动 claude 并输入 /buddy"
    fi
}

# 写入 UUID
action_write_uuid() {
    print_color "✍️  写入 userID 到配置文件" "$CYAN"
    print_color "⚠️  重要：同时修改 userID + accountUuid" "$YELLOW"
    print_color "   只改 accountUuid 不生效（Buddy 用 userID 做种子）" "$GRAY"
    print_color "   不影响 Claude 订阅/登录状态" "$GRAY"
    echo ""
    
    local claude_json="$HOME/.claude.json"
    read -p "粘贴 userID: " uuid
    
    if [[ -n "$uuid" ]]; then
        if [[ -f "$claude_json" ]]; then
            # 备份现有配置
            local timestamp=$(date +%Y%m%d-%H%M%S)
            local backup_path="$claude_json.backup.$timestamp"
            cp "$claude_json" "$backup_path"
            print_color "💾 已备份原配置：$backup_path" "$YELLOW"
            
            # 使用 node 更新 JSON（同时修改 userID 和 accountUuid）
            if command -v node &> /dev/null; then
                node -e "
                    const fs = require('fs');
                    const config = JSON.parse(fs.readFileSync('$claude_json', 'utf8'));
                    const oldUserId = config.userID || 'N/A';
                    const oldUuid = config.accountUuid || 'N/A';
                    
                    config.userID = '$uuid';
                    config.accountUuid = '$uuid';
                    
                    // 清除缓存的宠物数据，强制重新生成
                    if (config.companion) {
                        console.log('🗑️  清除缓存的宠物数据 (companion)');
                        delete config.companion;
                    }
                    
                    fs.writeFileSync('$claude_json', JSON.stringify(config, null, 2));
                    console.log('');
                    console.log('✅ 配置已更新');
                    console.log('   新 userID:      $uuid');
                    console.log('   新 accountUuid: $uuid');
                    console.log('   原 userID:      ' + oldUserId);
                    console.log('   原 accountUuid: ' + oldUuid);
                    console.log('');
                    console.log('💡 如需恢复，运行：');
                    console.log('  cp \\''$backup_path'\\' \\'$claude_json\\' -f');
                "
            else
                print_color "❌ 错误：需要 Node.js 来处理 JSON" "$RED"
                exit 1
            fi
        else
            cat > "$claude_json" << EOF
{
  "hasCompletedOnboarding": true,
  "theme": "dark",
  "accountUuid": "$uuid",
  "userID": "$uuid"
}
EOF
            print_color "✅ 配置已创建并写入 userID: $uuid" "$GREEN"
        fi
    fi
}

# 显示帮助
show_help() {
    echo "Claude Code Buddy 辅助脚本"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "操作:"
    echo "  -a, --action <action>   执行操作 (detect/reroll/oauth-setup/write-uuid)"
    echo "  -s, --species <name>    目标物种"
    echo "  -r, --rarity <name>     稀有度"
    echo "  -m, --min-stats <val>   最小属性"
    echo "  --shiny                 要求闪光"
    echo "  -h, --help              显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 -a detect"
    echo "  $0 -a reroll -s dragon -r legendary -m 80"
    echo "  $0 -a oauth-setup"
    echo "  $0 -a write-uuid"
}

# 解析参数
ACTION=""
SPECIES=""
RARITY=""
MIN_STATS=""
SHINY="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -s|--species)
            SPECIES="$2"
            shift 2
            ;;
        -r|--rarity)
            RARITY="$2"
            shift 2
            ;;
        -m|--min-stats)
            MIN_STATS="$2"
            shift 2
            ;;
        --shiny)
            SHINY="true"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "未知参数：$1"
            show_help
            exit 1
            ;;
    esac
done

# 主逻辑
case $ACTION in
    detect)
        action_detect
        ;;
    reroll)
        action_reroll
        ;;
    oauth-setup)
        action_oauth_setup
        ;;
    write-uuid)
        action_write_uuid
        ;;
    *)
        echo "请指定操作 (-a/--action)"
        show_help
        exit 1
        ;;
esac
