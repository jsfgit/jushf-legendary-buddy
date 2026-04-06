#!/bin/bash
# Claude Code Buddy 刷宠物工具 - macOS/Linux 启动脚本
# 运行：./启动工具.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

print_color() {
    echo -e "${2}${1}${NC}"
}

# 宠物图鉴数据（兼容 bash 3.2，不用 declare -A）
# 使用数组 + 索引映射
PET_EN=("" "duck" "goose" "blob" "cat" "dragon" "octopus" "owl" "penguin" "turtle" "snail" "ghost" "axolotl" "capybara" "cactus" "robot" "rabbit" "mushroom" "chonk")
PET_CN=("" "鸭子" "鹅" "史莱姆" "猫" "龙" "章鱼" "猫头鹰" "企鹅" "乌龟" "蜗牛" "幽灵" "蝾螈" "水豚" "仙人掌" "机器人" "兔子" "蘑菇" "胖猫")

# 显示宠物图鉴
show_pet_gallery() {
    echo ""
    print_color "📖 宠物图鉴（18 种）" "$CYAN"
    echo ""
    
    for i in {1..9}; do
        j=$((i + 9))
        left="$i. ${PET_EN[$i]} (${PET_CN[$i]})"
        right=""
        if [[ $j -le 18 ]]; then
            right="  |  $j. ${PET_EN[$j]} (${PET_CN[$j]})"
        fi
        echo "  $left$right"
    done
    echo ""
}

# 根据序号解析宠物英文名（只支持序号）
resolve_pet_species() {
    local input="$1"
    input=$(echo "$input" | xargs)
    
    # 只匹配序号（1-18）
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        if [[ $input -ge 1 && $input -le 18 ]]; then
            echo "${PET_EN[$input]}"
            return 0
        fi
    fi
    
    return 1
}

# 主菜单
show_menu() {
    clear
    print_color "🎮 Claude Code Buddy 刷宠物工具" "$CYAN"
    print_color "   位置：$SCRIPT_DIR" "$GRAY"
    echo ""
    print_color "请选择操作:" "$YELLOW"
    echo ""
    echo "  1. 探索传奇宠物（先选宠物）"
    echo "  2. 检测环境"
    echo "  3. 写入 userID (修复宠物不生效)"
    echo "  0. 退出"
    echo ""
}

# 主循环
while true; do
    show_menu
    
    read -p "请输入选项 (0-3): " choice
    
    if [[ "$choice" == "0" ]]; then
        print_color "👋 再见！" "$CYAN"
        break
    fi
    
    case $choice in
        1)
            # 显示图鉴
            show_pet_gallery
            
            print_color "请选择宠物：" "$YELLOW"
            echo "  输入序号 (1-18)"
            echo ""
            
            read -p "宠物选择：" pet_input
            pet_en=$(resolve_pet_species "$pet_input")
            
            if [[ -z "$pet_en" ]]; then
                print_color "❌ 无效的宠物序号，请输入 1-18" "$RED"
                sleep 1
                continue
            fi
            
            print_color "✅ 已选择：$pet_en" "$GREEN"
            echo ""
            
            # 开始探索
            print_color "🎯 开始探索传奇 $pet_en..." "$CYAN"
            bun "$SCRIPT_DIR/scripts/buddy-interactive.js" "$pet_en" legendary 80
            ;;
        2)
            bash "$SCRIPT_DIR/scripts/buddy-helper.sh" -a detect
            ;;
        3)
            bash "$SCRIPT_DIR/scripts/buddy-helper.sh" -a write-uuid
            ;;
        *)
            print_color "❌ 无效选项" "$RED"
            sleep 1
            ;;
    esac
    
    echo ""
    read -p "按回车键返回菜单"
done
