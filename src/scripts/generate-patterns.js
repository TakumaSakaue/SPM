const fs = require('fs');
const path = require('path');

// 背景画像を保存するディレクトリ
const backgroundsDir = path.join(process.cwd(), 'public', 'backgrounds');

// ドットパターンのSVG生成
const generateDotsSVG = (name, bgColor, patternColor) => {
  let dots = '';
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * 800);
    const y = Math.floor(Math.random() * 600);
    const size = Math.floor(Math.random() * 5) + 2;
    dots += `<circle cx="${x}" cy="${y}" r="${size}" opacity="0.5" />`;
  }

  return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="${bgColor}" />
  <g fill="${patternColor}">${dots}</g>
  <text x="400" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.5)">${name}</text>
</svg>`;
};

// ラインパターンのSVG生成
const generateLinesSVG = (name, bgColor, patternColor) => {
  let lines = '';
  
  // 横線
  for (let i = 0; i < 20; i++) {
    const y = i * 30;
    lines += `<line x1="0" y1="${y}" x2="800" y2="${y}" />`;
  }
  
  // 縦線
  for (let i = 0; i < 20; i++) {
    const x = i * 40;
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="600" />`;
  }

  return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="${bgColor}" />
  <g stroke="${patternColor}" stroke-width="1" opacity="0.3">${lines}</g>
  <text x="400" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.5)">${name}</text>
</svg>`;
};

// 波線パターンのSVG生成
const generateWavesSVG = (name, bgColor, patternColor) => {
  let waves = '';
  
  for (let i = 0; i < 10; i++) {
    const y = i * 60 + 20;
    waves += `<path d="M0 ${y} Q 200 ${y + 30}, 400 ${y} T 800 ${y}" />`;
  }

  return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="${bgColor}" />
  <g stroke="${patternColor}" stroke-width="2" fill="none" opacity="0.2">${waves}</g>
  <text x="400" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.5)">${name}</text>
</svg>`;
};

// パターンのリスト
const patterns = [
  { name: 'dots-blue', type: 'dots', bgColor: '#1e3a8a', patternColor: '#ffffff' },
  { name: 'lines-green', type: 'lines', bgColor: '#065f46', patternColor: '#ffffff' },
  { name: 'waves-purple', type: 'waves', bgColor: '#5b21b6', patternColor: '#ffffff' },
  { name: 'dots-dark', type: 'dots', bgColor: '#111827', patternColor: '#9ca3af' },
  { name: 'lines-warm', type: 'lines', bgColor: '#7c2d12', patternColor: '#fbbf24' },
];

// 背景画像ディレクトリが存在するか確認、なければ作成
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
  console.log(`ディレクトリを作成しました: ${backgroundsDir}`);
}

// パターン背景を生成して保存
patterns.forEach((p) => {
  let svg = '';
  
  // パターンタイプに応じた生成関数を呼び出す
  if (p.type === 'dots') {
    svg = generateDotsSVG(p.name, p.bgColor, p.patternColor);
  } else if (p.type === 'lines') {
    svg = generateLinesSVG(p.name, p.bgColor, p.patternColor);
  } else if (p.type === 'waves') {
    svg = generateWavesSVG(p.name, p.bgColor, p.patternColor);
  }
  
  const filePath = path.join(backgroundsDir, `${p.name}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`パターン背景を生成しました: ${filePath}`);
});

console.log('パターン背景の生成が完了しました。'); 