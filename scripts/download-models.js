const fs = require('fs')
const path = require('path')
const https = require('https')

// モデルファイルのダウンロード先
const modelsDir = path.join(__dirname, '../public/models')

// 必要なモデルファイル (CDN URL)
const modelFiles = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/tiny_face_detector_model-shard1'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_landmark_68_model-shard1'
  },
  {
    name: 'face_expression_model-weights_manifest.json',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-weights_manifest.json'
  },
  {
    name: 'face_expression_model-shard1',
    url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/face_expression_model-shard1'
  }
]

// ディレクトリが存在しない場合は作成
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`ディレクトリを作成しました: ${dirPath}`)
  }
}

// ファイルをダウンロード
const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    console.log(`ダウンロード中: ${url}`)
    
    const file = fs.createWriteStream(destPath)
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`ダウンロードに失敗しました: ${response.statusCode} ${response.statusMessage}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`ダウンロード完了: ${destPath}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}) // 不完全なファイルを削除
      reject(err)
    })
  })
}

// メイン関数
const main = async () => {
  try {
    // モデルディレクトリの作成
    createDirectoryIfNotExists(modelsDir)
    
    // モデルファイルのダウンロード
    const downloads = []
    
    for (const model of modelFiles) {
      const filePath = path.join(modelsDir, model.name)
      
      // 既にファイルが存在する場合はスキップ
      if (fs.existsSync(filePath)) {
        console.log(`ファイルは既に存在します: ${filePath}`)
        continue
      }
      
      downloads.push(downloadFile(model.url, filePath))
    }
    
    await Promise.all(downloads)
    console.log('すべてのモデルファイルのダウンロードが完了しました!')
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }
}

main() 