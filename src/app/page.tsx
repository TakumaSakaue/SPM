'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'

// FaceAnalyzerコンポーネントをクライアントサイドでのみ読み込む
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

const ConsultingSlide = dynamic(
  () => import('@/components/ConsultingSlide'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full bg-white/10 backdrop-blur-md animate-pulse rounded-2xl">
        <p className="text-gray-500">コンサルティングスライドを読み込み中...</p>
      </div>
    )
  }
)

const StarrySphere = dynamic(
  () => import('@/components/StarrySphere'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-32 bg-black/30 rounded-lg">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin"></div>
      </div>
    )
  }
)

export default function Home() {
  // 状態管理
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [sidebarWidth, setSidebarWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth * 0.4 : 480)
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
  const [isConsultingSlideOpen, setIsConsultingSlideOpen] = useState<boolean>(false)
  const [isFaceAnalysisActive, setIsFaceAnalysisActive] = useState<boolean>(false)

  // メッセージフィールドの状態管理
  const [messageText, setMessageText] = useState<string>('')

  // CRISTAL推奨アクション状態管理
  const [cristalInputState, setCristalInputState] = useState<'input' | 'loading' | 'results'>('input')
  const [recommendedActions, setRecommendedActions] = useState<Array<{title: string, reason: string}>>([])
  const [cristalLoadingProgress, setCristalLoadingProgress] = useState<number>(0)
  const [cristalAnalysisText, setCristalAnalysisText] = useState<string>('')
  const cristalLoadingCanvasRef = useRef<HTMLCanvasElement>(null)
  const cristalLoadingAnimationRef = useRef<number | null>(null)

  // Hydrationエラー対策の状態管理
  const [aiConfidence, setAiConfidence] = useState<number>(85)
  const [progressValues, setProgressValues] = useState({
    main: 87,
    emotion: 92,
    voice: 89
  })
  const [currentTime, setCurrentTime] = useState<string>('')

  // 画面リサイズ時にサイドバー幅を調整
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setSidebarWidth(window.innerWidth * 0.4)
      }
    }

    // 初期設定
    if (typeof window !== 'undefined') {
      setSidebarWidth(window.innerWidth * 0.4)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    const newWidth = Math.max(200, Math.min(window.innerWidth * 0.6, startWidthRef.current + deltaX))
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
    setDetectedFace(face)
    setCurrentEmotion(emotion)
  }

  // Hydrationエラー対策のクライアントサイド更新
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ja-JP'))
    }
    
    const updateAiConfidence = () => {
      setAiConfidence(85 + Math.floor(Math.random() * 10))
    }

    const updateProgressValues = () => {
      setProgressValues({
        main: 85 + Math.floor(Math.random() * 10),
        emotion: 90 + Math.floor(Math.random() * 8),
        voice: 87 + Math.floor(Math.random() * 8)
      })
    }

    // 初期値設定
    updateTime()
    updateAiConfidence()
    updateProgressValues()

    // 定期更新
    const timeInterval = setInterval(updateTime, 1000)
    const confidenceInterval = setInterval(updateAiConfidence, 3000)
    const progressInterval = setInterval(updateProgressValues, 2000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(confidenceInterval)
      clearInterval(progressInterval)
    }
  }, [])

  // アニメーションドットのためのエフェクト
  useEffect(() => {
    if (isAnalyzing) {
      const dotInterval = setInterval(() => {
        setAnalysisDots(prev => {
          if (prev.length >= 3) return ''
          return prev + '.'
        })
      }, 400)
      
      return () => clearInterval(dotInterval)
    }
  }, [isAnalyzing])
  
  // 表情分析・音声分析の状態を切り替える
  const handleAnalysisToggle = (isActive: boolean) => {
    setIsFaceAnalysisActive(isActive)
    console.log(`分析状態が変更されました: ${isActive ? 'ON' : 'OFF'}`)
  }

  // 球体アニメーションのコントロール（古い機能は残しておく）
  const handleCristalClick = () => {
    setIsModalOpen(true)
    // 分析完了画面を表示（プランニング実行ボタンが表示される）
    setAnalysisComplete(true)
  }

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsModalOpen(false)
    setIsAnalyzing(false)
    setAnalysisComplete(false)
    setIsDataTransferring(false)
    setDataTransferComplete(false)
    setIsSlideOptimizing(false)
    // CRISTAL状態もリセット
    resetCristalState()
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (transferAnimationFrameRef.current) {
      cancelAnimationFrame(transferAnimationFrameRef.current)
      transferAnimationFrameRef.current = null
    }
    if (cristalLoadingAnimationRef.current) {
      cancelAnimationFrame(cristalLoadingAnimationRef.current)
      cristalLoadingAnimationRef.current = null
    }
  }

  // モーダル外クリックで閉じる処理
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConsultingSlideOpen) {
          setIsConsultingSlideOpen(false)
        } else if (isModalOpen) {
          closeModal()
        }
      }
    }
    
    if (isModalOpen || isConsultingSlideOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isModalOpen, isConsultingSlideOpen])

  // データ転送アニメーションを開始
  const startDataTransfer = () => {
    console.log('プランニング実行ボタンがクリックされました')
    // 分析完了状態をリセット
    setAnalysisComplete(false)
    // 直接スライド最適化フェーズに移行
    setDataTransferComplete(true)
    setIsSlideOptimizing(true)
    console.log('スライド最適化フェーズに移行しました')
  }

  // スライド最適化完了時の処理
  const handleSlideOptimizationComplete = () => {
    setTimeout(() => {
      setIsSlideOptimizing(false)
      closeModal()
    }, 2000)
  }

  // データ転送アニメーションのレンダリング
  useEffect(() => {
    if (!isDataTransferring || !dataTransferCanvasRef.current) return
    
    const canvas = dataTransferCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    
    const sourceX = canvas.width * 0.2
    const targetX = canvas.width * 0.8
    const centerY = canvas.height / 2
    
    const localPackets = [...dataPackets]
    
    function animate() {
      if (!canvas || !ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 背景グラデーション
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, '#050c1a')
      bgGradient.addColorStop(1, '#091832')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 接続線
      const gradient = ctx.createLinearGradient(sourceX, centerY, targetX, centerY)
      gradient.addColorStop(0, '#1E88E5')
      gradient.addColorStop(1, '#00ACC1')
      
      ctx.beginPath()
      ctx.moveTo(sourceX + 30, centerY)
      ctx.lineTo(targetX - 30, centerY)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.stroke()
      
      // ノード描画
      for (let i = 0; i < 2; i++) {
        const x = i === 0 ? sourceX : targetX
        const radius = 50
        
        ctx.beginPath()
        ctx.arc(x, centerY, radius, 0, Math.PI * 2)
        ctx.fillStyle = i === 0 ? 'rgba(30, 136, 229, 0.9)' : 'rgba(0, 172, 193, 0.9)'
        ctx.fill()
        
        const pulseSize = radius + Math.sin(Date.now() * 0.003) * 3
        ctx.beginPath()
        ctx.arc(x, centerY, pulseSize, 0, Math.PI * 2)
        ctx.strokeStyle = i === 0 ? 'rgba(30, 136, 229, 0.5)' : 'rgba(0, 172, 193, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      
      // データパケット
      for (let i = 0; i < localPackets.length; i++) {
        const packet = localPackets[i]
        
        packet.x += packet.speed
        if (packet.x > 1) {
          packet.x = Math.random() * 0.1
          packet.y = Math.random()
          packet.size = Math.random() * 5 + 2
          packet.speed = Math.random() * 0.01 + 0.005
        }
        
        const xPos = sourceX + (targetX - sourceX) * packet.x
        const amplitude = 40 + Math.sin(packet.x * Math.PI) * 20
        const yPos = centerY + (packet.y - 0.5) * amplitude
        
        const alpha = 0.7 + (packet.x * 0.3)
        const r = Math.floor(20 + packet.x * 40)
        const g = Math.floor(100 + packet.x * 60)
        const b = Math.floor(200 + packet.x * 55)
        
        ctx.beginPath()
        ctx.arc(xPos, yPos, packet.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fill()
      }
      
      // 進捗バー
      const progress = Math.min(99, (Date.now() - analysisStartTime) / 50)
      ctx.fillStyle = 'rgba(10, 30, 66, 0.6)'
      ctx.fillRect(canvas.width * 0.1, canvas.height - 40, canvas.width * 0.8, 20)
      
      const progressGradient = ctx.createLinearGradient(canvas.width * 0.1, 0, canvas.width * 0.9, 0)
      progressGradient.addColorStop(0, 'rgba(30, 136, 229, 0.8)')
      progressGradient.addColorStop(0.5, 'rgba(0, 172, 193, 0.9)')
      progressGradient.addColorStop(1, 'rgba(100, 255, 218, 0.8)')
      
      ctx.fillStyle = progressGradient
      const barWidth = canvas.width * 0.8 * (progress / 100)
      ctx.fillRect(canvas.width * 0.1, canvas.height - 40, barWidth, 20)
      
      if (isDataTransferring) {
        transferAnimationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
    
    return () => {
      if (transferAnimationFrameRef.current) {
        cancelAnimationFrame(transferAnimationFrameRef.current)
        transferAnimationFrameRef.current = null
      }
    }
  }, [isDataTransferring, dataPackets, analysisStartTime])

  // 球体アニメーションの描画
  useEffect(() => {
    if (!isAnalyzing || !sphereCanvasRef.current) return
    
    const canvas = sphereCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const setCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      } else {
        canvas.width = 450
        canvas.height = 450
      }
    }
    
    setCanvasSize()
    
    const handleResize = () => {
      setCanvasSize()
    }
    
    window.addEventListener('resize', handleResize)

    interface StarDot {
      x: number
      y: number
      z: number
      radius: number
      color: string
      brightness: number
      twinkle: number
      twinkleOffset: number
    }
    
    const dots: StarDot[] = []
    
    const starColors = [
      'rgba(0, 255, 255, 0.9)',
      'rgba(0, 210, 255, 0.8)',
      'rgba(0, 190, 230, 0.8)',
      'rgba(0, 170, 210, 0.7)',
      'rgba(0, 150, 190, 0.7)',
      'rgba(110, 220, 255, 0.7)'
    ]
    
    const generateSphere = () => {
      const canvasSize = Math.min(canvas.width, canvas.height)
      const numDots = 1500
      const radius = canvasSize * 0.45
      
      dots.length = 0
      
      for (let i = 0; i < numDots; i++) {
        const u = Math.random()
        const v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)
        
        const randomSize = Math.random()
        const starSize = randomSize * 2.5 + 0.3
        const colorIndex = Math.floor(Math.random() * starColors.length)
        const brightness = randomSize * 0.7 + 0.3
        
        const twinkle = Math.random() * 0.08 + 0.04
        const twinkleOffset = Math.random() * Math.PI * 2
        
        dots.push({
          x, y, z,
          radius: starSize,
          color: starColors[colorIndex],
          brightness: brightness,
          twinkle: twinkle,
          twinkleOffset: twinkleOffset
        })
      }
    }
    
    generateSphere()
    
    let angle = 0
    let time = 0
    
    const animate = () => {
      try {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 * 0.95, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'
        ctx.fill()
        
        const centerX = Math.floor(canvas.width / 2)
        const centerY = Math.floor(canvas.height / 2)
        
        const targetRadius = Math.min(canvas.width, canvas.height) * 0.45
        
        angle += 0.006
        time += 0.016
        
        for (const dot of dots) {
          const cosAngle = Math.cos(angle)
          const sinAngle = Math.sin(angle)
          
          const rotatedX = dot.x * cosAngle - dot.z * sinAngle
          const rotatedZ = dot.x * sinAngle + dot.z * cosAngle
          
          const scale = (rotatedZ + targetRadius) / (targetRadius * 2)
          
          const twinkleEffect = Math.sin(time * dot.twinkle + dot.twinkleOffset) * 0.3 + 0.7
          const size = Math.max(0.1, Math.min(dot.radius * (0.5 + scale) * twinkleEffect, 10))
          const alpha = Math.max(0.1, Math.min((0.1 + scale * dot.brightness) * twinkleEffect, 1.0))
          
          const baseColor = dot.color.replace(/[^,]+(?=\))/, alpha.toString())
          
          const exactX = Math.round(centerX + rotatedX)
          const exactY = Math.round(centerY + dot.y)

          const distance = Math.sqrt(Math.pow(exactX - centerX, 2) + Math.pow(exactY - centerY, 2))
          if (distance <= targetRadius) {
            const grd = ctx.createRadialGradient(
              exactX, exactY, 0,
              exactX, exactY, size * 2
            )
            
            grd.addColorStop(0, baseColor)
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
            
            ctx.beginPath()
            ctx.arc(exactX, exactY, size, 0, Math.PI * 2)
            ctx.fillStyle = baseColor
            ctx.fill()
            
            if (dot.radius > 1.5) {
              ctx.beginPath()
              ctx.arc(exactX, exactY, size * 1.8, 0, Math.PI * 2)
              ctx.fillStyle = grd
              ctx.fill()
              
              if (dot.radius > 2.0 && isFinite(size)) {
                const glowSize = isFinite(size * 3) ? size * 3 : 6
                
                if (isFinite(exactX) && isFinite(exactY) && isFinite(glowSize)) {
                  ctx.beginPath()
                  ctx.moveTo(exactX - glowSize, exactY)
                  ctx.lineTo(exactX + glowSize, exactY)
                  ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(alpha * 0.3, 1)})`
                  ctx.lineWidth = Math.max(0.1, Math.min(size * 0.5, 10))
                  ctx.stroke()
                  
                  ctx.beginPath()
                  ctx.moveTo(exactX, exactY - glowSize)
                  ctx.lineTo(exactX, exactY + glowSize)
                  ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(alpha * 0.3, 1)})`
                  ctx.lineWidth = Math.max(0.1, Math.min(size * 0.5, 10))
                  ctx.stroke()
                }
              }
            }
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.error("Animation error:", error)
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isAnalyzing])

  // 推奨アクションデータ
  const mockRecommendedActions = [
    {
      title: "提案商材をTASUKIアノテーションに変更",
      reason: "ミーティング冒頭でお客様は、ミッションクリティカルな製造業におけるハルシネーションに懸念を示されました。RAG精度向上のため、アノテーションサービスへの変更を検討しましょう。"
    },
    {
      title: "資料のリアルタイムアップデート",
      reason: "微細な表情変化から論点の行き違いが検出されました。現在の提案では解決しきれていない課題が存在する可能性が高いため、追加のヒアリングが効果的です。"
    }
  ]

  // CRISTALメッセージ送信処理
  const handleCristalSubmit = () => {
    if (messageText.trim()) {
      console.log('CRISTALへの指示:', messageText)
      setCristalInputState('loading')
      setCristalLoadingProgress(0)
      setCristalAnalysisText('')
      
      // 4秒間のローディングアニメーション開始
      const startTime = Date.now()
      const loadingDuration = 4000 // 4秒
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / loadingDuration) * 100, 100)
        setCristalLoadingProgress(progress)
        
        // 分析テキストの更新
        if (progress < 25) {
          setCristalAnalysisText('表情パターンを解析中')
        } else if (progress < 50) {
          setCristalAnalysisText('音声データを処理中')
        } else if (progress < 75) {
          setCristalAnalysisText('顧客心理を分析中')
        } else if (progress < 100) {
          setCristalAnalysisText('最適戦略を計算中')
        }
        
        if (progress < 100) {
          setTimeout(updateProgress, 50)
        } else {
          // ローディング完了後、結果表示
          setTimeout(() => {
            setRecommendedActions(mockRecommendedActions)
            setCristalInputState('results')
            setMessageText('')
          }, 500)
        }
      }
      
      updateProgress()
    }
  }

  // CRISTAL状態リセット
  const resetCristalState = () => {
    setCristalInputState('input')
    setRecommendedActions([])
    setCristalLoadingProgress(0)
    setCristalAnalysisText('')
  }

  // 推奨アクション実行処理
  const handleActionExecute = (actionTitle: string) => {
    if (actionTitle === '資料のリアルタイムアップデート') {
      setIsConsultingSlideOpen(true)
    }
    // 他のアクションの処理もここに追加可能
  }

  // CRISTAL ホログラフィック・プロジェクション アニメーション
  useEffect(() => {
    if (cristalInputState !== 'loading' || !cristalLoadingCanvasRef.current) return
    
    const canvas = cristalLoadingCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    
    let animationTime = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    // ホログラフィック・パーティクル群
    const hologramParticles: Array<{
      x: number, y: number, z: number, 
      vx: number, vy: number, vz: number,
      size: number, opacity: number, 
      hue: number, spiralAngle: number
    }> = []
    
    // データストリーム・パーティクル
    const dataStreams: Array<{
      angle: number, radius: number, speed: number,
      size: number, opacity: number, hue: number
    }> = []
    
           // ホログラム・パーティクル初期化（長方形エリアに配置）
       const particleAreaWidth = canvas.width * 0.8
       const particleAreaHeight = canvas.height * 0.6
       for (let i = 0; i < 120; i++) {
         hologramParticles.push({
           x: centerX + (Math.random() - 0.5) * particleAreaWidth,
           y: centerY + (Math.random() - 0.5) * particleAreaHeight,
           z: Math.random() * 100,
           vx: (Math.random() - 0.5) * 0.5,
           vy: (Math.random() - 0.5) * 0.5,
           vz: (Math.random() - 0.5) * 0.3,
           size: Math.random() * 2 + 0.5,
           opacity: Math.random() * 0.8 + 0.2,
           hue: 200 + Math.random() * 80, // 青紫系
           spiralAngle: Math.random() * Math.PI * 2
         })
       }
    
           // データストリーム初期化（楕円軌道で長方形に最適化）
       for (let i = 0; i < 28; i++) {
         dataStreams.push({
           angle: (i / 28) * Math.PI * 2,
           radius: Math.min(canvas.width, canvas.height) * 0.25 + Math.random() * 20,
           speed: 0.02 + Math.random() * 0.03,
           size: Math.random() * 3 + 1,
           opacity: Math.random() * 0.6 + 0.4,
           hue: 180 + Math.random() * 100
         })
       }
    
    const animate = () => {
      if (cristalInputState !== 'loading') return
      
      // 深い透明背景でトレイル効果
      ctx.fillStyle = 'rgba(0, 5, 15, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      animationTime += 0.016
      
               // ホログラフィック・スキャンライン（長方形全体をカバー）
         const scanLineY = centerY + Math.sin(animationTime * 2) * (canvas.height * 0.3)
         const scanGradient = ctx.createLinearGradient(0, scanLineY - 15, 0, scanLineY + 15)
         scanGradient.addColorStop(0, 'rgba(0, 200, 255, 0)')
         scanGradient.addColorStop(0.5, `rgba(0, 200, 255, ${Math.sin(animationTime * 3) * 0.3 + 0.6})`)
         scanGradient.addColorStop(1, 'rgba(0, 200, 255, 0)')
         
         ctx.fillStyle = scanGradient
         ctx.fillRect(0, scanLineY - 15, canvas.width, 30)
      
      // グリッチ効果のための背景ノイズ
      for (let i = 0; i < 20; i++) {
        const glitchX = Math.random() * canvas.width
        const glitchY = Math.random() * canvas.height
        const glitchIntensity = Math.sin(animationTime * 10 + i) * 0.1 + 0.1
        
        ctx.fillStyle = `rgba(0, ${50 + Math.random() * 100}, 255, ${glitchIntensity})`
        ctx.fillRect(glitchX, glitchY, Math.random() * 10 + 2, Math.random() * 3 + 1)
      }
      
      // CRISTALロゴの3D回転投影
      ctx.save()
      ctx.translate(centerX, centerY)
      
      // 3D変換マトリックス
      const rotX = Math.sin(animationTime * 0.7) * 0.3
      const rotY = animationTime * 0.5
      const rotZ = Math.sin(animationTime * 0.3) * 0.2
      
      // ホログラフィック・グラデーション
      const logoGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60)
      logoGradient.addColorStop(0, `hsla(220, 100%, 70%, ${Math.sin(animationTime * 2) * 0.3 + 0.7})`)
      logoGradient.addColorStop(0.6, `hsla(260, 80%, 60%, ${Math.cos(animationTime * 1.5) * 0.2 + 0.5})`)
      logoGradient.addColorStop(1, 'hsla(300, 60%, 50%, 0.2)')
      
      ctx.fillStyle = logoGradient
      ctx.font = 'bold 24px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // 投影変換で3D効果
      const scale = 1 + Math.sin(animationTime) * 0.1
      ctx.scale(scale, scale * Math.cos(rotX))
      ctx.rotate(rotY)
      
      // グロー効果
      ctx.shadowColor = 'rgba(0, 200, 255, 0.8)'
      ctx.shadowBlur = 20
      ctx.fillText('CRISTAL', 0, 0)
      ctx.shadowBlur = 0
      
      // アウトライン
      ctx.strokeStyle = `hsla(200, 100%, 80%, ${Math.sin(animationTime * 3) * 0.3 + 0.7})`
      ctx.lineWidth = 2
      ctx.strokeText('CRISTAL', 0, 0)
      
      ctx.restore()
      
      // ホログラム・パーティクル更新・描画
      hologramParticles.forEach((particle, index) => {
        // 螺旋運動
        particle.spiralAngle += 0.05
        particle.x += particle.vx + Math.cos(particle.spiralAngle) * 0.5
        particle.y += particle.vy + Math.sin(particle.spiralAngle) * 0.5
        particle.z += particle.vz
        
                   // 境界チェック・リセット（長方形エリア）
           if (particle.x < -30 || particle.x > canvas.width + 30 || 
               particle.y < -30 || particle.y > canvas.height + 30 ||
               particle.z < 0 || particle.z > 100) {
             particle.x = centerX + (Math.random() - 0.5) * particleAreaWidth
             particle.y = centerY + (Math.random() - 0.5) * particleAreaHeight
             particle.z = Math.random() * 100
           }
        
        // ホログラフィック・レンダリング
        const depth = (particle.z / 100)
        const finalSize = particle.size * (0.5 + depth * 0.5)
        const finalOpacity = particle.opacity * (0.3 + depth * 0.7) * Math.sin(animationTime * 2 + index * 0.1) * 0.5 + 0.5
        
                   // スキャンライン干渉効果（長方形に最適化）
           const scanDistortion = Math.abs(particle.y - scanLineY) < 25 ? 
             Math.sin(animationTime * 15) * 0.3 + 0.7 : 1
        
        ctx.save()
        ctx.globalAlpha = finalOpacity * scanDistortion
        
        // パーティクルグラデーション
        const particleGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, finalSize * 3
        )
        particleGradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, 0.9)`)
        particleGradient.addColorStop(0.7, `hsla(${particle.hue + 20}, 70%, 60%, 0.4)`)
        particleGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
        
        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      })
      
               // データストリーム螺旋（楕円軌道で長方形に最適化）
         dataStreams.forEach((stream, index) => {
           stream.angle += stream.speed
           
           // 楕円軌道で長方形エリアに最適化
           const radiusX = canvas.width * 0.35
           const radiusY = canvas.height * 0.25
           const x = centerX + Math.cos(stream.angle) * radiusX
           const y = centerY + Math.sin(stream.angle) * radiusY
           const depth = Math.sin(stream.angle * 2) * 0.5 + 0.5
        
        ctx.save()
        ctx.globalAlpha = stream.opacity * depth
        
        const streamGradient = ctx.createRadialGradient(x, y, 0, x, y, stream.size * 2)
        streamGradient.addColorStop(0, `hsla(${stream.hue}, 90%, 80%, 0.9)`)
        streamGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
        
        ctx.fillStyle = streamGradient
        ctx.beginPath()
        ctx.arc(x, y, stream.size * (0.5 + depth * 0.5), 0, Math.PI * 2)
        ctx.fill()
        
        // ストリーム接続線
        if (index > 0) {
          const prevStream = dataStreams[index - 1]
          const prevX = centerX + Math.cos(prevStream.angle) * prevStream.radius
          const prevY = centerY + Math.sin(prevStream.angle) * prevStream.radius
          
          ctx.strokeStyle = `hsla(${stream.hue}, 70%, 60%, ${depth * 0.3})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
        
        ctx.restore()
      })
      
      cristalLoadingAnimationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (cristalLoadingAnimationRef.current) {
        cancelAnimationFrame(cristalLoadingAnimationRef.current)
        cristalLoadingAnimationRef.current = null
      }
    }
  }, [cristalInputState])

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ margin: 0, padding: 0, width: '100vw' }}>
      {/* ページヘッダー */}
      <header className="bg-black/70 backdrop-blur-md border-b border-cyan-500/30 shadow-lg fixed top-0 left-0 right-0 z-40 w-full" style={{ margin: 0, padding: 0, width: '100vw' }}>
        <div className="w-full py-4 px-6">
          <div className="flex items-center justify-between">
            {/* タイトル */}
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-medium text-white drop-shadow-lg">
                <span className="animate-gradient bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-white bg-size-200">
                  Sales Plan Maker
                </span>
              </h1>
            </div>

            {/* ヘッダー右側の情報 */}
            <div className="flex items-center space-x-6">
              {/* 現在時刻 */}
              <div className="text-right">
                <div className="text-white text-lg font-mono">
                  {currentTime}
                </div>
                <div className="text-cyan-300 text-sm">
                  リアルタイム分析中
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* サイドバー */}
        <div 
          ref={sidebarRef}
          className="flex-shrink-0 overflow-y-auto border-r border-cyan-500/20"
          style={{ 
            width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
            transition: 'width 0.3s ease',
            overflow: isSidebarOpen ? 'visible' : 'hidden',
            height: 'calc(100vh - 64px)'
          }}
        >
          {/* サイドバーのコンテンツ（CRISTAL AI連携のみ） */}
          <div className="p-4 h-full flex flex-col">
            <div className="bg-black/70 backdrop-blur-md rounded-lg border border-purple-500/20 p-4 hover:border-purple-400/30 transition-all duration-300 flex-1 flex flex-col justify-start max-h-[85vh] overflow-auto">
              {/* タイトル部分を復活 */}
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 mr-2 rounded-md bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-purple-400 text-xs font-bold">CRISTAL AI 連携</h4>
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                {/* CRISTALアニメーションロゴを中央に */}
                <div className="w-80 h-80 flex items-center justify-center mx-auto mb-4">
                  <StarrySphere />
                </div>
              </div>
              {/* AI分析レポート（input/loading/results） */}
              <div className="w-full">
                {cristalInputState === 'loading' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    {/* ホログラフィック・プロジェクション・ウィンドウ */}
                    <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20 flex flex-col items-center justify-center">
                      <div className="relative w-full h-40">
                        <canvas 
                          ref={cristalLoadingCanvasRef}
                          className="w-full h-full rounded-lg border border-cyan-400/30"
                        />
                      </div>
                    </div>
                    {/* ホログラフィック・ローディング情報 */}
                    <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/30 rounded-lg p-4 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                      <div className="text-center space-y-3">
                        <h5 className="text-cyan-300 font-bold text-sm tracking-wider font-mono">
                          🔮 HOLOGRAPHIC PROJECTION ACTIVE
                        </h5>
                        <p className="text-cyan-200 text-xs leading-relaxed">
                          {cristalAnalysisText}
                        </p>
                        {/* ホログラフィック・プログレスバー */}
                        <div className="relative w-full bg-black/50 rounded-full h-3 overflow-hidden border border-cyan-500/30">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 transition-all duration-300 ease-out relative"
                            style={{ width: `${cristalLoadingProgress}%` }}
                          >
                            {/* グロー効果 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/60 to-blue-300/60 animate-pulse"></div>
                          </div>
                          {/* スキャンライン効果 */}
                          <div 
                            className="absolute top-0 h-full w-1 bg-white/80 shadow-lg shadow-cyan-400/50"
                            style={{ 
                              left: `${cristalLoadingProgress}%`,
                              transition: 'left 0.3s ease-out'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-cyan-400 text-xs font-mono">
                            PROJECTION: {Math.round(cristalLoadingProgress)}%
                          </div>
                          <div className="text-blue-300 text-xs">
                            ✨ AI Neural Sync
                          </div>
                        </div>
                        {/* ホログラム・ステータス・インジケーター */}
                        <div className="flex justify-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                            <span className="text-cyan-300 text-xs">SCAN</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <span className="text-blue-300 text-xs">ANALYZE</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            <span className="text-purple-300 text-xs">PROJECT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {cristalInputState === 'results' && (
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-purple-300 font-bold text-sm">推奨アクション</h5>
                        <button
                          onClick={resetCristalState}
                          className="text-purple-400 hover:text-purple-300 text-xs"
                        >
                          戻る
                        </button>
                      </div>
                      <div className="space-y-3">
                        {recommendedActions.map((action, index) => (
                          <div 
                            key={index}
                            className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                              index === 0 ? 'bg-purple-900/40 border-purple-400/30 hover:border-purple-400/50' :
                              index === 1 ? 'bg-pink-900/40 border-pink-400/30 hover:border-pink-400/50' :
                              'bg-indigo-900/40 border-indigo-400/30 hover:border-indigo-400/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h6 className={`font-medium text-xs ${
                                index === 0 ? 'text-purple-300' :
                                index === 1 ? 'text-pink-300' :
                                'text-indigo-300'
                              }`}>
                                {action.title}
                              </h6>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                index === 0 ? 'bg-purple-500' :
                                index === 1 ? 'bg-pink-500' :
                                'bg-indigo-500'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed mb-3">
                              {action.reason}
                            </p>
                            <button 
                              onClick={() => handleActionExecute(action.title)}
                              className={`w-full py-1.5 rounded text-xs font-medium transition-all ${
                                index === 0 ? 'bg-purple-500/80 hover:bg-purple-500 text-white' :
                                index === 1 ? 'bg-pink-500/80 hover:bg-pink-500 text-white' :
                                'bg-indigo-500/80 hover:bg-indigo-500 text-white'
                              }`}
                            >
                              実行
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* AIへの指示欄を下部に分離して設置 */}
              <div className="mt-4 w-full">
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-3 border border-purple-500/20 min-h-[60px] h-20"></div>
              </div>
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
            className="fixed top-20 left-4 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center hover:bg-white transition-colors duration-200"
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
              backgroundImage: 'url(/background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: -10,
            }}
          />
          
          <div className="container mx-auto p-4 max-w-full">
            <div className="pb-2">
              <FaceAnalyzer 
                onFaceDetected={handleFaceDetection} 
                isAnalysisActive={isFaceAnalysisActive}
                onAnalysisToggle={handleAnalysisToggle}
              />
            </div>
          </div>


        </div>
      </div>

      {/* CRISTALモーダル */}
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
            
            {/* モーダルコンテンツ */}
            <div className="h-[calc(95vh-120px)] flex flex-col justify-center overflow-y-auto">
              {isAnalyzing ? (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-2 h-full">
                  {/* 球体アニメーション */}
                  <div className="w-full lg:w-1/2 flex items-center justify-center mb-8 lg:mb-0">
                    <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] aspect-square rounded-full overflow-hidden flex items-center justify-center bg-black border-[3px] border-cyan-500/40 shadow-xl shadow-cyan-500/30">
                      <canvas 
                        ref={sphereCanvasRef}
                        className="absolute inset-0 w-full h-full"
                        style={{ borderRadius: '50%' }}
                      />
                    </div>
                  </div>
                  
                  {/* テキストコンテンツ */}
                  <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
                    <div className="text-center lg:text-left mb-6">
                      <h4 className="text-4xl md:text-5xl font-medium text-cyan-400 tracking-wider font-mono">CRISTAL ANALYSIS</h4>
                      <p className="text-cyan-300/70 text-lg md:text-xl mt-2">Cristalが商談を解析中{analysisDots}</p>
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
                      <div className="bg-black/40 rounded-lg p-6 border border-blue-500/20 flex justify-between items-center">
                        <div className="text-lg text-cyan-400">データポイント</div>
                        <div className="text-white font-medium text-4xl">217</div>
                      </div>
                      <div className="bg-black/40 rounded-lg p-6 border border-indigo-500/20 flex justify-between items-center">
                        <div className="text-lg text-cyan-400">分析深度</div>
                        <div className="text-white font-medium text-4xl">レベル4</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 sticky bottom-0 bg-gray-900/80 backdrop-blur-sm p-4 -mx-8 -mb-8 rounded-b-xl border-t border-cyan-500/20">
                    <button 
                      onClick={startDataTransfer}
                      className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold text-2xl"
                    >
                      プランニング実行
                    </button>
                  </div>
                </div>
              ) : dataTransferComplete ? (
                <div className="w-full h-full">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">スライド最適化フェーズ</h3>
                    <p className="text-cyan-300 mt-2">顧客ニーズに合わせた資料の自動最適化を行っています</p>
                  </div>
                  <ConsultingSlide 
                    isVisible={true} 
                    currentEmotion={currentEmotion}
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

      {/* コンサルティングスライドモーダル */}
      {isConsultingSlideOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[101] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsConsultingSlideOpen(false)
            }
          }}
        >
          <div className="bg-white rounded-xl w-[90vw] max-w-[1200px] overflow-hidden shadow-2xl border border-gray-300 relative" style={{ aspectRatio: '16/9' }}>
            {/* 閉じるボタン */}
            <button 
              onClick={() => setIsConsultingSlideOpen(false)}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* ConsultingSlideコンポーネント */}
            <ConsultingSlide 
              isVisible={true} 
              currentEmotion={currentEmotion}
              onComplete={() => {
                setTimeout(() => {
                  setIsConsultingSlideOpen(false)
                }, 2000)
              }}
            />
          </div>
        </div>
      )}
      
      {/* スタイル */}
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
      `}</style>
    </div>
  )
} 