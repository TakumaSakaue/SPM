import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }
    
    // 許可されるMIMEタイプを確認
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '許可されていないファイル形式です。JPEG, PNG, GIF, WEBP, SVGのみ許可されています。' },
        { status: 400 }
      );
    }
    
    // ファイルサイズの制限（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }
    
    // オリジナルのファイル名から拡張子を取得
    const originalName = file.name;
    const fileExt = path.extname(originalName).toLowerCase();
    
    // ファイル名のサニタイズ: アルファベット、数字、ハイフン、アンダースコアのみ許可
    const baseName = path.basename(originalName, fileExt)
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .toLowerCase();
    
    // タイムスタンプをファイル名に追加して一意性を確保
    const timestamp = Date.now();
    const newFileName = `user_${baseName}_${timestamp}${fileExt}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'backgrounds');
    
    // ディレクトリが存在することを確認
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, newFileName);
    
    // ファイルデータをバイナリ配列に変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ファイルを保存
    await writeFile(filePath, buffer);
    
    // レスポンスを返す
    return NextResponse.json({ 
      success: true, 
      fileName: newFileName,
      path: `/backgrounds/${newFileName}`
    });
    
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
} 