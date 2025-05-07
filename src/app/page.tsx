'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'

// FaceAnalyzerコンポーネントをクライアントサイドでのみ読み込む
// SSRを無効化し、サスペンスを使用して遅延読み込みを改善
const FaceAnalyzer = dynamic(
  () => import('@/components/FaceAnalyzer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64 bg-white/10 backdrop-blur-md animate-pulse rounded-2xl">
        <p className="text-gray-500">カメラコンポーネントを読み込み中...</p>
      </div>
    )
  }
)

const PresentationSlide = dynamic(
  () => import('@/components/PresentationSlide'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full bg-white/10 backdrop-blur-md animate-pulse rounded-2xl">
        <p className="text-gray-500">資料を読み込み中...</p>
      </div>
    )
  }
)

export default function Home() {
  // 背景画像を固定
  const backgroundImage = '/backgrounds/salesplanmaker.jpg'
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [sidebarWidth, setSidebarWidth] = useState<number>(280)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const cristalButtonRef = useRef<HTMLButtonElement>(null)
  const [detectedFace, setDetectedFace] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'>('neutral')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false)
  const [analysisDots, setAnalysisDots] = useState<string>('')
  const sphereCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isDataTransferring, setIsDataTransferring] = useState<boolean>(false)
  const [dataTransferComplete, setDataTransferComplete] = useState<boolean>(false)
  const [dataPackets, setDataPackets] = useState<{x: number, y: number, size: number, speed: number}[]>([])
  const dataTransferCanvasRef = useRef<HTMLCanvasElement>(null)
  const transferAnimationFrameRef = useRef<number | null>(null)
  const [analysisStartTime, setAnalysisStartTime] = useState<number>(0)
  const [isSlideOptimizing, setIsSlideOptimizing] = useState<boolean>(false)

  // サイドバーリサイズの処理
  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    resizingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = sidebarWidth
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResize)
  }
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return
    const deltaX = e.clientX - startXRef.current
    const newWidth = Math.max(200, Math.min(500, startWidthRef.current + deltaX))
    setSidebarWidth(newWidth)
  }
  
  const stopResize = () => {
    resizingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResize)
  }

  // FaceAnalyzerからの顔データ更新ハンドラー
  const handleFaceDetection = (
    face: { x: number; y: number; width: number; height: number } | null,
    emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'
  ) => {
    setDetectedFace(face);
    setCurrentEmotion(emotion);
  };

  // アニメーションドットのためのエフェクト
  useEffect(() => {
    if (isAnalyzing) {
      const dotInterval = setInterval(() => {
        setAnalysisDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 400);
      
      return () => clearInterval(dotInterval);
    }
  }, [isAnalyzing]);
  
  // 球体アニメーションのコントロール
  const handleCristalClick = () => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisStartTime(Date.now());
    
    // 5秒後に分析完了とする
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 5000);
  };

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsModalOpen(false);
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (transferAnimationFrameRef.current) {
      cancelAnimationFrame(transferAnimationFrameRef.current);
      transferAnimationFrameRef.current = null;
    }
  };

  // モーダル外クリックで閉じる処理
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  // データ転送アニメーションを開始
  const startDataTransfer = () => {
    console.log("データ転送開始");
    setIsDataTransferring(true);
    setDataTransferComplete(false);
    
    // 初期データパケットを生成
    const newPackets = [];
    for (let i = 0; i < 30; i++) {
      newPackets.push({
        x: Math.random() * 0.3, // 左側に集中させる
        y: Math.random(),
        size: Math.random() * 5 + 2,
        speed: Math.random() * 0.01 + 0.005
      });
    }
    setDataPackets(newPackets);
    
    // 5秒後にアニメーション完了
    setTimeout(() => {
      console.log("データ転送完了");
      setIsDataTransferring(false);
      setDataTransferComplete(true);
      
      // スライド最適化フェーズに移行
      setTimeout(() => {
        setIsSlideOptimizing(true);
      }, 500);
    }, 5000);
  };

  // スライド最適化完了時の処理
  const handleSlideOptimizationComplete = () => {
    // スライド最適化完了後、モーダルを閉じる
    setTimeout(() => {
      console.log("スライド最適化完了");
      setIsSlideOptimizing(false);
      closeModal();
    }, 2000);
  };

  // データ転送アニメーションのレンダリング
  useEffect(() => {
    // データ転送中でない、またはキャンバス参照がない場合は何もしない
    if (!isDataTransferring || !dataTransferCanvasRef.current) return;
    
    console.log("近未来的ビジネススタイルデータ転送アニメーション開始");
    
    // キャンバスとコンテキストの取得
    const canvas = dataTransferCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスサイズを設定
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // 近未来的なビジネス向けの配色
    const bgColor = '#081325';
    const primaryColor = '#1E88E5';
    const secondaryColor = '#00ACC1';
    const accentColor = '#64FFDA';
    const textColor = '#E0F7FA';
    
    // 商談分析エージェントと戦略エージェントのアイコン位置
    const sourceX = canvas.width * 0.2;
    const targetX = canvas.width * 0.8;
    const centerY = canvas.height / 2;
    
    // ローカルのパケットデータ（コピーを作成）
    const localPackets = [...dataPackets];
    
    // デジタルノイズパターンの描画関数
    function drawDigitalNoise(ctx: CanvasRenderingContext2D) {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 10;
        const r = 5 + noise;
        const g = 12 + noise;
        const b = 25 + noise;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 20; // より控えめな透明度
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // 近未来的なグリッドの描画
    function drawFuturisticGrid(ctx: CanvasRenderingContext2D) {
      // 大きなグリッド
      ctx.strokeStyle = 'rgba(30, 136, 229, 0.08)';
      ctx.lineWidth = 1;
      
      // 垂直線
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // 水平線
      for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // 小さなグリッド
      ctx.strokeStyle = 'rgba(30, 136, 229, 0.04)';
      ctx.lineWidth = 0.5;
      
      // 垂直線
      for (let x = 0; x < canvas.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // 水平線
      for (let y = 0; y < canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // 2本の洗練されたスキャンライン
      const scanY1 = (Date.now() % 6000) / 6000 * canvas.height;
      const scanY2 = ((Date.now() + 3000) % 6000) / 6000 * canvas.height;
      
      // 1本目のスキャンライン
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY1);
      ctx.lineTo(canvas.width, scanY1);
      ctx.stroke();
      
      // 2本目のスキャンライン
      ctx.strokeStyle = 'rgba(0, 172, 193, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY2);
      ctx.lineTo(canvas.width, scanY2);
      ctx.stroke();
      
      // フェードエフェクト（より洗練された薄いグロー）
      const scanGradient1 = ctx.createLinearGradient(0, scanY1 - 50, 0, scanY1 + 50);
      scanGradient1.addColorStop(0, 'rgba(100, 255, 218, 0)');
      scanGradient1.addColorStop(0.5, 'rgba(100, 255, 218, 0.03)');
      scanGradient1.addColorStop(1, 'rgba(100, 255, 218, 0)');
      
      ctx.fillStyle = scanGradient1;
      ctx.fillRect(0, scanY1 - 50, canvas.width, 100);
      
      const scanGradient2 = ctx.createLinearGradient(0, scanY2 - 50, 0, scanY2 + 50);
      scanGradient2.addColorStop(0, 'rgba(0, 172, 193, 0)');
      scanGradient2.addColorStop(0.5, 'rgba(0, 172, 193, 0.03)');
      scanGradient2.addColorStop(1, 'rgba(0, 172, 193, 0)');
      
      ctx.fillStyle = scanGradient2;
      ctx.fillRect(0, scanY2 - 50, canvas.width, 100);
    }
    
    // ビジネスノードの描画
    function drawBusinessNode(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, type: 'source' | 'target') {
      // 高級感のあるシャドウ効果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // 外側の円
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = type === 'source' ? 'rgba(21, 101, 192, 0.9)' : 'rgba(0, 131, 143, 0.9)';
      ctx.fill();
      
      // シャドウリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 内側の円（濃いグラデーション）
      const innerGradient = ctx.createRadialGradient(
        x - radius * 0.2, y - radius * 0.2, 0,
        x, y, radius * 0.85
      );
      
      if (type === 'source') {
        innerGradient.addColorStop(0, 'rgba(30, 136, 229, 1)');
        innerGradient.addColorStop(0.7, 'rgba(21, 101, 192, 0.9)');
        innerGradient.addColorStop(1, 'rgba(13, 71, 161, 0.9)');
      } else {
        innerGradient.addColorStop(0, 'rgba(0, 172, 193, 1)');
        innerGradient.addColorStop(0.7, 'rgba(0, 131, 143, 0.9)');
        innerGradient.addColorStop(1, 'rgba(0, 96, 100, 0.9)');
      }
      
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
      
      // 光沢効果（上部に薄いハイライト）
      const highlightGradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius * 0.7
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();
      
      // 中央のアイコン（洗練されたビジネスアイコン）
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      
      if (type === 'source') {
        // データ分析アイコン（グラフチャート風）
        // バーチャート
        const barWidth = radius * 0.1;
        const barGap = radius * 0.05;
        const barBase = y + radius * 0.2;
        
        // バー1
        ctx.beginPath();
        ctx.rect(x - radius * 0.3, barBase - radius * 0.1, barWidth, radius * 0.1);
        ctx.fill();
        
        // バー2
        ctx.beginPath();
        ctx.rect(x - radius * 0.3 + barWidth + barGap, barBase - radius * 0.3, barWidth, radius * 0.3);
        ctx.fill();
        
        // バー3
        ctx.beginPath();
        ctx.rect(x - radius * 0.3 + (barWidth + barGap) * 2, barBase - radius * 0.2, barWidth, radius * 0.2);
        ctx.fill();
        
        // バー4
        ctx.beginPath();
        ctx.rect(x - radius * 0.3 + (barWidth + barGap) * 3, barBase - radius * 0.25, barWidth, radius * 0.25);
        ctx.fill();
        
        // 線グラフ
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.25, y - radius * 0.1);
        ctx.lineTo(x - radius * 0.1, y - radius * 0.2);
        ctx.lineTo(x + radius * 0.05, y - radius * 0.05);
        ctx.lineTo(x + radius * 0.2, y - radius * 0.15);
        ctx.stroke();
        
        // データポイント
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.1, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x - radius * 0.1, y - radius * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + radius * 0.05, y - radius * 0.05, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + radius * 0.2, y - radius * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 戦略アイコン（チェス駒＋ビジネスアイコン）
        
        // チェスの駒の上部
        ctx.beginPath();
        ctx.arc(x, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // 駒の首
        ctx.beginPath();
        ctx.moveTo(x - radius * 0.1, y - radius * 0.15);
        ctx.lineTo(x - radius * 0.12, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.12, y + radius * 0.1);
        ctx.lineTo(x + radius * 0.1, y - radius * 0.15);
        ctx.fill();
        
        // 駒の台座
        ctx.beginPath();
        ctx.ellipse(x, y + radius * 0.15, radius * 0.2, radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ビジネス戦略アイコン - 歯車
        const teethCount = 8;
        const innerRadius = radius * 0.05;
        const outerRadius = radius * 0.1;
        
        ctx.strokeStyle = 'rgba(0, 131, 143, 0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < teethCount; i++) {
          const angle = (i / teethCount) * Math.PI * 2;
          const innerX = x + innerRadius * Math.cos(angle);
          const innerY = y + innerRadius * Math.sin(angle);
          const outerX = x + outerRadius * Math.cos(angle);
          const outerY = y + outerRadius * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(innerX, innerY);
          } else {
            ctx.lineTo(innerX, innerY);
          }
          
          ctx.lineTo(outerX, outerY);
          
          const nextAngle = ((i + 1) / teethCount) * Math.PI * 2;
          const nextInnerX = x + innerRadius * Math.cos(nextAngle);
          const nextInnerY = y + innerRadius * Math.sin(nextAngle);
          
          ctx.lineTo(x + outerRadius * Math.cos(nextAngle), y + outerRadius * Math.sin(nextAngle));
          ctx.lineTo(nextInnerX, nextInnerY);
        }
        
        ctx.closePath();
        ctx.stroke();
      }
      
      // ステータスリング (パルス効果を持つリング)
      const time = Date.now() * 0.001;
      const pulseSize = radius + Math.sin(time * 3) * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = type === 'source' 
        ? `rgba(30, 136, 229, ${0.3 + Math.sin(time * 3) * 0.2})` 
        : `rgba(0, 172, 193, ${0.3 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // ノードタイトル
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        type === 'source' ? 'ビジネスデータ分析' : '戦略立案エンジン', 
        x, 
        y + radius + 25
      );
      
      // 状態表示（より洗練された形式）
      const progress = Math.floor((Date.now() % 5000) / 50);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(224, 247, 250, 0.9)';
      ctx.textAlign = 'center';
      
      if (type === 'source') {
        ctx.fillText(`分析中: ${progress}%`, x, y - radius - 15);
        
        // 進捗円弧
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * progress / 100);
        
        ctx.beginPath();
        ctx.arc(x, y, radius + 8, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillText('戦略最適化', x, y - radius - 15);
        
        // 進捗円弧（パルス効果）
        const pulseTime = Date.now() * 0.002;
        const segments = 3;
        
        for (let i = 0; i < segments; i++) {
          const segmentAngle = Math.PI * 2 / segments;
          const startAngle = -Math.PI / 2 + i * segmentAngle + pulseTime;
          const endAngle = startAngle + segmentAngle * 0.7;
          
          ctx.beginPath();
          ctx.arc(x, y, radius + 8, startAngle, endAngle);
          ctx.strokeStyle = 'rgba(100, 255, 218, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
    
    // 近未来的なデータ接続の描画
    function drawFuturisticConnection(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
      // メインデータパス
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      
      ctx.beginPath();
      ctx.moveTo(x1 + 30, y1);
      ctx.lineTo(x2 - 30, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // データトラフィック表示
      // データフロー速度の変数（時間経過で変化）
      const flowSpeed = 1 + Math.sin(Date.now() * 0.001) * 0.3;
      const flowOffset = (Date.now() * flowSpeed % 3000) / 3000;
      
      // データパケットのサイズと間隔
      const packetSize = 4;
      const gap = 40;
      const totalLength = packetSize + gap;
      
      ctx.setLineDash([packetSize, gap]);
      ctx.lineDashOffset = -flowOffset * totalLength * 3;
      
      ctx.beginPath();
      ctx.moveTo(x1 + 30, y1);
      ctx.lineTo(x2 - 30, y2);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 5;
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // トラフィック量表示
      const dataAmount = Math.floor(50 + Math.sin(Date.now() * 0.0005) * 30);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(
        `データトラフィック: ${dataAmount} Mbps`, 
        (x1 + x2) / 2, 
        ((y1 + y2) / 2) - 30
      );
      
      // トラフィック状態
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 10px Arial';
      ctx.fillText(
        `伝送状態: 最適化中 (${Math.floor(flowSpeed * 100)}%)`,
        (x1 + x2) / 2,
        ((y1 + y2) / 2) - 15
      );
    }
    
    // ビジネスデータパケットの描画
    function drawBusinessDataPacket(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, progress: number) {
      // パケットの種類（進行度合いによって形状変化）- 洗練されたビジネススタイル
      const packetType = progress < 0.3 ? 'diamond' : progress < 0.7 ? 'octagon' : 'document';
      
      // 共通の透明度と輝きエフェクト
      const alpha = 0.7 + (progress * 0.3);
      const glowStrength = 0.4 + Math.sin(Date.now() * 0.01 + progress * 10) * 0.15;
      
      // パケットのサイズ計算（進行によって少し大きくなる）
      const actualSize = size * (0.8 + progress * 0.4);
      
      // パケットの基本色（進行に応じて変化）- より洗練された青系統
      const r = Math.floor(20 + progress * 40);
      const g = Math.floor(100 + progress * 60);
      const b = Math.floor(200 + progress * 55);
      const packColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      
      // パケット描画
      ctx.save();
      
      // パケットの形状に応じて描画
      ctx.beginPath();
      
      if (packetType === 'diamond') {
        // ダイヤモンド型（初期状態のデータパケット）- より先鋭的で高級感
        ctx.moveTo(x, y - actualSize);
        ctx.lineTo(x + actualSize * 0.7, y);
        ctx.lineTo(x, y + actualSize);
        ctx.lineTo(x - actualSize * 0.7, y);
      } else if (packetType === 'octagon') {
        // 八角形（処理中のデータパケット）- エンタープライズ感
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const px = x + actualSize * 0.8 * Math.cos(angle);
          const py = y + actualSize * 0.8 * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else {
        // ドキュメント形状（確定したビジネスデータ）- 書類のような形状
        const docWidth = actualSize * 1.2;
        const docHeight = actualSize * 1.4;
        const cornerSize = actualSize * 0.2;
        
        ctx.moveTo(x - docWidth/2, y - docHeight/2);
        ctx.lineTo(x + docWidth/2 - cornerSize, y - docHeight/2);
        ctx.lineTo(x + docWidth/2, y - docHeight/2 + cornerSize);
        ctx.lineTo(x + docWidth/2, y + docHeight/2);
        ctx.lineTo(x - docWidth/2, y + docHeight/2);
      }
      
      ctx.closePath();
      
      // 洗練されたグラデーション塗りつぶし
      let gradient;
      
      if (packetType === 'document') {
        // ドキュメント形式は線形グラデーション
        gradient = ctx.createLinearGradient(
          x - actualSize, y - actualSize,
          x + actualSize, y + actualSize
        );
      } else {
        // その他は放射状グラデーション
        gradient = ctx.createRadialGradient(
          x - actualSize * 0.3, y - actualSize * 0.3, 0,
          x, y, actualSize * 1.2
        );
      }
      
      gradient.addColorStop(0, `rgba(${r + 40}, ${g + 40}, ${b}, ${alpha})`);
      gradient.addColorStop(0.7, packColor);
      gradient.addColorStop(1, `rgba(${r - 30}, ${g - 40}, ${b - 20}, ${alpha * 0.7})`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 上品な縁取り効果
      ctx.strokeStyle = `rgba(${r + 80}, ${g + 80}, ${b + 40}, ${alpha * 0.9})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 輝きエフェクト
      ctx.beginPath();
      if (packetType === 'diamond') {
        // ダイヤモンドの輝き
        ctx.moveTo(x, y - actualSize * 0.6);
        ctx.lineTo(x + actualSize * 0.5, y);
        ctx.lineTo(x, y + actualSize * 0.6);
        ctx.lineTo(x - actualSize * 0.5, y);
      } else if (packetType === 'octagon') {
        // 八角形の輝き - より小さく
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const px = x + actualSize * 0.5 * Math.cos(angle);
          const py = y + actualSize * 0.5 * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else {
        // ドキュメントの輝き - 書類の内部線
        const innerWidth = actualSize * 0.9;
        const innerHeight = actualSize * 1.1;
        const cornerSize = actualSize * 0.15;
        
        ctx.moveTo(x - innerWidth/2, y - innerHeight/2);
        ctx.lineTo(x + innerWidth/2 - cornerSize, y - innerHeight/2);
        ctx.lineTo(x + innerWidth/2, y - innerHeight/2 + cornerSize);
        ctx.lineTo(x + innerWidth/2, y + innerHeight/2);
        ctx.lineTo(x - innerWidth/2, y + innerHeight/2);
        ctx.closePath();
      }
      
      // 輝きグラデーション - より控えめで高級感のある輝き
      const glowGradient = ctx.createRadialGradient(
        x - actualSize * 0.2, y - actualSize * 0.2, 0,
        x, y, actualSize * 0.7
      );
      glowGradient.addColorStop(0, `rgba(180, 230, 255, ${glowStrength * 0.8})`);
      glowGradient.addColorStop(1, `rgba(30, 136, 229, 0)`);
      
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // デジタルデータの内部線
      if (packetType === 'document') {
        // ドキュメント内部の線（ビジネス書類風）
        ctx.strokeStyle = `rgba(220, 240, 255, ${glowStrength * 0.6})`;
        ctx.lineWidth = 0.5;
        
        const docWidth = actualSize * 1.2;
        const docHeight = actualSize * 1.4;
        const lineGap = docHeight / 5;
        
        // 横線（文書の行）
        for (let i = 1; i < 5; i++) {
          const lineY = y - docHeight/2 + lineGap * i;
          ctx.beginPath();
          ctx.moveTo(x - docWidth/2 + actualSize * 0.2, lineY);
          ctx.lineTo(x + docWidth/2 - actualSize * 0.2, lineY);
          ctx.stroke();
        }
        
        // 署名欄風のライン
        ctx.beginPath();
        ctx.moveTo(x - docWidth/4, y + docHeight/2 - actualSize * 0.3);
        ctx.lineTo(x + docWidth/4, y + docHeight/2 - actualSize * 0.3);
        ctx.stroke();
      } else if (packetType === 'octagon') {
        // 中間処理データの内部構造
        ctx.strokeStyle = `rgba(180, 230, 255, ${glowStrength * 0.6})`;
        ctx.lineWidth = 0.5;
        
        // データ構造線
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 4) * i;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + actualSize * 0.7 * Math.cos(angle), y + actualSize * 0.7 * Math.sin(angle));
          ctx.stroke();
        }
      } else {
        // 初期データの内部線 - シンプルなデザイン
        ctx.strokeStyle = `rgba(180, 230, 255, ${glowStrength * 0.5})`;
        ctx.lineWidth = 0.5;
        
        // X印
        ctx.beginPath();
        ctx.moveTo(x - actualSize * 0.4, y - actualSize * 0.4);
        ctx.lineTo(x + actualSize * 0.4, y + actualSize * 0.4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + actualSize * 0.4, y - actualSize * 0.4);
        ctx.lineTo(x - actualSize * 0.4, y + actualSize * 0.4);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // 分析背景の描画
    function drawAnalyticsBackground(ctx: CanvasRenderingContext2D) {
      // ビジネスアナリティクス背景
      
      // グローバルな透明度を下げる
      ctx.globalAlpha = 0.2;
      
      // ビジネスチャート効果（右上）
      ctx.strokeStyle = 'rgba(0, 172, 193, 0.5)';
      ctx.lineWidth = 1;
      
      // 棒グラフチャート（右上）
      const barCount = 6;
      const barWidth = 12;
      const barGap = 6;
      const barMaxHeight = 60;
      const barX = canvas.width * 0.85;
      const barY = canvas.height * 0.2;
      
      for (let i = 0; i < barCount; i++) {
        // サイン波でアニメーションする高さ
        const height = (Math.sin(Date.now() * 0.001 + i * 0.5) * 0.3 + 0.7) * barMaxHeight;
        
        ctx.fillStyle = `rgba(0, 172, 193, ${0.3 + i * 0.1})`;
        ctx.fillRect(
          barX + i * (barWidth + barGap),
          barY - height,
          barWidth,
          height
        );
      }
      
      // 円グラフ（左下）
      const pieX = canvas.width * 0.2;
      const pieY = canvas.height * 0.75;
      const pieRadius = 40;
      
      // アニメーションするスライス
      const sliceCount = 4;
      const timeOffset = Date.now() * 0.0005;
      
      for (let i = 0; i < sliceCount; i++) {
        const startAngle = (i / sliceCount) * Math.PI * 2 + timeOffset;
        const endAngle = ((i + 1) / sliceCount) * Math.PI * 2 + timeOffset;
        
        ctx.fillStyle = `rgba(30, 136, 229, ${0.4 + i * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(pieX, pieY);
        ctx.arc(pieX, pieY, pieRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
      
      // 線グラフ（右下）
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const lineStartX = canvas.width * 0.65;
      const lineEndX = canvas.width * 0.95;
      const lineY = canvas.height * 0.8;
      const lineHeight = 50;
      
      // 上昇トレンドの線グラフを描画（なめらかな曲線）
      ctx.moveTo(lineStartX, lineY);
      
      const pointCount = 10;
      for (let i = 1; i <= pointCount; i++) {
        const x = lineStartX + (lineEndX - lineStartX) * (i / pointCount);
        // 時間経過でアニメーションする曲線
        const offset = Math.sin(i * 0.5 + Date.now() * 0.001) * 10;
        const trend = (i / pointCount) * lineHeight * 0.8; // 上昇傾向
        const y = lineY - trend - offset;
        
        // 滑らかな曲線を描画するための制御点
        if (i === 1) {
          ctx.lineTo(x, y);
        } else {
          // 前の点との中間点を使用
          const prevX = lineStartX + (lineEndX - lineStartX) * ((i - 1) / pointCount);
          const prevOffset = Math.sin((i - 1) * 0.5 + Date.now() * 0.001) * 10;
          const prevTrend = ((i - 1) / pointCount) * lineHeight * 0.8;
          const prevY = lineY - prevTrend - prevOffset;
          
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpX, prevY, x, y);
        }
      }
      
      ctx.stroke();
      
      // 散布図（左上）
      const scatterX = canvas.width * 0.25;
      const scatterY = canvas.height * 0.3;
      const scatterSize = 50;
      
      for (let i = 0; i < 15; i++) {
        // 時間によって位置が変わる散布点
        const angle = (i / 15) * Math.PI * 2 + Date.now() * 0.0003;
        const distance = Math.sin(i * 3.7 + Date.now() * 0.0005) * scatterSize;
        
        const dotX = scatterX + Math.cos(angle) * distance;
        const dotY = scatterY + Math.sin(angle) * distance;
        const dotSize = 2 + Math.sin(i + Date.now() * 0.001) * 1;
        
        ctx.fillStyle = `rgba(100, 255, 218, ${0.5 + Math.sin(i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // グローバルな透明度を元に戻す
      ctx.globalAlpha = 1.0;
    }
    
    // 転送進捗状況表示
    function drawTransferProgress(ctx: CanvasRenderingContext2D) {
      const progress = Math.min(99, (Date.now() - analysisStartTime) / 50);
      const timeElapsed = (Date.now() - analysisStartTime) / 1000;
      
      // 背景バー
      ctx.fillStyle = 'rgba(10, 30, 66, 0.6)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(canvas.width * 0.1, canvas.height - 40, canvas.width * 0.8, 20);
      
      // シャドウリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 洗練された進捗バー
      const progressGradient = ctx.createLinearGradient(
        canvas.width * 0.1, 0,
        canvas.width * 0.9, 0
      );
      progressGradient.addColorStop(0, 'rgba(30, 136, 229, 0.8)');
      progressGradient.addColorStop(0.5, 'rgba(0, 172, 193, 0.9)');
      progressGradient.addColorStop(1, 'rgba(100, 255, 218, 0.8)');
      
      ctx.fillStyle = progressGradient;
      
      // 進捗バー（スムーズに）
      const barWidth = canvas.width * 0.8 * (progress / 100);
      ctx.fillRect(
        canvas.width * 0.1, 
        canvas.height - 40, 
        barWidth, 
        20
      );
      
      // エレガントなグロー効果
      const glowPos = canvas.width * 0.1 + barWidth;
      const glowGradient = ctx.createRadialGradient(
        glowPos, canvas.height - 30, 0,
        glowPos, canvas.height - 30, 20
      );
      glowGradient.addColorStop(0, 'rgba(100, 255, 218, 0.6)');
      glowGradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(glowPos - 20, canvas.height - 45, 40, 30);
      
      // 洗練された進捗テキスト - ビジネスライク
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      
      // 進捗テキスト
      ctx.fillText(
        `データ転送進捗: ${Math.floor(progress)}%`, 
        canvas.width / 2, 
        canvas.height - 25
      );
      
      // 転送時間表示
      ctx.font = '10px "Segoe UI", Arial, sans-serif';
      ctx.fillText(
        `経過時間: ${timeElapsed.toFixed(1)}秒`, 
        canvas.width / 2, 
        canvas.height - 10
      );
      
      // 追加情報表示 - 転送速度
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(100, 255, 218, 0.9)';
      ctx.fillText(
        `転送速度: ${Math.floor(30 + Math.sin(Date.now() * 0.001) * 5)} MB/s`, 
        canvas.width * 0.1, 
        canvas.height - 55
      );
      
      // 追加情報表示 - 残り時間
      const remainingTime = (100 - progress) / (progress / timeElapsed);
      ctx.textAlign = 'right';
      ctx.fillText(
        `残り時間: ${remainingTime > 0 ? remainingTime.toFixed(1) : 0}秒`, 
        canvas.width * 0.9, 
        canvas.height - 55
      );
    }
    
    // アニメーションループ関数
    function animate() {
      if (!canvas || !ctx) return;
      
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 洗練されたグラデーション背景
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#050c1a');
      bgGradient.addColorStop(1, '#091832');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // バックグラウンドレイヤー
      drawDigitalNoise(ctx);
      drawFuturisticGrid(ctx);
      drawAnalyticsBackground(ctx);
      
      // ビジネス分析と戦略の接続
      drawFuturisticConnection(ctx, sourceX, centerY, targetX, centerY);
      
      // ノード描画 - エンタープライズ分析と戦略
      drawBusinessNode(ctx, sourceX, centerY, 50, 'source');
      drawBusinessNode(ctx, targetX, centerY, 50, 'target');
      
      // ビジネスデータパケット描画 - データの流れ
      for (let i = 0; i < localPackets.length; i++) {
        const packet = localPackets[i];
        
        // パケットを移動（スムーズな速度変化）
        packet.x += packet.speed * (1 + Math.sin(Date.now() * 0.0005) * 0.2);
        if (packet.x > 1) {
          // 端に到達したらリセット
          packet.x = Math.random() * 0.1;
          packet.y = Math.random(); // Y位置もリセット
          packet.size = Math.random() * 5 + 2;
          packet.speed = Math.random() * 0.01 + 0.005;
        }
        
        // 実際の画面上の位置を計算（よりスムーズなカーブを描く）
        const xPos = sourceX + (targetX - sourceX) * packet.x;
        
        // 斜めのデータフロー効果のために中心から広がるような動き
        const amplitude = 40 + Math.sin(packet.x * Math.PI) * 20;
        const yPos = centerY + (packet.y - 0.5) * amplitude;
        
        // ビジネスデータパケット描画
        drawBusinessDataPacket(ctx, xPos, yPos, packet.size, packet.x);
      }
      
      // 転送進捗状況 - プロフェッショナルな表示
      drawTransferProgress(ctx);
      
      // エンタープライズUI要素
      // タイトルと時間
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.fillText('エンタープライズデータ転送システム', canvas.width / 2, 25);
      
      // サブタイトル
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
      ctx.fillText('ビジネス戦略最適化プロセス', canvas.width / 2, 45);
      
      // 現在時刻 - ビジネス風
      const now = new Date();
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'right';
      ctx.fillText(
        `${now.toLocaleTimeString()}`, 
        canvas.width - 15, 
        25
      );
      
      // 日付表示
      ctx.fillText(
        `${now.toLocaleDateString('ja-JP')}`, 
        canvas.width - 15, 
        45
      );
      
      // バージョン情報 - プロフェッショナル
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('Enterprise Edition v4.2.1', 15, 25);
      
      // 企業用ステータス
      ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
      ctx.fillText('セキュア転送モード: アクティブ', 15, 45);
      
      // テクニカルステータス表示（右上）
      ctx.textAlign = 'right';
      ctx.font = '10px "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      
      // 転送状況の詳細 - 近未来的
      const statusTexts = [
        `プロトコル: ENTERPRISE-TCP/TLS`,
        `暗号化: AES-256-GCM`,
        `サーバー: ビジネスエンジン-${Math.floor(Math.random() * 900 + 100)}`,
        `帯域幅: ${Math.floor(40 + Math.sin(Date.now() * 0.0003) * 10)} Mbps`
      ];
      
      statusTexts.forEach((text, i) => {
        ctx.fillText(text, canvas.width - 15, 70 + i * 15);
      });
      
      // コーナーの装飾エレメント - 企業風
      // 左下コーナー
      ctx.strokeStyle = 'rgba(30, 136, 229, 0.5)';
      ctx.lineWidth = 2;
      const cornerSize = 30;
      
      // 左下
      ctx.beginPath();
      ctx.moveTo(5, canvas.height - 5);
      ctx.lineTo(5, canvas.height - cornerSize);
      ctx.moveTo(5, canvas.height - 5);
      ctx.lineTo(cornerSize, canvas.height - 5);
      ctx.stroke();
      
      // 右下
      ctx.beginPath();
      ctx.moveTo(canvas.width - 5, canvas.height - 5);
      ctx.lineTo(canvas.width - 5, canvas.height - cornerSize);
      ctx.moveTo(canvas.width - 5, canvas.height - 5);
      ctx.lineTo(canvas.width - cornerSize, canvas.height - 5);
      ctx.stroke();
      
      // 左上
      ctx.beginPath();
      ctx.moveTo(5, 5);
      ctx.lineTo(5, cornerSize);
      ctx.moveTo(5, 5);
      ctx.lineTo(cornerSize, 5);
      ctx.stroke();
      
      // 右上
      ctx.beginPath();
      ctx.moveTo(canvas.width - 5, 5);
      ctx.lineTo(canvas.width - 5, cornerSize);
      ctx.moveTo(canvas.width - 5, 5);
      ctx.lineTo(canvas.width - cornerSize, 5);
      ctx.stroke();
      
      // アニメーションを継続
      if (isDataTransferring) {
        transferAnimationFrameRef.current = requestAnimationFrame(animate);
      }
    }
    
    // アニメーションを開始
    animate();
    
    // クリーンアップ関数
    return () => {
      console.log("近未来的ビジネススタイルデータ転送アニメーション停止");
      if (transferAnimationFrameRef.current) {
        cancelAnimationFrame(transferAnimationFrameRef.current);
        transferAnimationFrameRef.current = null;
      }
    };
  }, [isDataTransferring, dataPackets, analysisStartTime]);

  // データ転送完了時にスライド最適化フェーズに移行するための監視
  useEffect(() => {
    if (dataTransferComplete && !isSlideOptimizing) {
      console.log("データ転送完了を検出。スライド最適化フェーズに移行します。");
      // 遅延を少し設けてステート変更の競合を避ける
      const timer = setTimeout(() => {
        setIsSlideOptimizing(true);
        console.log("スライド最適化フェーズに移行しました。isSlideOptimizing:", true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [dataTransferComplete, isSlideOptimizing]);

  // 水晶球アニメーションの描画
  useEffect(() => {
    if (!isAnalyzing || !sphereCanvasRef.current) return;
    
    console.log("球体アニメーション開始");
    
    // キャンバスとコンテキストの取得
    const canvas = sphereCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスサイズを設定 - 親要素のサイズに合わせる
    const setCanvasSize = () => {
      // コンテナのサイズを取得
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      } else {
        // デフォルトサイズ
        canvas.width = 450;
        canvas.height = 450;
      }
    };
    
    setCanvasSize();
    
    // ウィンドウリサイズ時に再設定
    const handleResize = () => {
      setCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);

    // 型定義
    interface StarDot {
      x: number;
      y: number;
      z: number;
      radius: number;
      color: string;
      brightness: number;
      twinkle: number;
      twinkleOffset: number;
    }
    
    // 点の配列を定義
    const dots: StarDot[] = [];
    
    // 天体風の色の配列
    const starColors = [
      'rgba(0, 255, 255, 0.9)',  // 明るいシアン
      'rgba(0, 210, 255, 0.8)',  // シアンブルー
      'rgba(0, 190, 230, 0.8)',  // やや暗いシアン
      'rgba(0, 170, 210, 0.7)',  // 深いシアン
      'rgba(0, 150, 190, 0.7)',  // 濃いシアンブルー
      'rgba(110, 220, 255, 0.7)' // 明るいシアンブルー
    ];
    
    // 球体上に点を生成
    const generateSphere = () => {
      // キャンバスのサイズが変わっている可能性があるので再取得
      const canvasSize = Math.min(canvas.width, canvas.height);
      const numDots = 1500; // 点の数
      const radius = canvasSize * 0.45; // 球体の半径を完全な円形にするために最小値を使用
      
      dots.length = 0; // 配列をクリア
      
      for (let i = 0; i < numDots; i++) {
        // 球面上の点を均等に分布させる
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u; // 0～2π（経度）
        const phi = Math.acos(2 * v - 1); // 0～π（緯度）
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        // ランダムな大きさとランダムな色を割り当て
        const randomSize = Math.random();
        const starSize = randomSize * 2.5 + 0.3; // 大きさをよりバリエーション豊かに
        const colorIndex = Math.floor(Math.random() * starColors.length);
        const brightness = randomSize * 0.7 + 0.3; // 明るさもランダムに
        
        // 星の瞬きのパラメータ
        const twinkle = Math.random() * 0.08 + 0.04; // 瞬きの速度をさらに速く
        const twinkleOffset = Math.random() * Math.PI * 2; // 瞬きの初期位相
        
        dots.push({
          x, y, z,
          radius: starSize,
          color: starColors[colorIndex],
          brightness: brightness,
          twinkle: twinkle,
          twinkleOffset: twinkleOffset
        });
      }
    };
    
    generateSphere();
    
    // アニメーションフレーム
    let angle = 0;
    let time = 0;
    
    const animate = () => {
      try {
        // キャンバスをクリア
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 完全な円形の背景を描画
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 * 0.95, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fill();
        
        // 中心点を正確に計算
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        
        // 共通で使用する半径を定義
        const targetRadius = Math.min(canvas.width, canvas.height) * 0.45;
        
        // 回転角度と時間を更新
        angle += 0.006; // 回転を少し遅く
        time += 0.016; // 約60fpsで1秒あたり1増加
        
        // 点を描画
        for (const dot of dots) {
          // 回転行列を適用（Y軸周り）
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);
          
          const rotatedX = dot.x * cosAngle - dot.z * sinAngle;
          const rotatedZ = dot.x * sinAngle + dot.z * cosAngle;
          
          // Z値に基づいて大きさと透明度を調整（完全な球体効果のために調整）
          const scale = (rotatedZ + targetRadius) / (targetRadius * 2);
          
          // 瞬きのエフェクト（サイン波で明るさを変化させる）
          const twinkleEffect = Math.sin(time * dot.twinkle + dot.twinkleOffset) * 0.3 + 0.7;
          const size = Math.max(0.1, Math.min(dot.radius * (0.5 + scale) * twinkleEffect, 10)); // 最小・最大値を設定
          const alpha = Math.max(0.1, Math.min((0.1 + scale * dot.brightness) * twinkleEffect, 1.0)); // 最小・最大値を設定
          
          // baseColorを計算
          const baseColor = dot.color.replace(/[^,]+(?=\))/, alpha.toString());
          
          // グラデーションを使って輝く星を表現
          const exactX = Math.round(centerX + rotatedX);
          const exactY = Math.round(centerY + dot.y);

          // 画面内の点のみ描画（完全な円形を保つため）
          const distance = Math.sqrt(Math.pow(exactX - centerX, 2) + Math.pow(exactY - centerY, 2));
          if (distance <= targetRadius) {
            const grd = ctx.createRadialGradient(
              exactX, exactY, 0,
              exactX, exactY, size * 2
            );
            
            // グラデーションカラーストップを設定
            grd.addColorStop(0, baseColor);
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // 点を描画
            ctx.beginPath();
            ctx.arc(
              exactX,
              exactY,
              size,
              0, Math.PI * 2
            );
            ctx.fillStyle = baseColor;
            ctx.fill();
            
            // 明るい星には輝きを追加
            if (dot.radius > 1.5) {
              ctx.beginPath();
              ctx.arc(
                exactX,
                exactY,
                size * 1.8,
                0, Math.PI * 2
              );
              ctx.fillStyle = grd;
              ctx.fill();
              
              // 最も明るい星には十字の光芒を追加
              if (dot.radius > 2.0 && isFinite(size)) {
                const glowSize = isFinite(size * 3) ? size * 3 : 6;
                
                if (isFinite(exactX) && isFinite(exactY) && isFinite(glowSize)) {
                  // 水平の光芒
                  ctx.beginPath();
                  ctx.moveTo(exactX - glowSize, exactY);
                  ctx.lineTo(exactX + glowSize, exactY);
                  ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(alpha * 0.3, 1)})`;
                  ctx.lineWidth = Math.max(0.1, Math.min(size * 0.5, 10)); // 範囲を制限
                  ctx.stroke();
                  
                  // 垂直の光芒
                  ctx.beginPath();
                  ctx.moveTo(exactX, exactY - glowSize);
                  ctx.lineTo(exactX, exactY + glowSize);
                  ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(alpha * 0.3, 1)})`;
                  ctx.lineWidth = Math.max(0.1, Math.min(size * 0.5, 10)); // 範囲を制限
                  ctx.stroke();
                }
              }
            }
          }
        }
        
        // 次のフレームをリクエスト
        animationFrameRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error("Animation error:", error);
        // エラーが発生しても続行
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // アニメーションを開始
    animate();
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isAnalyzing]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* サイドバー */}
      <div 
        ref={sidebarRef}
        className="h-screen glass-container flex-shrink-0 overflow-y-auto"
        style={{ 
          width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
          transition: 'width 0.3s ease',
          overflow: isSidebarOpen ? 'visible' : 'hidden'
        }}
      >
        <div className="p-4">
          <div className="flex items-center mb-6 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold">SP</span>
            </div>
            <h1 className="text-xl font-bold">SalesPlanMaker</h1>
          </div>
          
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-4">メニュー</h2>
            <ul className="space-y-2">
              <li className="p-2 bg-white/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75M9 9h2.25" />
                    </svg>
                  </div>
                  <span>特許分析</span>
                </div>
              </li>
              <li className="p-2 bg-white/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <span>人材発掘</span>
                </div>
              </li>
              <li className="p-2 bg-white/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                  </div>
                  <span>市場調査</span>
                </div>
              </li>
              <li className="p-2 bg-white/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <span>進捗確認</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* システム設定セクション */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-4">システム設定</h2>
            <ul className="space-y-2">
              <li className="p-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-cyan-500/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.379.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.379-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>検出設定</span>
                </div>
              </li>
              <li className="p-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-cyan-500/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  </div>
                  <span>音声解析</span>
                </div>
              </li>
              <li className="p-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-cyan-500/30 transition duration-200">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>詳細設定</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* リサイズハンドル */}
      {isSidebarOpen && (
        <div 
          className="w-1 h-screen cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors duration-200"
          onMouseDown={startResize}
        ></div>
      )}
      
      {/* メニューボタン - サイドバーが閉じているときのみ表示 */}
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center hover:bg-white transition-colors duration-200"
          onClick={() => setIsSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}
      
      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        {/* 背景画像 */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -10,
          }}
        />
        
        <div className="container mx-auto p-4 max-w-full">
          <header className="text-center my-4">
            <h1 className="text-7xl font-medium text-white drop-shadow-lg">
              <span className="animate-gradient bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-white bg-size-200">
                Sales Plan Maker
              </span>
            </h1>
          </header>
          
          <div className="mt-2 pb-4">
            <FaceAnalyzer onFaceDetected={handleFaceDetection} />
          </div>
        </div>

        {/* クリスタル円形ボタン */}
        <div className="fixed bottom-8 right-8 z-50">
          {/* 光るリングアニメーション - 外側 */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse" style={{ width: '13rem', height: '13rem', margin: '-0.5rem' }}></div>
          {/* 光るリングアニメーション - 中間 */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/15 animate-pulse" style={{ width: '12.5rem', height: '12.5rem', margin: '-0.25rem', animationDelay: '0.5s' }}></div>
          {/* 光るリングアニメーション - 内側 */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse" style={{ width: '12rem', height: '12rem', margin: '-0.1rem', animationDelay: '1s' }}></div>
          
          <button 
            ref={cristalButtonRef}
            onClick={handleCristalClick}
            className="w-48 h-48 rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 focus:outline-none shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 relative z-10"
          >
            <img src="/CRISTAL.png" alt="CRISTAL" className="w-full h-full object-cover pointer-events-none" />
          </button>
        </div>
      </div>

      {/* メッセージモーダル */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-gray-900/95 rounded-xl w-[95vw] max-w-[1800px] h-[95vh] max-h-[1000px] overflow-auto p-8 shadow-2xl border border-cyan-500/40 transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <div></div>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* コンテンツコンテナ - 高さを最大化 */}
            <div className="h-[calc(95vh-120px)] flex flex-col justify-center overflow-y-auto">
              {isAnalyzing ? (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-2 h-full">
                  {/* 球体アニメーション - 左側に配置 */}
                  <div className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0">
                    <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] aspect-square rounded-full overflow-hidden flex items-center justify-center bg-black border-[3px] border-cyan-500/40 shadow-xl shadow-cyan-500/30">
                      <div className="absolute inset-0 rounded-full border-[1px] border-cyan-500/20"></div>
                      <canvas 
                        ref={sphereCanvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ borderRadius: '50%' }}
                      />
                    </div>
                  </div>
                  
                  {/* テキストコンテンツとプログレスバー - 右側に配置 */}
                  <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
                    {/* タイトルと説明テキスト */}
                    <div className="text-center lg:text-left mb-6">
                      <h4 className="text-4xl md:text-5xl font-medium text-cyan-400 tracking-wider font-mono">CRISTAL ANALYSIS</h4>
                      <p className="text-cyan-300/70 text-lg md:text-xl mt-2">Cristalが商談を解析中</p>
                    </div>
                    
                    {/* 説明文とプログレスバーを一つのコンテナにまとめる */}
                    <div className="w-full bg-black/40 p-6 rounded-lg border border-cyan-500/20">
                      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        {/* マイク音声視覚化 - さらに大きく */}
                        <div className="w-full md:w-1/2 bg-black/60 rounded-lg border-2 border-cyan-500/40 p-6 h-40 flex items-end justify-center shadow-xl shadow-cyan-500/20">
                          <div className="relative w-full h-36 flex items-end justify-center space-x-1.5">
                            {/* マイク波形アニメーション - JSによるリアルタイム更新式 */}
                            {Array.from({ length: 32 }).map((_, index) => {
                              // 波形バーの高さを5%〜70%の間でランダムに
                              const randomHeight = 5 + Math.floor(Math.random() * 65);
                              return (
                                <div 
                                  key={index}
                                  className="mic-wave-bar w-1.5 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-t-md"
                                  style={{ 
                                    height: `${randomHeight}%`,
                                    animation: `moveBar 1.5s ease-in-out infinite`,
                                    animationDelay: `${index * 0.05}s`,
                                    boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)'
                                  }}
                                ></div>
                              )
                            })}
                            
                            {/* マイクアイコン - 中央に配置 */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-500/40 rounded-full p-3.5 border-2 border-cyan-500/70 shadow-xl shadow-cyan-500/40">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                            </div>
                            
                            {/* 追加: 音声波形の円形エフェクト - 大きく、複数層に */}
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full border-2 border-cyan-500/30 opacity-40 animate-pulse"></div>
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full border border-cyan-500/20 opacity-30"></div>
                            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-56 h-56 rounded-full border border-cyan-500/10 opacity-20"></div>
                          </div>
                        </div>
                        
                        {/* テキスト説明 - 右側に配置 */}
                        <div className="w-full md:w-1/2">
                          <p className="text-base md:text-xl text-gray-300 leading-relaxed">
                            高度な<span className="text-cyan-400">アルゴリズム</span>により、<span className="text-cyan-400">声紋</span>と<span className="text-cyan-400">表情データ</span>を分析しています。表面的な感情と内面の感情の<span className="text-cyan-400">ギャップ</span>を検出し、真の意図を解析します。
                          </p>
                        </div>
                      </div>

                      <div className="mb-3 flex justify-between items-center">
                        <span className="text-sm text-cyan-300/90">データ解析進捗</span>
                        <span className="text-sm font-medium text-cyan-300/90">
                          <span className="text-cyan-400">{Math.floor(isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 50) : 100)}%</span> 完了
                        </span>
                      </div>
                      
                      {/* メインプログレスバー - アニメーション強化 */}
                      <div className="h-5 w-full bg-gray-900 rounded-full overflow-hidden backdrop-blur-sm p-[1px] border-2 border-cyan-500/30 relative shadow-xl shadow-cyan-500/20">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-blue-500 rounded-full relative overflow-hidden"
                          style={{ 
                            width: `${isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 50) : 100}%`,
                            transition: 'width 0.5s ease'
                          }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.5)_0%,_transparent_60%)] animate-pulse-slow"></div>
                          
                          {/* 追加のスキャンラインアニメーション - 大きく明るく */}
                          <div 
                            className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white to-transparent"
                            style={{
                              left: '-100%',
                              animation: 'scanline 1.2s ease-in-out infinite',
                              filter: 'blur(3px)'
                            }}
                          ></div>
                        </div>
                        
                        {/* プログレスバー上の光る粒子 - より多く、より大きく */}
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div 
                            key={index}
                            className="absolute h-2 w-2 rounded-full bg-white/90 top-1/2 transform -translate-y-1/2"
                            style={{ 
                              left: `${(Math.sin(Date.now() / 600 + index) + 1) / 2 * 100}%`,
                              opacity: Math.sin(Date.now() / 300 + index) / 2 + 0.5,
                              filter: 'blur(1px) drop-shadow(0 0 4px rgba(6, 182, 212, 0.9))'
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* サブプログレスバー - 高さ増加 */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-cyan-300/90">表情分析</span>
                            <span className="text-cyan-300/90">完了</span>
                          </div>
                          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-cyan-500 w-full relative">
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.3)_50%,_rgba(255,255,255,0)_100%)] animate-shimmer"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-cyan-300/90">声紋分析</span>
                            <span className="text-cyan-300/90">{Math.floor(isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 40) : 100)}%</span>
                          </div>
                          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full bg-cyan-400"
                              style={{ 
                                width: `${isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 40) : 100}%`
                              }}
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.3)_50%,_rgba(255,255,255,0)_100%)] animate-shimmer"></div>
                            </div>
                            <div 
                              className="absolute top-0 bottom-0 w-4 bg-white/60"
                              style={{
                                left: `${isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 40) : 100}%`,
                                filter: 'blur(3px)',
                                transform: 'translateX(-50%)'
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-cyan-300/90">感情マッピング</span>
                            <span className="text-cyan-300/90">{Math.floor(isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 45) : 100)}%</span>
                          </div>
                          <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ 
                                width: `${isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 45) : 100}%`
                              }}
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.3)_50%,_rgba(255,255,255,0)_100%)] animate-shimmer"></div>
                            </div>
                            <div 
                              className="absolute top-0 bottom-0 w-4 bg-white/60"
                              style={{
                                left: `${isAnalyzing ? Math.min(99, (Date.now() - analysisStartTime) / 45) : 100}%`,
                                filter: 'blur(3px)',
                                transform: 'translateX(-50%)'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : dataTransferComplete ? (
                <div className="w-full h-full">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">スライド最適化フェーズ</h3>
                    <p className="text-cyan-300 mt-2">顧客ニーズに合わせた資料の自動最適化を行っています</p>
                  </div>
                  <PresentationSlide 
                    isVisible={true} 
                    onComplete={handleSlideOptimizationComplete}
                  />
                </div>
              ) : isDataTransferring ? (
                <div className="space-y-6 h-full flex flex-col">
                  <h3 className="text-2xl font-medium text-white text-center">データ転送中 - 戦略プランニングを準備しています</h3>
                  
                  <div className="relative w-full h-80 bg-black/40 rounded-xl border border-cyan-500/20 overflow-hidden flex-grow">
                    <canvas
                      ref={dataTransferCanvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="bg-black/30 p-5 rounded-lg border border-cyan-500/20">
                      <div className="flex items-center mb-3">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full mr-3"></div>
                        <span className="text-cyan-400 text-lg font-medium">商談分析エージェント</span>
                      </div>
                      <p className="text-gray-300 text-base">
                        表情分析データと音声パターンから検出した真意を戦略エージェントに転送しています。
                      </p>
                    </div>
                    
                    <div className="bg-black/30 p-5 rounded-lg border border-blue-500/20">
                      <div className="flex items-center mb-3">
                        <div className="w-4 h-4 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-blue-400 text-lg font-medium">戦略プランニングエージェント</span>
                      </div>
                      <p className="text-gray-300 text-base">
                        分析結果を基に最適な営業戦略を立案しています。対応案、スケジュール、提案内容を調整しています。
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <div className="w-full enterprise-progress-container rounded-sm overflow-hidden shadow-lg">
                        <div 
                          className="h-full enterprise-progress-bar"
                          style={{ width: `${Math.min(99, (Date.now() - analysisStartTime) / 50)}%` }}
                        >
                          <div className="enterprise-progress-glow"></div>
                        </div>
                      </div>
                      <div className="ml-4 text-cyan-400 text-lg whitespace-nowrap">
                        <div className="enterprise-text">データ転送中...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : analysisComplete ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-8 mb-4">
                    <div className="w-28 h-28 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <img src="/CRISTAL.png" alt="CRISTAL" className="w-24 h-24 object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white text-4xl font-medium">CRISTAL Analysis</h4>
                      <p className="text-cyan-300 text-2xl mt-2">高度AI感情分析結果</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-auto">
                    <div className="md:w-2/3">
                      <div className="bg-black/40 rounded-lg p-8 border border-cyan-500/20 h-full">
                        <h5 className="text-cyan-400 text-2xl font-medium mb-6">ディープアナリシス 完了</h5>
                        
                        <div className="text-gray-200 text-xl leading-relaxed space-y-8">
                          <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/10">
                            <span className="block pb-2">音声データと表情解析から、<span className="text-cyan-400 font-semibold">表面的には肯定しながらも内心では懸念を抱いている可能性</span>があります。</span>
                          </div>
                          
                          <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/10">
                            <span className="block pb-2"><span className="text-cyan-400 font-semibold">「いいサービスだとおもんですけどね、、、」</span>と発言時、声のトーンが<span className="text-cyan-300">15%</span>低下し、微笑みながらも眼輪筋の動きが通常の笑顔と<span className="text-cyan-300">73%</span>異なりました。</span>
                          </div>
                          
                          <div className="p-4 bg-black/30 rounded-lg border border-cyan-500/10">
                            <span className="block">この際、視線が下方に向き、微細なため息も検出されました。</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-1/3 space-y-6">
                      <div className="bg-black/40 rounded-lg p-6 border border-cyan-500/20 flex justify-between items-center">
                        <div className="text-lg text-cyan-400">信頼性スコア</div>
                        <div className="text-white font-medium text-4xl">89.7%</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-6 border border-cyan-500/20 flex justify-between items-center">
                        <div className="text-lg text-cyan-400">データポイント</div>
                        <div className="text-white font-medium text-4xl">217</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-6 border border-cyan-500/20 flex justify-between items-center">
                        <div className="text-lg text-cyan-400">分析深度</div>
                        <div className="text-white font-medium text-4xl">レベル4</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sticky bottom-0 bg-gray-900/80 backdrop-blur-sm p-4 -mx-8 -mb-8 rounded-b-xl border-t border-cyan-500/20">
                    <button 
                      onClick={() => {
                        console.log("プランニング実行ボタンがクリックされました");
                        // 直接ステートを更新して転送画面に切り替え
                        setIsAnalyzing(false);
                        setAnalysisComplete(false);
                        setIsDataTransferring(true);
                        
                        // 初期データパケットを生成
                        const newPackets = [];
                        for (let i = 0; i < 30; i++) {
                          newPackets.push({
                            x: Math.random() * 0.3,
                            y: Math.random(),
                            size: Math.random() * 5 + 2,
                            speed: Math.random() * 0.01 + 0.005
                          });
                        }
                        setDataPackets(newPackets);
                        
                        // 5秒後にアニメーション完了
                        setTimeout(() => {
                          console.log("データ転送完了");
                          setIsDataTransferring(false);
                          setDataTransferComplete(true);
                          console.log("データ転送完了フラグ設定: dataTransferComplete =", true);
                          
                          // スライド最適化フェーズに直接移行する
                          // 注: このタイマーで設定している場合と、useEffectでの監視の両方で移行を試みています
                          setTimeout(() => {
                            console.log("タイマーによるスライド最適化フェーズへの移行を試みます");
                            setIsSlideOptimizing(true);
                            console.log("スライド最適化状態を設定: isSlideOptimizing =", true);
                          }, 1000);
                        }, 5000);
                      }}
                      className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold text-2xl"
                    >
                      プランニング実行
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                      <img src="/CRISTAL.png" alt="CRISTAL" className="w-16 h-16 object-cover" />
                    </div>
                    <div>
                      <h4 className="text-2xl text-white font-medium">CRISTAL System</h4>
                      <p className="text-cyan-300 text-lg">感情分析AI</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-black/60 to-blue-900/20 border-l-4 border-cyan-500 pl-5 pr-3 py-4 rounded-lg">
                    <p className="text-gray-200 text-lg leading-relaxed">
                      顧客の感情状態をリアルタイムで分析し、最適な提案内容を自動生成します。あなたの表情から検出された感情に基づいて、提案内容を自動調整します。
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="bg-black/40 rounded-lg p-6 border border-cyan-500/20">
                      <h5 className="text-cyan-400 text-lg font-medium mb-4">現在の状態</h5>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white text-lg">感情検出</span>
                        <span className="text-cyan-300 text-lg font-medium">アクティブ</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white text-lg">検出感情</span>
                        <span className="text-cyan-300 text-lg font-medium">{currentEmotion === 'neutral' ? '無表情' : 
                                                          currentEmotion === 'happy' ? '喜び' : 
                                                          currentEmotion === 'sad' ? '悲しみ' : 
                                                          currentEmotion === 'angry' ? '怒り' :
                                                          currentEmotion === 'fearful' ? '恐れ' :
                                                          currentEmotion === 'disgusted' ? '嫌悪' :
                                                          currentEmotion === 'surprised' ? '驚き' : '不明'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-6 border border-cyan-500/20">
                      <h5 className="text-cyan-400 text-lg font-medium mb-4">システム情報</h5>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white text-lg">バージョン</span>
                        <span className="text-cyan-300 text-lg font-medium">3.5.2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white text-lg">精度</span>
                        <span className="text-cyan-300 text-lg font-medium">93.7%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button 
                      onClick={closeModal}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xl rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* アニメーションのためのスタイルを追加 */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-gradient {
          animation: gradientMove 8s linear infinite;
          background-size: 200% auto;
        }
        
        .bg-size-200 {
          background-size: 200% auto;
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s linear infinite;
          background-size: 200% 100%;
        }
        
        @keyframes pulse-width {
          0% { width: 0%; }
          50% { width: 70%; }
          90% { width: 95%; }
          100% { width: 0%; }
        }
        
        .animate-pulse-width {
          animation: pulse-width 1.5s ease-in-out infinite;
        }
        
        /* 新しい近未来的エンタープライズスタイル */
        .enterprise-progress-container {
          height: 10px;
          background: linear-gradient(90deg, rgba(10, 20, 40, 0.8), rgba(15, 30, 60, 0.9), rgba(10, 20, 40, 0.8));
          border: 1px solid rgba(30, 136, 229, 0.3);
          box-shadow: 0 0 10px rgba(0, 172, 193, 0.2), inset 0 0 5px rgba(0, 0, 0, 0.5);
        }
        
        .enterprise-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(30, 136, 229, 0.9), 
            rgba(0, 172, 193, 1), 
            rgba(100, 255, 218, 0.9),
            rgba(0, 172, 193, 1), 
            rgba(30, 136, 229, 0.9));
          background-size: 200% 100%;
          animation: gradient-x 3s linear infinite;
          position: relative;
          overflow: hidden;
        }
        
        .enterprise-progress-glow {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 20px;
          background: linear-gradient(90deg, 
            rgba(100, 255, 218, 0), 
            rgba(100, 255, 218, 0.8));
          filter: blur(4px);
          opacity: 0.8;
        }
        
        .enterprise-text {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-shadow: 0 0 10px rgba(0, 172, 193, 0.8);
          position: relative;
          display: inline-block;
        }
        
        .enterprise-text::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            rgba(100, 255, 218, 0),
            rgba(100, 255, 218, 0.8),
            rgba(100, 255, 218, 0));
        }
      `}</style>
    </div>
  )
} 