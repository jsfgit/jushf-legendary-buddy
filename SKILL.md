---
name: jushf-legendary-buddy
description: Claude Code Buddy 宠物刷取工具 - 一键刷出传奇宠物
version: 1.1.0
author: 少飞
tags: [claude, buddy, 宠物，游戏，跨平台]
platforms: [windows, macos, linux]
---

# jushf-legendary-buddy

Claude Code Buddy 宠物刷取工具，支持一键刷出传奇稀有度的自定义宠物。

## 触发词

- 刷 buddy
- 刷宠物
- Claude 宠物
- buddy reroll
- 刷个传奇宠物
- 自定义宠物

## 功能

1. **自动检测环境** - 识别 Claude Code 安装方式（npm vs native）和登录方式（OAuth vs 普通）
2. **宠物图鉴展示** - 显示 18 种宠物图片供用户选择
3. **一键刷传奇** - 默认参数：传奇稀有度 + 全属性 80+
4. **自定义参数** - 支持指定物种、眼睛、帽子、闪光、属性值
5. **自动配置** - OAuth 用户自动处理环境变量和配置文件
6. **JSON 输出** - 支持程序化调用

## 使用方法

### 基础用法

#### Windows

```bash
# 双击启动（推荐）
双击：启动工具.bat

# 命令行
bun scripts/buddy-interactive.js --gallery
bun scripts/buddy-interactive.js dragon legendary 80
powershell -ExecutionPolicy Bypass -File scripts/buddy-helper.ps1 -Action detect
```

#### macOS / Linux

```bash
# 启动脚本
chmod +x start.sh scripts/buddy-helper.sh
./start.sh

# 命令行
bun scripts/buddy-interactive.js --gallery
bun scripts/buddy-interactive.js dragon legendary 80
bash scripts/buddy-helper.sh -a detect
```

### 完整参数

#### 交互式脚本（推荐）

```bash
bun scripts/buddy-interactive.js <宠物名> [稀有度] [最小属性]

# 示例
bun scripts/buddy-interactive.js dragon legendary 80
bun scripts/buddy-interactive.js duck legendary 90 --shiny
bun scripts/buddy-interactive.js --gallery  # 显示图鉴
```

#### 核心脚本（高级）

```bash
bun scripts/buddy-reroll.js [选项]

选项：
  --species <name>   目标物种：duck, goose, blob, cat, dragon, octopus, owl, penguin,
                     turtle, snail, ghost, axolotl, capybara, cactus, robot,
                     rabbit, mushroom, chonk
  --rarity <name>    最低稀有度：common, uncommon, rare, epic, legendary
  --eye <char>       目标眼睛：· ✦ × ◉ @ °
  --hat <name>       目标帽子：none, crown, tophat, propeller, halo, wizard, beanie, tinyduck
  --shiny            要求闪光
  --min-stats <val>  所有属性 >= 值 (默认：90)
  --max <number>     最大迭代次数 (默认：50000000)
  --count <number>   查找结果数量 (默认：3)
  --check <uid>      检查特定 userID 生成什么宠物
  --json             输出 JSON 格式（便于程序调用）
```

### 示例

```bash
# 刷传奇龙，属性 80+
bun buddy-reroll.js --species dragon --rarity legendary --min-stats 80

# 刷闪光传奇鸭子，属性 95+
bun buddy-reroll.js --species duck --rarity legendary --shiny --min-stats 95

# 检查现有 userID 的宠物
bun buddy-reroll.js --check f17c2742a00b2345c22fddc830959a6847ceb561fa06adb26b74b1a91ac657bc
```

## 宠物图鉴

### 18 种物种

| 英文名 | 中文名 | 英文名 | 中文名 |
|--------|--------|--------|--------|
| duck | 鸭子 | goose | 鹅 |
| blob | 史莱姆 | cat | 猫 |
| dragon | 龙 | octopus | 章鱼 |
| owl | 猫头鹰 | penguin | 企鹅 |
| turtle | 乌龟 | snail | 蜗牛 |
| ghost | 幽灵 | axolotl | 蝾螈 |
| capybara | 水豚 | cactus | 仙人掌 |
| robot | 机器人 | rabbit | 兔子 |
| mushroom | 蘑菇 | chonk | 胖猫 |

