#!/bin/bash
# Claude Code Buddy 刷宠物工具 - macOS/Linux 启动脚本
# 运行：./启动工具.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_color() {
    echo -e "${2}${1}${NC}"
}

# 主菜单
show_menu() {
    clear
    print_color "🎮 Claude Code Buddy 刷宠物工具" "$CYAN"
    print_color "   位置：$SCRIPT_DIR" "$GRAY"
    echo ""
    print_color "请选择操作:" "$YELLOW"
    echo ""
    echo "  1. 显示宠物图鉴"
    echo "  2. 刷传奇宠物 (交互模式)"
    echo "  3. 检测环境"
    echo "  4. 写入 userID (修复宠物不生效)"
    echo "  0. 退出"
    echo ""
}

# 主循环
while true; do
    show_menu
    
    read -p "请输入选项 (0-4): " choice
    
    case $choice in
        1)
            bun "$SCRIPT_DIR/scripts/buddy-interactive.js" --gallery
            ;;
        2)
            echo ""
            read -p "请输入宠物名称 (如 dragon, duck, cat): " species
            bun "$SCRIPT_DIR/scripts/buddy-interactive.js" "$species" legendary 80
            ;;
        3)
            bash "$SCRIPT_DIR/scripts/buddy-helper.sh" -a detect
            ;;
        4)
            bash "$SCRIPT_DIR/scripts/buddy-helper.sh" -a write-uuid
            ;;
        0)
            print_color "👋 再见！" "$CYAN"
            break
            ;;
        *)
            print_color "❌ 无效选项" "$RED"
            ;;
    esac
    
    if [[ "$choice" != "0" ]]; then
        echo ""
        read -p "按回车键返回菜单"
    fi
done
