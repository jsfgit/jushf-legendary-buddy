#!/usr/bin/env node
// buddy-reroll.js
// Claude Code Buddy 宠物刷取脚本 - 支持 Node.js 和 Bun
// Bun.hash 结果与 Claude Code 实际匹配；Node.js (FNV-1a) 不匹配

const crypto = require('crypto');

// === 常量（必须与 Claude Code 源码一致）===
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

// === 哈希函数 ===
function hashFNV1a(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hashBun(s) {
  return Number(BigInt(Bun.hash(s)) & 0xffffffffn);
}

// === PRNG (Mulberry32 - 与 Claude Code 一致) ===
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

function createRoller(hashFn) {
  return function rollFull(uid) {
    const rng = mulberry32(hashFn(uid + SALT));
    const rarity = rollRarity(rng);
    const species = pick(rng, SPECIES);
    const eye = pick(rng, EYES);
    const hat = rarity === 'common' ? 'none' : pick(rng, HATS);
    const shiny = rng() < 0.01;
    const stats = rollStats(rng, rarity);
    return { rarity, species, eye, hat, shiny, stats };
  };
}

// === 解析命令行参数 ===
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { max: 50_000_000, count: 3, minStatsVal: 90 };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--species': opts.species = args[++i]; break;
      case '--rarity': opts.rarity = args[++i]; break;
      case '--eye': opts.eye = args[++i]; break;
      case '--hat': opts.hat = args[++i]; break;
      case '--shiny': opts.shiny = true; break;
      case '--min-stats': {
        const next = args[i + 1];
        opts.minStatsVal = (next && !next.startsWith('--')) ? parseInt(args[++i]) : 90;
        break;
      }
      case '--max': opts.max = parseInt(args[++i]); break;
      case '--count': opts.count = parseInt(args[++i]); break;
      case '--check': opts.check = args[++i]; break;
      case '--json': opts.json = true; break;
      case '--help': case '-h':
        printHelp();
        process.exit(0);
    }
  }
  
  // 验证参数
  if (opts.species && !SPECIES.includes(opts.species)) {
    console.error(`❌ 未知物种：${opts.species}`);
    console.error(`可用：${SPECIES.join(', ')}`);
    process.exit(1);
  }
  if (opts.rarity && !RARITIES.includes(opts.rarity)) {
    console.error(`❌ 未知稀有度：${opts.rarity}`);
    console.error(`可用：${RARITIES.join(', ')}`);
    process.exit(1);
  }
  if (opts.eye && !EYES.includes(opts.eye)) {
    console.error(`❌ 未知眼睛：${opts.eye}`);
    console.error(`可用：${EYES.join(' ')}`);
    process.exit(1);
  }
  if (opts.hat && !HATS.includes(opts.hat)) {
    console.error(`❌ 未知帽子：${opts.hat}`);
    console.error(`可用：${HATS.join(', ')}`);
    process.exit(1);
  }
  
  return opts;
}

function printHelp() {
  console.log(`
 Claude Code Buddy 刷宠物工具

用法：
  node buddy-reroll.js [选项]
  bun buddy-reroll.js [选项]

选项：
  --species <name>   目标物种：${SPECIES.join(', ')}
  --rarity <name>    最低稀有度：${RARITIES.join(', ')}
  --eye <char>       目标眼睛：${EYES.join(' ')}
  --hat <name>       目标帽子：${HATS.join(', ')}
  --shiny            要求闪光
  --min-stats <val>  所有属性 >= 值 (默认：90)
  --max <number>     最大迭代次数 (默认：50000000)
  --count <number>   查找结果数量 (默认：3)
  --check <uid>      检查特定 userID 生成什么宠物
  --json             输出 JSON 格式（便于程序调用）
  --help, -h         显示帮助

示例：
  bun buddy-reroll.js --species dragon --rarity legendary
  bun buddy-reroll.js --species duck --min-stats 95 --shiny
  bun buddy-reroll.js --check f17c2742a00b2345c22fddc830959a6847ceb561fa06adb26b74b1a91ac657bc

⚠️  重要：必须使用 Bun 运行才能获得与 Claude Code 匹配的结果！
`);
}

// === 主程序 ===
const opts = parseArgs();
const isBun = typeof Bun !== 'undefined';
const hashFn = isBun ? hashBun : hashFNV1a;
const rollFull = createRoller(hashFn);
const runtimeLabel = isBun ? 'Bun (Bun.hash) ✅' : 'Node.js (FNV-1a) ❌';

const RARITY_STARS = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  epic: '★★★★',
  legendary: '★★★★★'
};

const RARITY_CN = {
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  epic: '史诗',
  legendary: '传奇'
};

