import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
  try {
    // URLからファイル名を取得
    const url = new URL(request.url);
    const fileName = url.searchParams.get('fileName');
    
    if (!fileName) {
      return NextResponse.json(
        { error: 'ファイル名が指定されていません' },
        { status: 400 }
      );
    }
    
    // ユーザーがアップロードしたファイルのみ削除可能にする
    if (!fileName.startsWith('user_')) {
      return NextResponse.json(
        { error: 'システムファイルは削除できません' },
        { status: 403 }
      );
    }
    
    // ファイルパスのサニタイズ（パストラバーサル攻撃の防止）
    const sanitizedFileName = path.basename(fileName);
    const filePath = path.join(process.cwd(), 'public', 'backgrounds', sanitizedFileName);
    
    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: '指定されたファイルが見つかりません' },
        { status: 404 }
      );
    }
    
    // ファイル削除
    fs.unlinkSync(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'ファイルを削除しました'
    });
    
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return NextResponse.json(
      { error: 'ファイルの削除に失敗しました' },
      { status: 500 }
    );
  }
} 