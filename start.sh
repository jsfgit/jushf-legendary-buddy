#!/bin/bash
# Claude Code Buddy 快速启动脚本 (macOS/Linux)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "🎮 Claude Code Buddy 刷宠物工具"
echo ""
echo "请选择操作:"
echo ""
echo "1. 显示宠物图鉴"
echo "2. 刷传奇宠物 (交互模式)"
echo "3. 检测环境"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        bun "$SCRIPT_DIR/buddy-interactive.js" --gallery
        ;;
    2)
        echo ""
        read -p "请输入宠物名称 (如 dragon, duck, cat): " species
        bun "$SCRIPT_DIR/buddy-interactive.js" "$species" legendary 80
        ;;
    3)
        bash "$SCRIPT_DIR/buddy-helper.sh" -a detect
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
read -p "按回车键退出..."
