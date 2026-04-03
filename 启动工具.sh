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

# 宠物图鉴（序号 - 英文 - 中文）
declare -A PET_EN=(
    [1]="duck" [2]="goose" [3]="blob" [4]="cat" [5]="dragon" [6]="octopus"
    [7]="owl" [8]="penguin" [9]="turtle" [10]="snail" [11]="ghost"
    [12]="axolotl" [13]="capybara" [14]="cactus" [15]="robot" [16]="rabbit"
    [17]="mushroom" [18]="chonk"
)

declare -A PET_CN=(
    [1]="鸭子" [2]="鹅" [3]="史莱姆" [4]="猫" [5]="龙" [6]="章鱼"
    [7]="猫头鹰" [8]="企鹅" [9]="乌龟" [10]="蜗牛" [11]="幽灵"
    [12]="蝾螈" [13]="水豚" [14]="仙人掌" [15]="机器人" [16]="兔子"
    [17]="蘑菇" [18]="胖猫"
)

# 中文名到序号的映射
declare -A CN_TO_NUM=(
    ["鸭子"]=1 ["鹅"]=2 ["史莱姆"]=3 ["猫"]=4 ["龙"]=5 ["章鱼"]=6
    ["猫头鹰"]=7 ["企鹅"]=8 ["乌龟"]=9 ["蜗牛"]=10 ["幽灵"]=11
    ["蝾螈"]=12 ["水豚"]=13 ["仙人掌"]=14 ["机器人"]=15 ["兔子"]=16
    ["蘑菇"]=17 ["胖猫"]=18
)

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

# 根据输入解析宠物英文名
resolve_pet_species() {
    local input="$1"
    input=$(echo "$input" | tr '[:upper:]' '[:lower:]' | xargs)
    
    # 尝试匹配序号
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        if [[ $input -ge 1 && $input -le 18 ]]; then
            echo "${PET_EN[$input]}"
            return 0
        fi
    fi
    
    # 尝试匹配英文名
    for i in {1..18}; do
        if [[ "${PET_EN[$i]}" == "$input" ]]; then
            echo "$input"
            return 0
        fi
    done
    
    # 尝试匹配中文名
    if [[ -n "${CN_TO_NUM[$input]}" ]]; then
        echo "${PET_EN[${CN_TO_NUM[$input]}]}"
        return 0
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
    echo "  1. 寻找传奇宠物（先选宠物）"
    echo "  2. 检测环境"
    echo "  3. 写入 userID (修复宠物不生效)"
    echo "  0. 退出"
    echo ""
}

# 主循环
while true; do
    show_menu
    
    read -p "请输入选项 (0-3): " choice
    
    case $choice in
        1)
            # 显示图鉴
            show_pet_gallery
            
            print_color "请选择宠物：" "$YELLOW"
            echo "  输入序号 (1-18)、英文名 (如 dragon) 或中文名 (如 龙)"
            echo ""
            
            read -p "宠物选择：" pet_input
            pet_en=$(resolve_pet_species "$pet_input")
            
            if [[ -z "$pet_en" ]]; then
                print_color "❌ 无效的宠物名称" "$RED"
                sleep 1
                continue
            fi
            
            print_color "✅ 已选择：$pet_en" "$GREEN"
            echo ""
            
            # 开始生成
            print_color "🎯 开始寻找传奇 $pet_en..." "$CYAN"
            bun "$SCRIPT_DIR/scripts/buddy-interactive.js" "$pet_en" legendary 80
            ;;
        2)
            bash "$SCRIPT_DIR/scripts/buddy-helper.sh" -a detect
            ;;
        3)
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
