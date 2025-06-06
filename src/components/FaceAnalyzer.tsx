'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'
import dynamic from 'next/dynamic'

// 動的にEmotionDashboardをインポート（SSRを無効化）
const EmotionDashboard = dynamic(() => import('./EmotionDashboard'), { ssr: false })

type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'

// プロパティの型定義を追加
interface FaceAnalyzerProps {
  onFaceDetected?: (
    face: { x: number; y: number; width: number; height: number } | null,
    emotion: Emotion
  ) => void;
}

const emotionEmojis: Record<Emotion, string> = {
  neutral: '😐',
  happy: '😄',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲'
}

// 感情の日本語表記
const emotionLabels: Record<Emotion, string> = {
  neutral: '無表情',
  happy: '喜び',
  sad: '悲しみ',
  angry: '怒り',
  fearful: '恐れ',
  disgusted: '嫌悪',
  surprised: '驚き'
}

// 感情の説明
const emotionDescriptions: Record<Emotion, string> = {
  neutral: '特に強い感情は表れていません。平静な状態です。',
  happy: '喜びの感情が表れています。ポジティブな反応を示しています。',
  sad: '悲しみの感情が表れています。心配事がある可能性があります。',
  angry: '怒りの感情が表れています。不満を感じています。',
  fearful: '恐れの感情が表れています。不安を感じているようです。',
  disgusted: '嫌悪の感情が表れています。何かに対して否定的な反応をしています。',
  surprised: '驚きの感情が表れています。予想外の情報に反応しています。'
}

