#!/usr/bin/env node
// buddy-interactive.js
// Claude Code Buddy 交互式刷宠物工具 - 显示宠物图鉴让用户选择

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// === 常量 ===
const SALT = 'friend-2026-401';
const SPECIES = [
  'duck', 'goose', 'blob', 'cat', 'dragon', 'octopus', 'owl', 'penguin',
  'turtle', 'snail', 'ghost', 'axolotl', 'capybara', 'cactus', 'robot',
  'rabbit', 'mushroom', 'chonk'
];
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };
const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
const EYES = ['·', '✦', '×', '◉', '@', '°'];
const HATS = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'];
const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'];
const RARITY_FLOOR = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 };

// === 中英文映射 ===
const SPECIES_CN = {
  duck: '鸭子', goose: '鹅', blob: '史莱姆', cat: '猫', dragon: '龙',
  octopus: '章鱼', owl: '猫头鹰', penguin: '企鹅', turtle: '乌龟',
  snail: '蜗牛', ghost: '幽灵', axolotl: '蝾螈', capybara: '水豚',
  cactus: '仙人掌', robot: '机器人', rabbit: '兔子', mushroom: '蘑菇', chonk: '胖猫'
};

const RARITY_CN = {
  common: '普通', uncommon: '罕见', rare: '稀有', epic: '史诗', legendary: '传奇'
};

const RARITY_STARS = {
  common: '★', uncommon: '★★', rare: '★★★', epic: '★★★★', legendary: '★★★★★'
};

// === 哈希函数 ===
function hashBun(s) {
  return Number(BigInt(Bun.hash(s)) & 0xffffffffn);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function rollRarity(rng) {
  let roll = rng() * 100;
  for (const r of RARITIES) {
    roll -= RARITY_WEIGHTS[r];
    if (roll < 0) return r;
  }
  return 'common';
}

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity];
  const peak = pick(rng, STAT_NAMES);
  let dump = pick(rng, STAT_NAMES);
  while (dump === peak) dump = pick(rng, STAT_NAMES);
  
  const stats = {};
  for (const name of STAT_NAMES) {
    if (name === peak) {
      stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30));
    } else if (name === dump) {
      stats[name] = Math.max(1, floor - 10 + Math.floor(rng() * 15));
    } else {
      stats[name] = floor + Math.floor(rng() * 40);
    }
  }
  return stats;
}

function rollFull(uid) {
  const rng = mulberry32(hashBun(uid + SALT));
  const rarity = rollRarity(rng);
  const species = pick(rng, SPECIES);
  const eye = pick(rng, EYES);
  const hat = rarity === 'common' ? 'none' : pick(rng, HATS);
  const shiny = rng() < 0.01;
  const stats = rollStats(rng, rarity);
  return { rarity, species, eye, hat, shiny, stats };
}

// === 显示宠物图鉴 ===
function showGallery() {
  console.log('\n🎮 Claude Code Buddy 宠物图鉴\n');
  console.log('═'.repeat(60));
  console.log('');
  
  // 按 3 列显示
  const columns = 3;
  for (let i = 0; i < SPECIES.length; i += columns) {
    let line = '';
    for (let j = 0; j < columns && (i + j) < SPECIES.length; j++) {
      const species = SPECIES[i + j];
      const cn = SPECIES_CN[species];
      const num = String(i + j + 1).padStart(2, ' ');
      line += `${num}. ${species.padEnd(12)} (${cn.padEnd(4)})  `;
    }
    console.log(line);
  }
  
  console.log('');
  console.log('═'.repeat(60));
  console.log('');
}

// === 主程序 ===
const args = process.argv.slice(2);

if (args.includes('--gallery') || args.includes('-g')) {
  showGallery();
  console.log('💡 使用方法:');
  console.log('   bun buddy-interactive.js <宠物名> [稀有度] [最小属性]');
  console.log('');
  console.log('示例:');
  console.log('   bun buddy-interactive.js dragon legendary 80');
  console.log('   bun buddy-interactive.js duck legendary 90 --shiny');
  console.log('');
  console.log('💡 提示：使用启动工具更简单 (双击 启动工具.ps1)');
  console.log('');
  process.exit(0);
}

// 解析参数
const species = args[0];
const rarity = args[1] || 'legendary';
const minStats = parseInt(args[2]) || 80;
const shiny = args.includes('--shiny');
const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1]) || 3;

if (!species) {
  console.log('❌ 请指定宠物名称\n');
  showGallery();
  process.exit(1);
}

if (!SPECIES.includes(species)) {
  console.log(`❌ 未知物种：${species}`);
  console.log(`可用：${SPECIES.join(', ')}`);
  process.exit(1);
}

if (!RARITIES.includes(rarity)) {
  console.log(`❌ 未知稀有度：${rarity}`);
  console.log(`可用：${RARITIES.join(', ')}`);
  process.exit(1);
}

// 开始寻找
console.log(`\n🎯 寻找目标：${RARITY_CN[rarity]} ${SPECIES_CN[species]} (${species})`);
console.log(`   最小属性：${minStats}`);
console.log(`   闪光要求：${shiny ? '是 ✨' : '否'}`);
console.log(`   查找数量：${count}`);
console.log('');
console.log('开始寻找...\n');

const minRarityRank = RARITY_RANK[rarity];
let found = 0;
const startTime = Date.now();

for (let i = 0; i < 50_000_000; i++) {
  const uid = crypto.randomBytes(32).toString('hex');
  const r = rollFull(uid);
  
  if (RARITY_RANK[r.rarity] < minRarityRank) continue;
  if (r.species !== species) continue;
  if (shiny && !r.shiny) continue;
  if (!Object.values(r.stats).every(v => v >= minStats)) continue;
  
  found++;
  const avgStats = Math.round(Object.values(r.stats).reduce((a, b) => a + b, 0) / 5);
  
  console.log(`✅ #${found} 找到匹配！`);
  console.log(`   物种：${SPECIES_CN[r.species]} (${r.species})`);
  console.log(`   稀有度：${RARITY_CN[r.rarity]} ${RARITY_STARS[r.rarity]}`);
  console.log(`   眼睛：${r.eye}`);
  console.log(`   帽子：${r.hat === 'none' ? '无' : r.hat}`);
  console.log(`   闪光：${r.shiny ? '✨ 是' : '否'}`);
  console.log(`   属性:`);
  for (const name of STAT_NAMES) {
    const val = r.stats[name];
    const bar = '█'.repeat(Math.floor(val / 5)) + '░'.repeat(20 - Math.floor(val / 5));
    console.log(`     ${name.padEnd(10)} ${bar} ${val}`);
  }
  console.log(`   平均属性：${avgStats}`);
  console.log(`   userID: ${uid}`);
  console.log('');
  
  if (found >= count) break;
  
  // 进度显示
  if ((i + 1) % 1_000_000 === 0) {
    process.stdout.write(`\r🔍 已寻找 ${((i + 1) / 1_000_000).toFixed(1)}M 次...`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

if (found === 0) {
  console.log(`\n❌ 未找到匹配结果 (${elapsed}s)`);
  console.log(`💡 提示：尝试降低 --min-stats 值或放宽其他条件\n`);
} else {
  console.log(`\n🎉 寻找完成！找到 ${found} 个匹配结果，耗时 ${elapsed}s\n`);
  console.log('📝 下一步操作:');
  console.log('   1. 复制上面的 userID');
  console.log('   2. 写入 ~/.claude.json 的 accountUuid 字段');
  console.log('   3. 重新启动 claude 并输入 /buddy\n');
}
