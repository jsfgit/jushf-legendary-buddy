#!/usr/bin/env bun
/**
 * 卡皮巴拉刷取脚本 - 完整日志版
 * 记录每个传奇/闪光宠物的详细信息（userID、时间、迭代次数、属性）
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../brush-logs');
const RESULTS_FILE = path.join(LOG_DIR, 'all-results.json');
const SUMMARY_FILE = path.join(LOG_DIR, 'summary.md');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Mulberry32 PRNG
function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// 生成宠物
function generateBuddy(seed) {
    const rng = mulberry32(seed);
    
    // 稀有度权重
    const rarityRoll = rng();
    let rarity = 'common';
    let minStats = 5;
    if (rarityRoll < 0.01) { rarity = 'legendary'; minStats = 50; }
    else if (rarityRoll < 0.05) { rarity = 'epic'; minStats = 35; }
    else if (rarityRoll < 0.15) { rarity = 'rare'; minStats = 25; }
    else if (rarityRoll < 0.40) { rarity = 'uncommon'; minStats = 15; }
    
    // 物种
    const species = ['duck', 'goose', 'blob', 'cat', 'dragon', 'octopus', 'owl', 'penguin', 
                     'turtle', 'snail', 'ghost', 'axolotl', 'capybara', 'cactus', 'robot', 
                     'rabbit', 'mushroom', 'chonk'];
    const speciesNames = {
        duck: '鸭子', goose: '鹅', blob: '史莱姆', cat: '猫', dragon: '龙',
        octopus: '章鱼', owl: '猫头鹰', penguin: '企鹅', turtle: '乌龟', snail: '蜗牛',
        ghost: '幽灵', axolotl: '蝾螈', capybara: '卡皮巴拉', cactus: '仙人掌',
        robot: '机器人', rabbit: '兔子', mushroom: '蘑菇', chonk: '胖猫'
    };
    const speciesIdx = Math.floor(rng() * species.length);
    const selectedSpecies = species[speciesIdx];
    
    // 眼睛
    const eyes = ['·', '✦', '×', '◉', '@', '°'];
    const eyeIdx = Math.floor(rng() * eyes.length);
    const selectedEye = eyes[eyeIdx];
    
    // 帽子 (稀有及以上)
    const hats = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'];
    let hat = 'none';
    if (['rare', 'epic', 'legendary'].includes(rarity)) {
        hat = hats[Math.floor(rng() * hats.length)];
    }
    
    // 闪光 (1% 概率)
    const shiny = rng() < 0.01;
    
    // 属性 (6 项)
    const stats = [];
    for (let i = 0; i < 6; i++) {
        const stat = Math.max(minStats, Math.floor(rng() * 100));
        stats.push(stat);
    }
    const totalStats = stats.reduce((a, b) => a + b, 0);
    const avgStats = Math.round(totalStats / 6);
    
    // 生成 userID
    const userId = 'f' + seed.toString(16).padStart(62, '0').slice(0, 63);
    
    return {
        userId,
        seed,
        species: selectedSpecies,
        speciesName: speciesNames[selectedSpecies],
        rarity,
        shiny,
        eye: selectedEye,
        hat,
        stats,
        totalStats,
        avgStats
    };
}

// 主函数
async function main() {
    console.log('🎮 卡皮巴拉刷取工具 - 完整日志版');
    console.log('目标：闪光 ✨ + 金色眼睛 ✦ + 传奇 ⭐⭐⭐⭐⭐ + 卡皮巴拉');
    console.log('所有结果将保存到:', LOG_DIR);
    console.log('========================================');
    
    const startTime = Date.now();
    let iteration = 0;
    let legendaryCount = 0;
    let shinyCount = 0;
    let capybaraCount = 0;
    let targetCount = 0;
    let bestStats = 0;
    let bestBuddy = null;
    
    // 存储所有结果
    const allResults = {
        startTime: new Date().toISOString(),
        config: {
            targetSpecies: 'capybara',
            targetRarity: 'legendary',
            targetEye: '✦',
            targetShiny: true
        },
        legendary: [],
        shiny: [],
        capybara: [],
        target: [],
        best: []
    };
    
    // 运行 30 分钟 = 1800 秒
    const DURATION_MS = 30 * 60 * 1000;
    const REPORT_INTERVAL = 60 * 1000;
    const SAVE_INTERVAL = 5 * 60 * 1000; // 每 5 分钟保存一次
    let lastReport = startTime;
    let lastSave = startTime;
    
    while (Date.now() - startTime < DURATION_MS) {
        iteration++;
        
        // 生成随机种子
        const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const buddy = generateBuddy(seed);
        
        // 统计
        if (buddy.rarity === 'legendary') {
            legendaryCount++;
            allResults.legendary.push({
                iteration,
                timestamp: new Date().toISOString(),
                elapsed: ((Date.now() - startTime) / 1000).toFixed(1),
                ...buddy
            });
        }
        if (buddy.shiny) {
            shinyCount++;
            allResults.shiny.push({
                iteration,
                timestamp: new Date().toISOString(),
                elapsed: ((Date.now() - startTime) / 1000).toFixed(1),
                ...buddy
            });
        }
        if (buddy.species === 'capybara') {
            capybaraCount++;
            allResults.capybara.push({
                iteration,
                timestamp: new Date().toISOString(),
                elapsed: ((Date.now() - startTime) / 1000).toFixed(1),
                ...buddy
            });
        }
        if (buddy.avgStats > bestStats) {
            bestStats = buddy.avgStats;
            bestBuddy = buddy;
            allResults.best.push({
                iteration,
                timestamp: new Date().toISOString(),
                elapsed: ((Date.now() - startTime) / 1000).toFixed(1),
                ...buddy
            });
        }
        
        // 检查目标
        const isTarget = buddy.species === 'capybara' && 
                         buddy.rarity === 'legendary' && 
                         buddy.shiny && 
                         buddy.eye === '✦';
        
        if (isTarget) {
            targetCount++;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            allResults.target.push({
                iteration,
                timestamp: new Date().toISOString(),
                elapsed,
                ...buddy
            });
            console.log(`\n🎉🎉🎉 [${elapsed}s] 找到目标！迭代 ${iteration.toLocaleString()}`);
            console.log(` userID: ${buddy.userId}`);
            console.log(` 卡皮巴拉 - 传奇 ✨ 金色眼睛 ✦ 属性:${buddy.avgStats}`);
            console.log(` 属性详情：${buddy.stats.join(', ')}\n`);
        }
        
        // 每分钟报告进度
        if (Date.now() - lastReport >= REPORT_INTERVAL) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            const remaining = ((DURATION_MS - (Date.now() - startTime)) / 1000 / 60).toFixed(1);
            console.log(`\n⏱️  进度报告：已运行 ${elapsed}s, 剩余 ${remaining}分钟`);
            console.log(`   总迭代：${iteration.toLocaleString()} (${(iteration / (Date.now() - startTime) * 1000).toFixed(0)}/秒)`);
            console.log(`   传奇：${legendaryCount} | 闪光：${shinyCount} | 卡皮巴拉：${capybaraCount} | 目标：${targetCount}`);
            console.log(`   最佳属性：${bestStats} (${bestBuddy?.species})\n`);
            lastReport = Date.now();
        }
        
        // 每 5 分钟保存一次
        if (Date.now() - lastSave >= SAVE_INTERVAL) {
            fs.writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
            console.log(`💾 已保存进度到 ${RESULTS_FILE}`);
            lastSave = Date.now();
        }
    }
    
    // 最终保存
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
    
    // 生成总结报告
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const iterationsPerSecond = (iteration / (Date.now() - startTime) * 1000).toFixed(1);
    
    const summary = `# 🎮 卡皮巴拉刷取完整报告

**开始时间:** ${new Date(allResults.startTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
**结束时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

## 📊 统计数据

| 项目 | 数量 |
|------|------|
| 总运行时间 | ${totalTime}s (${(totalTime/60).toFixed(2)}分钟) |
| 总迭代次数 | ${iteration.toLocaleString()} |
| 计算速度 | ${iterationsPerSecond} 次/秒 |
| 传奇宠物 | ${legendaryCount} |
| 闪光宠物 | ${shinyCount} |
| 卡皮巴拉 | ${capybaraCount} |
| **目标 (闪光 + 金眼 + 传奇 + 卡皮巴拉)** | **${targetCount}** |

## 🏆 目标宠物详情

${allResults.target.length > 0 ? allResults.target.map((t, i) => `### 目标 #${i + 1}
- **时间:** ${new Date(t.timestamp).toLocaleString('zh-CN')}
- **运行时间:** ${t.elapsed}s
- **迭代次数:** ${t.iteration.toLocaleString()}
- **userID:** \`${t.userId}\`
- **物种:** ${t.speciesName} (${t.species})
- **稀有度:** ${t.rarity} ⭐⭐⭐⭐⭐
- **闪光:** ${t.shiny ? '✨ 是' : '○ 否'}
- **眼睛:** ${t.eye}
- **帽子:** ${t.hat}
- **属性:** ${t.stats.join(', ')}
- **平均属性:** ${t.avgStats}
`).join('\n---\n') : '❌ 未找到目标宠物'}

## 💪 最佳属性宠物

${allResults.best.slice(-5).map((b, i) => `### Top ${i + 1}
- **时间:** ${new Date(b.timestamp).toLocaleString('zh-CN')}
- **迭代次数:** ${b.iteration.toLocaleString()}
- **userID:** \`${b.userId}\`
- **物种:** ${b.speciesName} (${b.species})
- **稀有度:** ${b.rarity}
- **闪光:** ${b.shiny ? '✨' : '○'}
- **眼睛:** ${b.eye}
- **属性:** ${b.stats.join(', ')}
- **平均属性:** ${b.avgStats}
`).join('\n---\n')}

## 📁 详细数据文件

- **完整 JSON:** \`${RESULTS_FILE}\`
- **传奇宠物:** ${allResults.legendary.length} 个
- **闪光宠物:** ${allResults.shiny.length} 个
- **卡皮巴拉:** ${allResults.capybara.length} 个

---
*生成时间：${new Date().toLocaleString('zh-CN')}*
`;
    
    fs.writeFileSync(SUMMARY_FILE, summary);
    
    // 最终报告
    console.log('\n========================================');
    console.log('🏁 刷取完成！');
    console.log('========================================');
    console.log(`总运行时间：${totalTime}s (${(totalTime/60).toFixed(2)}分钟)`);
    console.log(`总迭代次数：${iteration.toLocaleString()}`);
    console.log(`计算速度：${iterationsPerSecond} 次/秒`);
    console.log('----------------------------------------');
    console.log(`传奇数量：${legendaryCount}`);
    console.log(`闪光数量：${shinyCount}`);
    console.log(`卡皮巴拉数量：${capybaraCount}`);
    console.log(`目标数量：${targetCount}`);
    console.log('----------------------------------------');
    console.log(`最佳属性：${bestStats} (${bestBuddy?.species})`);
    console.log('========================================');
    console.log(`\n📄 完整结果：${RESULTS_FILE}`);
    console.log(`📄 总结报告：${SUMMARY_FILE}`);
}

main().catch(console.error);