const SPECIES_CN = {
  duck: '鸭子', goose: '鹅', blob: '史莱姆', cat: '猫', dragon: '龙',
  octopus: '章鱼', owl: '猫头鹰', penguin: '企鹅', turtle: '乌龟',
  snail: '蜗牛', ghost: '幽灵', axolotl: '蝾螈', capybara: '水豚',
  cactus: '仙人掌', robot: '机器人', rabbit: '兔子', mushroom: '蘑菇', chonk: '胖猫'
};

// 检查模式
if (opts.check) {
  if (!opts.json) {
    console.log(`运行环境：${runtimeLabel}`);
    console.log(`检查 userID: ${opts.check}\n`);
  }
  
  const r = rollFull(opts.check);
  
  if (opts.json) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`  物种  : ${SPECIES_CN[r.species] || r.species} (${r.species})`);
    console.log(`  稀有度：${RARITY_CN[r.rarity]} ${RARITY_STARS[r.rarity]}`);
    console.log(`  眼睛  : ${r.eye}`);
    console.log(`  帽子  : ${r.hat === 'none' ? '无' : r.hat}`);
    console.log(`  闪光  : ${r.shiny ? '✨ 是' : '否'}`);
    console.log(`  属性  :`);
    for (const name of STAT_NAMES) {
      const val = r.stats[name];
      const bar = '█'.repeat(Math.floor(val / 5)) + '░'.repeat(20 - Math.floor(val / 5));
      console.log(`    ${name.padEnd(10)} ${bar} ${val}`);
    }
  }
  process.exit(0);
}

// 构建过滤条件
const filters = [];
if (opts.species) filters.push(`物种=${SPECIES_CN[opts.species] || opts.species}`);
if (opts.rarity) filters.push(`稀有度≥${RARITY_CN[opts.rarity]}`);
if (opts.eye) filters.push(`眼睛=${opts.eye}`);
if (opts.hat) filters.push(`帽子=${opts.hat}`);
if (opts.shiny) filters.push('闪光=是');
if (opts.minStatsVal) filters.push(`全属性≥${opts.minStatsVal}`);

if (!opts.json) {
  console.log(`🎮 Claude Code Buddy 刷宠物工具`);
  console.log(`运行环境：${runtimeLabel}`);
  if (!isBun) {
    console.log(`⚠️  警告：Node.js 模式结果不与 Claude Code 匹配，请使用 Bun 运行！\n`);
  } else {
    console.log('');
  }
  console.log(`搜索条件：${filters.join(', ') || '任意'} (最多 ${opts.max.toLocaleString()}, 查找 ${opts.count} 个)`);
  console.log('');
}

const minRarityRank = opts.rarity ? RARITY_RANK[opts.rarity] : 0;
let found = 0;
const results = [];
const startTime = Date.now();

for (let i = 0; i < opts.max; i++) {
  const uid = crypto.randomBytes(32).toString('hex');
  const r = rollFull(uid);
  
  if (opts.rarity && RARITY_RANK[r.rarity] < minRarityRank) continue;
  if (opts.species && r.species !== opts.species) continue;
  if (opts.eye && r.eye !== opts.eye) continue;
  if (opts.hat && r.hat !== opts.hat) continue;
  if (opts.shiny && !r.shiny) continue;
  if (opts.minStatsVal && !Object.values(r.stats).every(v => v >= opts.minStatsVal)) continue;
  
  found++;
  const statsStr = STAT_NAMES.map(n => `${n}:${r.stats[n]}`).join(' ');
  const avgStats = Math.round(Object.values(r.stats).reduce((a, b) => a + b, 0) / 5);
  
  if (opts.json) {
    results.push({ uid, ...r, avgStats });
  } else {
    console.log(`#${found} [${RARITY_CN[r.rarity]}] ${SPECIES_CN[r.species] || r.species} (${r.species})`);
    console.log(`  稀有度：${RARITY_STARS[r.rarity]} 眼睛:${r.eye} 帽子:${r.hat} 闪光:${r.shiny ? '✨' : '❌'}`);
    console.log(`  属性：${statsStr} (平均：${avgStats})`);
    console.log(`  userID: ${uid}`);
    console.log('');
  }
  
  if (found >= opts.count) break;
  
  // 每 100 万次显示进度
  if ((i + 1) % 1_000_000 === 0 && !opts.json) {
    process.stdout.write(`\r已搜索 ${((i + 1) / 1_000_000).toFixed(1)}M 次...`);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

if (opts.json) {
  console.log(JSON.stringify({
    runtime: runtimeLabel,
    found: results.length,
    elapsed: parseFloat(elapsed),
    results: results
  }, null, 2));
} else {
  if (found === 0) {
    console.log(`❌ 在 ${opts.max.toLocaleString()} 次迭代中未找到匹配 (${elapsed}s)`);
    console.log(`提示：尝试降低 --min-stats 值或放宽其他条件`);
  } else {
    console.log(`✅ 找到 ${found} 个匹配结果，耗时 ${elapsed}s`);
    console.log(`\n💡 使用方法：将上面的 userID 写入 ~/.claude.json 的 accountUuid 字段`);
  }
}
