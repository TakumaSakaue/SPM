const fs = require('fs');
const path = require('path');

// 背景画像を保存するディレクトリ
const backgroundsDir = path.join(process.cwd(), 'public', 'backgrounds');

// SVG形式の背景画像を生成
const generateGradientSVG = (name, color1, color2) => {
  return `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad)" />
  <text x="400" y="300" font-family="Arial" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.5)">${name}</text>
</svg>
`;
};

// 色のリスト
const backgrounds = [
  { name: 'blue-purple', color1: '#3490dc', color2: '#6574cd' },
  { name: 'green-blue', color1: '#38c172', color2: '#3490dc' },
  { name: 'red-orange', color1: '#e3342f', color2: '#f6993f' },
  { name: 'purple-pink', color1: '#9561e2', color2: '#f66d9b' },
  { name: 'orange-yellow', color1: '#f6993f', color2: '#ffed4a' },
];

// 背景画像ディレクトリが存在するか確認、なければ作成
if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
  console.log(`ディレクトリを作成しました: ${backgroundsDir}`);
}

// 背景画像を生成して保存
backgrounds.forEach((bg) => {
  const svg = generateGradientSVG(bg.name, bg.color1, bg.color2);
  const filePath = path.join(backgroundsDir, `${bg.name}.svg`);
  
  fs.writeFileSync(filePath, svg);
  console.log(`背景画像を生成しました: ${filePath}`);
});

console.log('背景画像の生成が完了しました。'); 