// モデルのCDN URL
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export default function FaceAnalyzer({ onFaceDetected }: FaceAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral')
  const [allEmotions, setAllEmotions] = useState<Record<Emotion, number> | null>(null)
  const [fps, setFps] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 })
  const [isStreamStarted, setIsStreamStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [isDetecting, setIsDetecting] = useState(true)
  const [modelSize, setModelSize] = useState<'tiny' | 'normal'>('tiny')
  const [detectedFace, setDetectedFace] = useState<faceapi.FaceDetection | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [audioVisualization, setAudioVisualization] = useState<number[]>(Array(20).fill(0))
  
  // 音声のシミュレーション
  useEffect(() => {
    if (isListening) {
      const simulateAudio = () => {
        const newVisualization = audioVisualization.map(() => {
          // ランダムな波形を生成（値が大きいほど高い波形になる）
          return Math.random() * 0.8 + 0.2; // 0.2～1.0の範囲で変動
        });
        setAudioVisualization(newVisualization);
      };
      
      // 100msごとに波形を更新
      const interval = setInterval(simulateAudio, 100);
      return () => clearInterval(interval);
    } else {
      // リスニング状態でない場合は徐々に波形を小さくする
      const fadeOut = () => {
        setAudioVisualization(prev => 
          prev.map(value => Math.max(0, value * 0.9))
        );
      };
      
      const interval = setInterval(fadeOut, 100);
      return () => clearInterval(interval);
    }
  }, [isListening, audioVisualization]);
  
  // マイクのON/OFFを切り替える
  const toggleListening = () => {
    console.log("マイクボタンがクリックされました");
    setIsListening(prev => !prev);
  };
  
  // パーティクルエフェクトのために顔データを親コンポーネントに送信
  useEffect(() => {
    if (onFaceDetected && detectedFace) {
      onFaceDetected(
        {
          x: detectedFace.box.x,
          y: detectedFace.box.y,
          width: detectedFace.box.width,
          height: detectedFace.box.height
        },
        currentEmotion
      );
    } else if (onFaceDetected) {
      onFaceDetected(null, currentEmotion);
    }
  }, [detectedFace, currentEmotion, onFaceDetected]);
  
  // 顔分析モデルをロードする
  const loadModels = async () => {
    try {
      console.log('モデルのロードを開始しています...');
      
      // 必要なモデルを並行してロード（CDNから直接）
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      setIsModelLoaded(true);
      console.log('顔分析モデルのロードが完了しました');
    } catch (error) {
      console.error('モデルのロード中にエラーが発生しました:', error);
      setError(`モデルのロード中にエラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // カメラストリームを開始
  const startVideo = async () => {
    if (!videoRef.current) {
      setError('ビデオ要素が見つかりません');
      return;
    }
    
    try {
      console.log('カメラへのアクセスをリクエスト中...');
      
      // 明示的にカメラへのアクセスを要求
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: dimensions.width },
          height: { ideal: dimensions.height },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('カメラアクセス許可されました');
      
      // ビデオ要素にストリームを設定
      videoRef.current.srcObject = stream;
      
      // ビデオが読み込まれた時の処理
      videoRef.current.onloadedmetadata = () => {
        console.log('ビデオメタデータがロードされました');
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            console.log('ビデオ再生開始');
            setIsStreamStarted(true);
          }).catch(err => {
            console.error('ビデオ再生エラー:', err);
            setError(`ビデオ再生エラー: ${err.message}`);
          });
        }
      };
    } catch (error) {
      console.error('カメラへのアクセス中にエラーが発生しました:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可してください。');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setError('カメラが見つかりません。カメラが接続されていることを確認してください。');
      } else {
        setError(`カメラエラー: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  // 顔分析を実行
  const detectFaces = async () => {
    if (!isModelLoaded || !videoRef.current || !canvasRef.current || !isDetecting) return;
    
    // キャンバスのコンテキストを取得
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // パフォーマンス計測を開始
    const startTime = performance.now();
    
    try {
      // 顔検出を実行（モデルサイズに応じて設定を変更）
      const faceDetectorOptions = modelSize === 'tiny' 
        ? new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        : new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
        
      // 顔検出を実行
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        faceDetectorOptions
      )
        .withFaceLandmarks()
        .withFaceExpressions();
      
      // 検出結果をキャンバスのサイズに合わせる
      const resizedDetections = faceapi.resizeResults(detections, {
        width: canvas.width,
        height: canvas.height
      });
      
      // キャンバスをクリア
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // 近未来的なスキャン効果
      context.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      context.lineWidth = 1;
      
      // スキャンラインの描画
      const scanLineY = (Date.now() % 2000) / 2000 * canvas.height;
      context.beginPath();
      context.moveTo(0, scanLineY);
      context.lineTo(canvas.width, scanLineY);
      context.stroke();
      
      // グリッドパターンの描画
      const gridSize = 40;
      context.beginPath();
      for (let x = 0; x < canvas.width; x += gridSize) {
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
      }
      context.stroke();
      
      // 検出結果を描画
      if (resizedDetections.length > 0) {
        const detection = resizedDetections[0];
        setDetectedFace(detection.detection);
        
        // カスタム描画スタイル
        const drawOptions = {
          lineWidth: 2,
          drawLines: true,
          color: 'rgba(0, 255, 255, 0.8)'
        };
        
        // 顔の輪郭と特徴点を描画
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        // 顔検出ボックスをカスタム描画
        const box = detection.detection.box;
        
        // 顔の周りに近未来的なボックスを描画
        context.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        context.lineWidth = 2;
        
        // ボックスの角のみを描画して未来的な雰囲気に
        const cornerSize = 20;
        
        // 左上
        context.beginPath();
        context.moveTo(box.x, box.y + cornerSize);
        context.lineTo(box.x, box.y);
        context.lineTo(box.x + cornerSize, box.y);
        context.stroke();
        
        // 右上
        context.beginPath();
        context.moveTo(box.x + box.width - cornerSize, box.y);
        context.lineTo(box.x + box.width, box.y);
        context.lineTo(box.x + box.width, box.y + cornerSize);
        context.stroke();
        
        // 左下
        context.beginPath();
        context.moveTo(box.x, box.y + box.height - cornerSize);
        context.lineTo(box.x, box.y + box.height);
        context.lineTo(box.x + cornerSize, box.y + box.height);
        context.stroke();
        
        // 右下
        context.beginPath();
        context.moveTo(box.x + box.width - cornerSize, box.y + box.height);
        context.lineTo(box.x + box.width, box.y + box.height);
        context.lineTo(box.x + box.width, box.y + box.height - cornerSize);
        context.stroke();
        
        // 最も確率が高い感情を取得
        const expressions = detection.expressions;
        let maxExpression: Emotion = 'neutral';
        let maxProbability = 0;
        
        // すべての感情データをステートに保存
        const emotionsData: Record<Emotion, number> = {
          neutral: 0,
          happy: 0,
          sad: 0,
          angry: 0,
          fearful: 0,
          disgusted: 0,
          surprised: 0
        };
        
        Object.entries(expressions).forEach(([expression, probability]) => {
          if (expression in emotionEmojis) {
            const emotionKey = expression as Emotion;
            emotionsData[emotionKey] = probability;
            
            if (probability > maxProbability) {
              maxProbability = probability;
              maxExpression = emotionKey;
            }
          }
        });
        
        setCurrentEmotion(maxExpression);
        setAllEmotions(emotionsData);
        
        // 顔の左側に感情データを表示
        const dataStartX = Math.max(10, box.x - 260); // 左側に配置、画面外に出ないよう調整
        const dataStartY = box.y;
        
        // データボックスの背景
        context.fillStyle = 'rgba(0, 0, 0, 0.6)';
        context.fillRect(dataStartX, dataStartY, 240, 180);
        context.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        context.strokeRect(dataStartX, dataStartY, 240, 180);
        
        // ヘッダーライン
        context.beginPath();
        context.moveTo(dataStartX, dataStartY + 30);
        context.lineTo(dataStartX + 240, dataStartY + 30);
        context.stroke();
        
        // タイトル
        context.fillStyle = 'rgba(0, 255, 255, 0.8)';
        context.font = '16px monospace';
        context.fillText('FACIAL ANALYSIS', dataStartX + 10, dataStartY + 20);
        
        // 現在の感情
        context.font = '14px monospace';
        context.fillText('検出感情:', dataStartX + 10, dataStartY + 50);
        context.fillStyle = 'white';
        context.font = 'bold 18px monospace';
        context.fillText(`${emotionLabels[maxExpression]} (${(maxProbability * 100).toFixed(1)}%)`, dataStartX + 10, dataStartY + 75);
        
        // 横線
        context.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        context.beginPath();
        context.moveTo(dataStartX, dataStartY + 90);
        context.lineTo(dataStartX + 240, dataStartY + 90);
        context.stroke();
        
        // 上位3感情のバー表示
        context.fillStyle = 'rgba(0, 255, 255, 0.8)';
        context.font = '12px monospace';
        context.fillText('感情確率分布:', dataStartX + 10, dataStartY + 110);
        
        // 感情確率の降順でソート
        const sortedEmotions = Object.entries(emotionsData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);
        
        sortedEmotions.forEach(([emotion, probability], index) => {
          const barY = dataStartY + 125 + (index * 18);
          
          // 感情ラベル
          context.fillStyle = 'white';
          context.font = '12px monospace';
          context.fillText(emotionLabels[emotion as Emotion], dataStartX + 10, barY);
          
          // 確率バー
          const barWidth = probability * 120;
          context.fillStyle = 'rgba(0, 255, 255, 0.3)';
          context.fillRect(dataStartX + 90, barY - 10, 120, 12);
          context.fillStyle = 'rgba(0, 255, 255, 0.8)';
          context.fillRect(dataStartX + 90, barY - 10, barWidth, 12);
          
          // 確率値
          context.fillStyle = 'white';
          context.font = '10px monospace';
          context.fillText(`${(probability * 100).toFixed(1)}%`, dataStartX + 215, barY);
        });
      } else {
        // 顔が検出されない場合、デフォルト状態にリセット
        setCurrentEmotion('neutral');
        setDetectedFace(null);
      }
    } catch (err) {
      console.error('顔検出中にエラーが発生しました:', err);
    }
    
    // FPSを計算
    const endTime = performance.now();
    const elapsed = endTime - startTime;
    setFps(Math.round(1000 / elapsed));
    
    // 次のフレームで再実行
    requestAnimationFrame(detectFaces);
  }
  
  // モデルサイズを切り替える
  const toggleModelSize = () => {
    setModelSize(prev => prev === 'tiny' ? 'normal' : 'tiny');
  }
  
  // 顔検出の一時停止/再開を切り替える
  const toggleDetection = () => {
    setIsDetecting(prev => !prev);
    if (!isDetecting && isStreamStarted) {
      // 検出を再開する場合
      requestAnimationFrame(detectFaces);
    }
  }
  
  // コンポーネントの初期化
  useEffect(() => {
    console.log('コンポーネントが初期化されました');
    loadModels();
    
    // クリーンアップ関数
    return () => {
      // カメラストリームを停止
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // モデルがロードされたらカメラを開始
  useEffect(() => {
    if (isModelLoaded) {
      console.log('モデルがロードされたのでカメラを開始します');
      startVideo();
    }
  }, [isModelLoaded]);
  
  // カメラストリームが開始されたら顔検出を開始
  useEffect(() => {
    if (isStreamStarted && videoRef.current) {
      console.log('カメラストリームが開始されたので顔検出を開始します');
      
      // キャンバスのサイズをビデオに合わせる
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
      }
      
      setIsDetecting(true);
      detectFaces();
    }
  }, [isStreamStarted]);
  
  // コンテナのサイズを調整
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // サイドバーの幅を画面幅の35%として計算
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const sidebarWidth = Math.floor(screenWidth * 0.35); // 35%のサイドバー幅
        const padding = 48; // 左右のパディング合計 (px)
        const rightMargin = 40; // 右側の余白 (px)
        const headerHeight = 80; // ヘッダーの高さ (px)
        const bottomMargin = 120; // 下部の余白と他の要素のための余白 (px)
        
        // 使用可能な最大幅を計算（メインコンテンツエリア = 65%から余白を除く）
        const availableWidth = screenWidth - sidebarWidth - padding - rightMargin;
        // 使用可能な最大高さを計算
        const availableHeight = screenHeight - headerHeight - bottomMargin;
        
        // 画面サイズに応じた適切な幅を設定
        let width;
        if (screenWidth <= 768) {
          // モバイル: より小さなサイズ
          width = Math.max(320, Math.min(500, availableWidth));
        } else if (screenWidth <= 1024) {
          // タブレット: 中程度のサイズ
          width = Math.max(480, Math.min(700, availableWidth));
        } else {
          // デスクトップ: より大きなサイズ
          width = Math.max(640, Math.min(900, availableWidth));
        }
        
        // 16:9のアスペクト比を使用（より映像に適したワイドなアスペクト比）
        let height = width * 9 / 16;
        
        // 高さが利用可能な高さを超える場合は、高さを基準に幅を再計算
        if (height > availableHeight) {
          height = availableHeight;
          width = height * 16 / 9;
          
          // 再計算された幅が利用可能な幅を超える場合は、さらに調整
          if (width > availableWidth) {
            width = availableWidth;
            height = width * 9 / 16;
          }
        }
        
        // 最小サイズの保証
        width = Math.max(320, width);
        height = Math.max(180, height);
        
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        
        // キャンバスのサイズも更新
        if (canvasRef.current) {
          canvasRef.current.width = Math.floor(width);
          canvasRef.current.height = Math.floor(height);
        }
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // 手動でカメラアクセスを要求するハンドラー
  const handleRequestCamera = () => {
    startVideo();
  };
  
  // カメラコントロールの表示/非表示を切り替える
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  // 背景色のクラス名
  const bgColorClass = `bg-${currentEmotion}`;
  
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      
      <div className="relative w-full">
        <div 
          ref={containerRef}
          className="canvas-container bg-black/80 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 border border-cyan-500/40 mx-auto"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <video
            ref={videoRef}
            className="webcam"
            width={dimensions.width}
            height={dimensions.height}
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
          />
          
          {/* 左下のステータス表示 */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-cyan-400 rounded-lg p-2 z-10 border border-cyan-500/30 flex items-center space-x-2 text-xs">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-1`}></div>
              <span>{isDetecting ? 'ACTIVE' : 'PAUSED'}</span>
            </div>
            <span>|</span>
            <span>FPS: {fps}</span>
            <span>|</span>
            <span>MODEL: {modelSize === 'tiny' ? 'FAST' : 'PRECISE'}</span>
          </div>
          
          {/* 音声解析表示（一番下に配置） */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center z-20">
            <div className="relative w-3/4 h-12 flex items-end justify-center pb-4">
              
              {/* 音声波形表示 */}
              <div className="absolute w-full bottom-14 h-8 flex items-center justify-center gap-1">
                {audioVisualization.map((value, index) => (
                  <div 
                    key={index}
                    className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t-sm"
                    style={{ 
                      height: `${value * 100}%`,
                      opacity: isListening ? 1 : 0.5,
                      transition: 'height 0.1s ease-in-out'
                    }}
                  ></div>
                ))}
              </div>
              
              {/* マイクボタン */}
              <button 
                onClick={toggleListening}
                className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center z-30 transition-all duration-300 ${isListening ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50' : 'bg-black/60 border border-cyan-500/30'}`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: isListening ? 'white' : '#22d3ee' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                  />
                </svg>
              </button>
              
              {/* リスニング状態テキスト */}
              {isListening && (
                <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md text-cyan-400 rounded-lg px-2 py-1 text-xs border border-cyan-500/30">
                  VOICE ANALYSIS ACTIVE
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Cristalボタン - ビデオ枠の右端下部に配置 */}
        <div className="absolute bottom-3 right-0 z-50">
          {/* 光るリングアニメーション */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" style={{ width: '13rem', height: '13rem', margin: '-0.5rem' }}></div>
          <div className="absolute inset-0 rounded-full bg-cyan-500/15 animate-pulse" style={{ width: '12.5rem', height: '12.5rem', margin: '-0.25rem', animationDelay: '0.5s' }}></div>
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse" style={{ width: '12rem', height: '12rem', margin: '-0.1rem', animationDelay: '1s' }}></div>
          
          <button 
            onClick={() => {
              // page.tsxのhandleCristalClick関数を呼び出すため、カスタムイベントを発火
              const event = new CustomEvent('cristalClick');
              window.dispatchEvent(event);
            }}
            className="w-48 h-48 rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 focus:outline-none shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 relative z-10"
          >
            <img src="/CRISTAL.png" alt="CRISTAL" className="w-full h-full object-cover pointer-events-none" />
          </button>
        </div>

        {/* コントロールボタン */}
        <button 
          onClick={toggleControls}
          className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-cyan-400 rounded-full p-2 hover:bg-black/80 transition-all z-10 border border-cyan-500/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        
        {showControls && (
          <div className="absolute top-12 right-3 bg-black/70 backdrop-blur-md text-cyan-400 rounded-lg p-3 z-10 border border-cyan-500/30">
            <h3 className="text-xs font-bold mb-2 text-center border-b border-cyan-500/30 pb-1">SYSTEM CONTROLS</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={toggleDetection}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs border ${isDetecting ? 'border-red-500/50 bg-red-500/20 hover:bg-red-500/30' : 'border-green-500/50 bg-green-500/20 hover:bg-green-500/30'} transition-colors`}
              >
                {isDetecting ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>PAUSE DETECTION</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>RESUME DETECTION</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={toggleModelSize}
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs border border-blue-500/50 bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
                <span>TOGGLE MODEL: {modelSize === 'tiny' ? 'FAST → PRECISE' : 'PRECISE → FAST'}</span>
              </button>
              
              {/* 音声解析切り替えボタン */}
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs border ${isListening ? 'border-cyan-500/50 bg-cyan-500/20 hover:bg-cyan-500/30' : 'border-gray-500/50 bg-gray-500/20 hover:bg-gray-500/30'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>{isListening ? 'DISABLE VOICE ANALYSIS' : 'ENABLE VOICE ANALYSIS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 感情状態表示 */}
      {detectedFace && (
        <div 
          className="bg-black/70 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30"
          style={{ width: dimensions.width }}
        >
          <div className="flex justify-between items-center mb-3 border-b border-cyan-500/30 pb-2">
            <h3 className="text-cyan-400 text-sm font-bold">FACIAL ANALYSIS RESULTS</h3>
            <span className="text-cyan-400 text-xs">{new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 現在の感情 */}
            <div className="bg-black/50 rounded-lg p-3 border border-cyan-500/20">
              <h4 className="text-cyan-400 text-xs font-bold mb-2">PRIMARY EMOTION</h4>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{emotionEmojis[currentEmotion]}</span>
                <div>
                  <div className="text-white font-bold">{emotionLabels[currentEmotion]}</div>
                  <div className="text-gray-400 text-xs">{emotionDescriptions[currentEmotion]}</div>
                </div>
              </div>
            </div>
            
            {/* 感情グラフ */}
            <div className="bg-black/50 rounded-lg p-3 border border-cyan-500/20 col-span-2">
              <h4 className="text-cyan-400 text-xs font-bold mb-2">EMOTION DISTRIBUTION</h4>
              <div className="space-y-2">
                {allEmotions && Object.entries(allEmotions)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, value]) => (
                    <div key={emotion} className="flex items-center">
                      <span className="text-white text-xs w-16">{emotionLabels[emotion as Emotion]}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2 ml-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${value * 100}%`,
                            backgroundColor: emotion === currentEmotion ? 'rgb(6, 182, 212)' : 'rgba(6, 182, 212, 0.5)'
                          }}
                        ></div>
                      </div>
                      <span className="text-white text-xs w-12 text-right ml-2">{(value * 100).toFixed(1)}%</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* エラーメッセージ */}
      {error && (
        <div 
          className="mt-2 text-sm text-red-400 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-red-500/30"
          style={{ width: dimensions.width }}
        >
          <h3 className="text-red-400 text-xs font-bold mb-2">SYSTEM ERROR</h3>
          <p className="text-sm leading-relaxed">{error}</p>
          <button 
            onClick={handleRequestCamera}
            className="mt-3 px-4 py-2 bg-red-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 text-xs font-medium"
          >
            RETRY CAMERA ACCESS
          </button>
        </div>
      )}
      
      {/* 読み込み中表示 */}
      {!isModelLoaded && !error && (
        <div 
          className="mt-2 text-sm text-cyan-400 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30"
          style={{ width: dimensions.width }}
        >
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
            <span>LOADING FACIAL RECOGNITION MODELS...</span>
          </div>
        </div>
      )}
      
      {isModelLoaded && !isStreamStarted && !error && (
        <div 
          className="mt-2 text-sm text-cyan-400 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30"
          style={{ width: dimensions.width }}
        >
          <div className="flex items-center">
            <div className="animate-pulse mr-2 h-4 w-4 bg-cyan-400 rounded-full"></div>
            <span>INITIALIZING CAMERA...</span>
          </div>
        </div>
      )}
    </div>
  );
} 