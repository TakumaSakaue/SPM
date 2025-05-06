import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 背景画像ディレクトリのパス
    const backgroundsDir = path.join(process.cwd(), 'public', 'backgrounds');
    
    // ディレクトリが存在するか確認
    if (!fs.existsSync(backgroundsDir)) {
      fs.mkdirSync(backgroundsDir, { recursive: true });
    }
    
    // ディレクトリ内のファイル一覧を取得
    const files = fs.readdirSync(backgroundsDir);
    
    // 画像ファイルのみをフィルタリング（拡張子で判断）
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });
    
    // ファイル名と画像のパスを返す
    const backgrounds = imageFiles.map(file => {
      // ユーザーがアップロードした画像かどうかを判断
      const isUserUploaded = file.startsWith('user_');
      
      return {
        id: path.parse(file).name,
        name: isUserUploaded 
          ? `ユーザー画像 ${path.parse(file).name.split('_')[1]}` 
          : path.parse(file).name.replace(/[-_]/g, ' '),
        path: `/backgrounds/${file}`,
        isUserUploaded
      };
    });
    
    // デフォルト画像を先頭に、ユーザーアップロード画像を次に、その他を最後に並べ替え
    backgrounds.sort((a, b) => {
      if (a.id === 'default') return -1;
      if (b.id === 'default') return 1;
      if (a.isUserUploaded && !b.isUserUploaded) return -1;
      if (!a.isUserUploaded && b.isUserUploaded) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({ backgrounds });
  } catch (error) {
    console.error('背景画像の取得エラー:', error);
    return NextResponse.json(
      { error: '背景画像の取得に失敗しました' },
      { status: 500 }
    );
  }
} 