### 稀有度

| 稀有度 | 权重 | 最低属性 | 星星 |
|--------|------|----------|------|
| common | 60% | 5 | ★ |
| uncommon | 25% | 15 | ★★ |
| rare | 10% | 25 | ★★★ |
| epic | 4% | 35 | ★★★★ |
| legendary | 1% | 50 | ★★★★★ |

### 眼睛样式

`·` `✦` `×` `◉` `@` `°`

### 帽子（稀有及以上）

none, crown, tophat, propeller, halo, wizard, beanie, tinyduck

## OAuth 用户特殊处理

OAuth 登录用户需要特殊处理流程：

### Windows (PowerShell)

```powershell
# 1. 获取 OAuth Token
claude setup-token

# 2. 重置配置文件
Remove-Item ~/.claude.json
echo '{"hasCompletedOnboarding":true,"theme":"dark"}' | Out-File -Encoding UTF8 ~/.claude.json

# 3. 设置环境变量（永久）
[Environment]::SetEnvironmentVariable('CLAUDE_CODE_OAUTH_TOKEN', '你的 token', 'User')

# 4. 启动生成配置
claude
# 启动后直接退出，不要使用 /buddy

# 5. 运行脚本刷 userID
bun scripts/buddy-reroll.js --species dragon --rarity legendary
# 将输出的 userID 写入 ~/.claude.json 的 accountUuid 字段

# 6. 重新启动 Claude
claude
/buddy  # 享受你的自定义宠物！
```

### macOS / Linux (Bash)

```bash
# 1. 获取 OAuth Token
claude setup-token

# 2. 重置配置文件
rm ~/.claude.json
echo '{"hasCompletedOnboarding":true,"theme":"dark"}' > ~/.claude.json

# 3. 设置环境变量（永久）
echo 'export CLAUDE_CODE_OAUTH_TOKEN="你的 token"' >> ~/.bashrc  # 或 ~/.zshrc
source ~/.bashrc

# 4. 启动生成配置
claude
# 启动后直接退出，不要使用 /buddy

# 5. 运行脚本刷 userID
bun scripts/buddy-reroll.js --species dragon --rarity legendary

# 6. 写入 userID
bash scripts/buddy-helper.sh -a write-uuid
# 粘贴输出的 userID

# 7. 重新启动 Claude
claude
/buddy  # 享受你的自定义宠物！
```

## 技术原理

### 哈希算法
- **Bun 模式**: `Bun.hash()` - 与 Claude Code 实际结果匹配 ✅
- **Node 模式**: FNV-1a - 结果不匹配 ❌

### 宠物生成流程
```
userID + SALT('friend-2026-401')
         ↓
    Hash (Bun.hash)
         ↓
    Mulberry32 PRNG
         ↓
    稀有度 → 物种 → 眼睛 → 帽子 → 闪光 → 属性
```

## 注意事项

1. **必须使用 Bun 运行** - Node.js 的 FNV-1a 哈希结果与 Claude Code 不匹配
2. **闪光概率极低** - 1% 概率，可能需要大量迭代
3. **传奇宠物难刷** - 权重仅 1%，建议设置合理的 `--min-stats` 值
4. **OAuth 用户** - 必须用环境变量方式绕过 accountUuid 覆盖

## 文件结构

```
skills/jushf-claude-buddy/
├── SKILL.md
├── scripts/
│   ├── buddy-reroll.js      # 核心脚本
│   └── buddy-helper.ps1     # PowerShell 辅助脚本（可选）
└── assets/
    └── buddy-species.png    # 宠物图鉴
```

## 相关资源

- [宠物系统逆向分析原帖](https://linux.do/t/topic/1871870)
- [OAuth 登录刷宠物方法](https://linux.do/t/topic/1873901)
- [笔记文档](D:\RAG\Obsidian\jushf_obsidian\openclaw\Claude Code Buddy 刷宠物指南.md)
