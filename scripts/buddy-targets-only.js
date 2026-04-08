#!/usr/bin/env bun
/**
 * 卡皮巴拉刷取脚本 - 只保存目标宠物
 * 记录每个闪光 + 金色眼睛 + 传奇 + 卡皮巴拉的详细信息
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../brush-logs');
const TARGETS_FILE = path.join(LOG_DIR, 'targets.json');
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
    
    const rarityRoll = rng();
    let rarity = 'common';
    let minStats = 5;
    if (rarityRoll < 0.01) { rarity = 'legendary'; minStats = 50; }
    else if (rarityRoll < 0.05) { rarity = 'epic'; minStats = 35; }
    else if (rarityRoll < 0.15) { rarity = 'rare'; minStats = 25; }
    else if (rarityRoll < 0.40) { rarity = 'uncommon'; minStats = 15; }
    
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
    
    const eyes = ['·', '✦', '×', '◉', '@', '°'];
    const selectedEye = eyes[Math.floor(rng() * eyes.length)];
    
    const hats = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'];
    let hat = 'none';
    if (['rare', 'epic', 'legendary'].includes(rarity)) {
        hat = hats[Math.floor(rng() * hats.length)];
    }
    
    const shiny = rng() < 0.01;
    
    const stats = [];
    for (let i = 0; i < 6; i++) {
        const stat = Math.max(minStats, Math.floor(rng() * 100));
        stats.push(stat);
    }
    const avgStats = Math.round(stats.reduce((a, b) => a + b, 0) / 6);
    
    const userId = 'f' + seed.toString(16).padStart(62, '0').slice(0, 63);
    
    return {
        userId, seed,
        species: selectedSpecies,
        speciesName: speciesNames[selectedSpecies],
        rarity, shiny,
        eye: selectedEye, hat,
        stats, avgStats
    };
}

// 主函数
async function main() {
    console.log('🎮 卡皮巴拉刷取工具 - 目标记录版');
    console.log('目标：闪光 ✨ + 金色眼睛 ✦ + 传奇 ⭐⭐⭐⭐⭐ + 卡皮巴拉');
    console.log('========================================');
    
    const startTime = Date.now();
    let iteration = 0;
    const targets = [];
    
    const DURATION_MS = 30 * 60 * 1000;
    
    while (Date.now() - startTime < DURATION_MS) {
        iteration++;
        const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const buddy = generateBuddy(seed);
        
        const isTarget = buddy.species === 'capybara' && 
                         buddy.rarity === 'legendary' && 
                         buddy.shiny && 
                         buddy.eye === '✦';
        
        if (isTarget) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            const target = {
                index: targets.length + 1,
                iteration,
                elapsed,
                timestamp: new Date().toISOString(),
                userId: buddy.userId,
                seed: buddy.seed,
                species: buddy.species,
                speciesName: buddy.speciesName,
                rarity: buddy.rarity,
                shiny: buddy.shiny,
                eye: buddy.eye,
                hat: buddy.hat,
                stats: buddy.stats,
                avgStats: buddy.avgStats
            };
            targets.push(target);
            
            // 实时保存到文件
            fs.writeFileSync(TARGETS_FILE, JSON.stringify(targets, null, 2));
            
            console.log(`🎯 #${targets.length} [${elapsed}s] 迭代 ${iteration.toLocaleString()}`);
            console.log(`   userID: ${buddy.userId}`);
            console.log(`   属性：${buddy.stats.join(', ')} | 平均：${buddy.avgStats}`);
        }
        
        // 每分钟报告
        if (iteration % 700000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
            console.log(`⏱️  ${elapsed}s: 迭代 ${iteration.toLocaleString()}, 找到 ${targets.length} 个目标`);
        }
    }
    
    // 生成总结
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const summary = `# 🎮 卡皮巴拉刷取报告

**时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
**时长:** ${totalTime}s (${(totalTime/60).toFixed(2)}分钟)
**总迭代:** ${iteration.toLocaleString()}
**找到目标:** ${targets.length} 个

## 📋 目标宠物列表

| # | 时间 (s) | 迭代次数 | userID | 属性 | 平均 |
|---|----------|----------|--------|------|------|
${targets.map(t => `| ${t.index} | ${t.elapsed} | ${t.iteration.toLocaleString()} | \`${t.userId}\` | ${t.stats.join(',')} | ${t.avgStats} |`).join('\n')}

## 🏆 Top 10 高属性

${targets.sort((a, b) => b.avgStats - a.avgStats).slice(0, 10).map((t, i) => `**#${i + 1}:** 平均 ${t.avgStats} | \`${t.userId}\` | ${t.elapsed}s`).join('\n')}

---
*文件：${TARGETS_FILE}*
`;
    
    fs.writeFileSync(SUMMARY_FILE, summary);
    
    console.log('\n========================================');
    console.log(`✅ 完成！找到 ${targets.length} 个目标`);
    console.log(`📄 详细数据：${TARGETS_FILE}`);
    console.log(`📄 总结报告：${SUMMARY_FILE}`);
}

main().catch(console.error);
