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
ええ
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
    
    console.log("データ転送アニメーション開始");
    
    // キャンバスとコンテキストの取得
    const canvas = dataTransferCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // キャンバスサイズを設定
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // 商談分析エージェントと戦略エージェントのアイコン位置
    const sourceX = canvas.width * 0.2;
    const targetX = canvas.width * 0.8;
    const centerY = canvas.height / 2;
    
    // ローカルのパケットデータ（コピーを作成）
    const localPackets = [...dataPackets];
    
    // アニメーションループ関数
    function animate() {
      if (!canvas || !ctx) return;
      
      // キャンバスをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 背景の薄いグリッド
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // グリッド描画
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // 商談分析エージェントのアイコン
      ctx.beginPath();
      ctx.arc(sourceX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 商談分析アイコン内のグラフィック
      ctx.beginPath();
      ctx.moveTo(sourceX - 10, centerY);
      ctx.lineTo(sourceX - 10, centerY + 10);
      ctx.lineTo(sourceX, centerY - 5);
      ctx.lineTo(sourceX + 10, centerY + 15);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 戦略エージェントのアイコン
      ctx.beginPath();
      ctx.arc(targetX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 戦略エージェントアイコン内のグラフィック
      ctx.beginPath();
      ctx.moveTo(targetX - 15, centerY);
      ctx.lineTo(targetX + 15, centerY);
      ctx.moveTo(targetX, centerY - 15);
      ctx.lineTo(targetX, centerY + 15);
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 接続線
      ctx.beginPath();
      ctx.moveTo(sourceX + 30, centerY);
      ctx.lineTo(targetX - 30, centerY);
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // 脈動するエフェクト
      const pulseSize = Math.sin(Date.now() * 0.005) * 5 + 45;
      
      // 脈動エフェクト描画
      ctx.beginPath();
      ctx.arc(sourceX, centerY, pulseSize, 0, Math.PI * 2);
      const gradient1 = ctx.createRadialGradient(sourceX, centerY, 30, sourceX, centerY, pulseSize);
      gradient1.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
      gradient1.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = gradient1;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(targetX, centerY, pulseSize, 0, Math.PI * 2);
      const gradient2 = ctx.createRadialGradient(targetX, centerY, 30, targetX, centerY, pulseSize);
      gradient2.addColorStop(0, 'rgba(0, 150, 255, 0.2)');
      gradient2.addColorStop(1, 'rgba(0, 150, 255, 0)');
      ctx.fillStyle = gradient2;
      ctx.fill();
      
      // データパケットの描画
      for (let i = 0; i < localPackets.length; i++) {
        const packet = localPackets[i];
        
        // パケットを移動
        packet.x += packet.speed;
        if (packet.x > 1) {
          packet.x = Math.random() * 0.1;
        }
        
        const xPos = sourceX + (targetX - sourceX) * packet.x;
        const yPos = centerY + (packet.y - 0.5) * 80;
        
        // パケットを描画
        ctx.beginPath();
        ctx.arc(xPos, yPos, packet.size, 0, Math.PI * 2);
        
        // 進行度合いによって色を変える
        const alpha = 0.7 + (packet.x * 0.3);
        const blueVal = 200 + Math.floor(packet.x * 55);
        
        ctx.fillStyle = `rgba(0, ${blueVal}, 255, ${alpha})`;
        ctx.fill();
        
        // 光るエフェクト
        ctx.beginPath();
        ctx.arc(xPos, yPos, packet.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, packet.size * 2);
        gradient.addColorStop(0, `rgba(0, ${blueVal}, 255, 0.3)`);
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // アニメーションを継続
      if (isDataTransferring) {
        transferAnimationFrameRef.current = requestAnimationFrame(animate);
      }
    }
    
    // アニメーションを開始
    animate();
    
    // クリーンアップ関数
    return () => {
      console.log("データ転送アニメーション停止");
      if (transferAnimationFrameRef.current) {
        cancelAnimationFrame(transferAnimationFrameRef.current);
        transferAnimationFrameRef.current = null;
      }
    };
  }, [isDataTransferring, dataPackets]);

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
                      <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse-width"></div>
                      </div>
                      <div className="ml-4 text-cyan-400 text-lg whitespace-nowrap">
                        <div className="animate-pulse">データ転送中...</div>
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
          90% { width: 90%; }
          100% { width: 100%; }
        }
        
        .animate-pulse-width {
          animation: pulse-width 5s forwards;
        }
        
        @keyframes scanline {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes ping-slow {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
        }
        
        @keyframes moveBar {
          0% { height: 5%; }
          50% { height: 70%; }
          100% { height: 5%; }
        }
      `}</style>
    </div>
  )
} 