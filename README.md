# jushf-legendary-buddy

🎮 **Claude Code Buddy 宠物刷取工具** - 一键刷出传奇稀有度的自定义宠物

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/jushf/jushf-legendary-buddy)
[![Bun](https://img.shields.io/badge/runtime-Bun-fcf0e0)](https://bun.sh)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ⚠️ 重要提示

### 📦 使用前请备份！

**在修改任何配置文件之前，请务必备份你的 Claude Code 配置！**

```bash
# Windows (PowerShell)
Copy-Item "$env:USERPROFILE\.claude.json" "$env:USERPROFILE\.claude.json.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# macOS / Linux
cp ~/.claude.json ~/.claude.json.bak.$(date +%Y%m%d-%H%M%S)
```

**本工具会修改 `~/.claude.json` 配置文件。虽然我们已经过充分测试，但备份是好习惯！**

### 📜 免责声明

> **本工具仅供学习和研究目的。**
>
> - 本工具通过合法方式生成宠物配置，不涉及任何破解或篡改行为
> - 使用本工具产生的任何后果由用户自行承担
> - 本工具与 Anthropic 官方无关，不代表 Anthropic 立场
> - 请遵守 Claude Code 的使用条款和服务协议
> - 开发者不对本工具的使用承担任何责任
>
> **使用本工具即表示你同意以上条款。**

---

## 🚀 快速开始

### 环境要求

- **Bun** (必须！Node.js 不行)
  - 安装：https://bun.sh
  - Windows: `powershell -c "irm bun.sh/install.ps1|iex"`
  - macOS/Linux: `curl -fsSL https://bun.sh/install | bash`

- **Claude Code** (可选，如果你想在游戏中使用宠物)
  - 安装：`npm install -g @anthropic-ai/claude-code`

### 使用方法

#### 方式一：交互式（推荐）

```bash
# 1. 显示宠物图鉴
bun scripts/buddy-interactive.js --gallery

# 2. 刷传奇龙（属性 80+）
bun scripts/buddy-interactive.js dragon legendary 80

# 3. 刷闪光传奇鸭子（属性 90+）
bun scripts/buddy-interactive.js duck legendary 90 --shiny
```

#### 方式二：命令行参数

```bash
bun scripts/buddy-reroll.js --species dragon --rarity legendary --min-stats 80 --count 3
```

#### 方式三：快速启动

```bash
# Windows
启动工具.bat

# macOS / Linux
chmod +x start.sh
./start.sh
```

---

## 📋 宠物图鉴

### 18 种物种

| 英文名 | 中文名 | 英文名 | 中文名 |
|--------|--------|--------|--------|
| duck | 鸭子 | goose | 鹅 |
| blob | 史莱姆 | cat | 猫 |
| **dragon** | **龙** | octopus | 章鱼 |
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
| **legendary** | **1%** | **50** | **★★★★★** |

---

## 🔧 使用流程

### 普通用户

1. **刷宠物**
   ```bash
   bun scripts/buddy-interactive.js dragon legendary 80
   ```

2. **复制输出的 userID**

3. **写入配置**
   ```bash
   # Windows
   powershell -ExecutionPolicy Bypass -File scripts/buddy-helper.ps1 -Action write-uuid
   
   # macOS / Linux
   bash scripts/buddy-helper.sh -a write-uuid
   ```

4. **重启 Claude**
   ```bash
   claude
   /buddy
   ```

### OAuth 用户

OAuth 登录用户需要特殊处理流程，详见 [使用指南.md](使用指南.md)

---

## 📖 完整文档

- **[使用指南.md](使用指南.md)** - 详细的中文使用文档
- **[SKILL.md](SKILL.md)** - Skill 定义和技术说明

---

## 💡 常见问题

### Q: 为什么必须用 Bun？
A: Claude Code 使用 `Bun.hash()` 算法，Node.js 的 FNV-1a 结果不匹配。

### Q: 传奇宠物很难刷吗？
A: 权重只有 1%，但配合脚本通常几百万次内能找到。

### Q: 属性多少算好？
A: 传奇宠物保底 50，建议 80+，90+ 为极品，100 为满值。

### Q: 闪光概率？
A: 1%，非常稀有。

### Q: 支持哪些平台？
A: Windows、macOS、Linux 完全支持。

---

## 🛠️ 技术原理

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

---

## 📁 项目结构

```
jushf-legendary-buddy/
├── README.md                # 本文件
├── LICENSE                  # MIT 许可证
├── package.json             # 项目配置
├── SKILL.md                 # Skill 定义（中文）
├── 使用指南.md               # 详细使用指南（中文）
├── 启动工具.bat             # Windows 快速启动
├── start.sh                 # macOS/Linux 快速启动
├── scripts/
│   ├── buddy-reroll.js      # 核心脚本
│   ├── buddy-interactive.js # 交互式脚本
│   ├── buddy-helper.ps1     # PowerShell 辅助 (Windows)
│   └── buddy-helper.sh      # Bash 辅助 (macOS/Linux)
└── assets/
    └── buddy-species.png    # 宠物图鉴
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关资源

- [Linux.do 原帖 - 宠物系统逆向分析](https://linux.do/t/topic/1871870)
- [Linux.do 原帖 - OAuth 登录刷宠物方法](https://linux.do/t/topic/1873901)
- [Bun 官方网站](https://bun.sh)
- [Claude Code](https://claude.ai/code)

---

**Made with ❤️ by 少飞 | 艾尧智能**
