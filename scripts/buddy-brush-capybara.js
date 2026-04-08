#!/usr/bin/env bun
/**
 * 卡皮巴拉刷取脚本 - 持续运行并记录日志
 * 目标：闪光 + 金色眼睛 + 传奇 + 高属性
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const LOG_FILE = path.join(__dirname, '../../buddy-brush-log.md');
const RESULTS_FILE = path.join(__dirname, '../../buddy-results.json');

// 加载宠物生成逻辑
const buddyRerollPath = path.join(__dirname, 'buddy-reroll.js');

// Mulberry32 PRNG (与 Claude Code 一致)
function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// 生成宠物 (简化版，用于快速检查)
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
    
    return {
        species: selectedSpecies,
        speciesName: selectedSpecies === 'capybara' ? '卡皮巴拉' : selectedSpecies,
        rarity,
        shiny,
        eye: selectedEye,
        hat,
        stats,
        totalStats,
        avgStats
    };
}

// 检查是否为目标宠物
function isTargetBuddy(buddy) {
    return buddy.species === 'capybara' && 
           buddy.rarity === 'legendary' && 
           buddy.shiny && 
           buddy.eye === '✦';
}

// 记录结果
function logResult(buddy, iteration, elapsedTime) {
    const timestamp = new Date().toISOString();
    const logLine = `| ${iteration.toLocaleString()} | ${timestamp} | ${buddy.rarity} | ${buddy.shiny ? '✨' : '○'} | ${buddy.eye} | ${buddy.avgStats} | ${buddy.species === 'capybara' ? '🎯' : ''} |\n`;
    
    // 追加到日志
    fs.appendFileSync(LOG_FILE.replace('.md', '-detailed.md'), logLine);
    
    // 保存 JSON
    const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8') || '{"results":[],"stats":{}}');
    results.results.push({
        iteration,
        timestamp,
        elapsedTime,
        ...buddy
    });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

// 主循环
async function main() {
    console.log('🎮 卡皮巴拉刷取工具启动');
    console.log('目标：闪光 ✨ + 金色眼睛 ✦ + 传奇 ⭐⭐⭐⭐⭐ + 卡皮巴拉');
    console.log('========================================');
    
    const startTime = Date.now();
    let iteration = 0;
    let legendaryCount = 0;
    let shinyCount = 0;
    let capybaraCount = 0;
    let targetCount = 0;
    let bestStats = 0;
    let bestBuddy = null;
    
    // 初始化日志
    fs.writeFileSync(RESULTS_FILE, JSON.stringify({results:[], stats:{}}, null, 2));
    fs.writeFileSync(LOG_FILE.replace('.md', '-detailed.md'), 
        '| 迭代次数 | 时间戳 | 稀有度 | 闪光 | 眼睛 | 平均属性 | 卡皮巴拉 |\n|----------|--------|--------|------|------|----------|----------|\n');
    
    // 运行 30 分钟 = 1800 秒
    const DURATION_MS = 30 * 60 * 1000;
    const REPORT_INTERVAL = 60 * 1000; // 每分钟报告一次
    let lastReport = startTime;
    
    while (Date.now() - startTime < DURATION_MS) {
        iteration++;
        
        // 生成随机种子
        const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const buddy = generateBuddy(seed);
        
        // 统计
        if (buddy.rarity === 'legendary') legendaryCount++;
        if (buddy.shiny) shinyCount++;
        if (buddy.species === 'capybara') capybaraCount++;
        if (buddy.avgStats > bestStats) {
            bestStats = buddy.avgStats;
            bestBuddy = buddy;
        }
        
        // 记录传奇或闪光
        if (buddy.rarity === 'legendary' || buddy.shiny) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            logResult(buddy, iteration, elapsed);
            console.log(`[${elapsed}s] 迭代 ${iteration.toLocaleString()}: ${buddy.species} - ${buddy.rarity} ${buddy.shiny ? '✨' : ''} 眼睛:${buddy.eye} 属性:${buddy.avgStats}`);
        }
        
        // 找到目标！
        if (isTargetBuddy(buddy)) {
            targetCount++;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\n🎉🎉🎉 找到目标！[${elapsed}s] 迭代 ${iteration.toLocaleString()}`);
            console.log(`卡皮巴拉 - 传奇 ✨ 金色眼睛 ✦ 属性:${buddy.avgStats}`);
            console.log(`属性详情：${buddy.stats.join(', ')}\n`);
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
    }
    
    // 最终报告
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const iterationsPerSecond = (iteration / (Date.now() - startTime) * 1000).toFixed(1);
    
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
    console.log(`目标数量 (闪光 + 金眼 + 传奇 + 卡皮巴拉)：${targetCount}`);
    console.log('----------------------------------------');
    console.log(`最佳属性：${bestStats} (${bestBuddy?.species} ${bestBuddy?.rarity})`);
    if (bestBuddy) {
        console.log(`最佳宠物详情：${bestBuddy.species} - ${bestBuddy.rarity} ${bestBuddy.shiny ? '✨' : ''} 眼睛:${bestBuddy.eye} 帽子:${bestBuddy.hat}`);
        console.log(`属性：${bestBuddy.stats.join(', ')}`);
    }
    console.log('========================================');
    
    // 更新日志文件
    const finalLog = fs.readFileSync(LOG_FILE, 'utf8')
        .replace('**开始时间：** 2026-04-06 17:05 (Asia/Shanghai)', `**开始时间：** 2026-04-06 17:05 (Asia/Shanghai)\n**结束时间：** 2026-04-06 ${(new Date().getHours().toString().padStart(2,'0'))}:${(new Date().getMinutes().toString().padStart(2,'0'))} (Asia/Shanghai)`)
        .replace('**总运行时间：** ', `**总运行时间：** ${totalTime}s (${(totalTime/60).toFixed(2)}分钟)`)
        .replace('**总迭代次数：** ', `**总迭代次数：** ${iteration.toLocaleString()}`)
        .replace('**找到传奇数量：** ', `**找到传奇数量：** ${legendaryCount}`)
        .replace('**找到闪光数量：** ', `**找到闪光数量：** ${shinyCount}`)
        .replace('**最佳属性：** ', `**最佳属性：** ${bestStats} (${bestBuddy?.species})`);
    
    fs.writeFileSync(LOG_FILE, finalLog);
    
    console.log(`\n📄 详细日志已保存到：${LOG_FILE}`);
    console.log(`📄 JSON 结果已保存到：${RESULTS_FILE}`);
}

main().catch(console.error);
