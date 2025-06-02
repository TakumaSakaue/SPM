'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'

type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised'

type EmotionData = {
  emotion: Emotion
  value: number
  color: string
}

const emotionDetails: Record<Emotion, { emoji: string, color: string, actionTitle: string, actions: string[] }> = {
  neutral: {
    emoji: '😐',
    color: '#c0c0c0',
    actionTitle: '基本的な情報提供',
    actions: [
      '製品/サービスの基本情報を中立的に説明',
      '客観的なデータと事実を提示',
      '顧客のニーズをさらに深堀りする質問を投げかける'
    ]
  },
  happy: {
    emoji: '😄',
    color: '#ffde34',
    actionTitle: 'ポジティブな特徴の強調',
    actions: [
      '製品/サービスの長所と特典を強調',
      'アップセルやクロスセルの機会を探る',
      '顧客の喜びを共有し、良好な関係を発展させる'
    ]
  },
  sad: {
    emoji: '😢',
    color: '#5b89eb',
    actionTitle: '懸念事項への対応',
    actions: [
      '顧客の懸念や悩みに共感を示す',
      'コスト面や潜在的な問題に丁寧に対応',
      '安心感を与える保証やサポート体制を説明'
    ]
  },
  angry: {
    emoji: '😠',
    color: '#ff6347',
    actionTitle: '問題解決アプローチ',
    actions: [
      '顧客の不満を認め、誠実に謝罪',
      '具体的な解決策と改善提案を提示',
      '顧客にコントロール感を与える選択肢を提供'
    ]
  },
  fearful: {
    emoji: '😨',
    color: '#9370db',
    actionTitle: 'リスク軽減戦略',
    actions: [
      'リスクを最小化する安全機能や保証を強調',
      '段階的な導入計画や試用期間を提案',
      '成功事例や証言を共有し安心感を提供'
    ]
  },
  disgusted: {
    emoji: '🤢',
    color: '#2e8b57',
    actionTitle: '代替アプローチの提示',
    actions: [
      '現在の提案に対する抵抗感を認識',
      '異なる角度からの代替案を提示',
      '顧客の価値観に合わせたカスタマイズ提案を行う'
    ]
  },
  surprised: {
    emoji: '😲',
    color: '#ff69b4',
    actionTitle: '詳細な情報提供',
    actions: [
      '予想外の情報に対する詳しい説明を提供',
      '質問を促し、疑問点を明確にする機会を作る',
      '顧客のペースに合わせ、情報を整理して伝える'
    ]
  }
}

type EmotionDashboardProps = {
  currentEmotion: Emotion
  allEmotions?: Record<Emotion, number>
}

export default function EmotionDashboard({ currentEmotion, allEmotions }: EmotionDashboardProps) {
  const [chartData, setChartData] = useState<EmotionData[]>([])
  const [historyData, setHistoryData] = useState<{ time: string, emotion: Emotion }[]>([])
  const [maxWidth, setMaxWidth] = useState<number>(1000)

  // 最大幅を動的に計算
  useEffect(() => {
    const updateMaxWidth = () => {
      const screenWidth = window.innerWidth;
      const sidebarWidth = Math.floor(screenWidth * 0.35); // 35%のサイドバー幅
      const padding = 48; // 左右のパディング合計
      const margin = 40; // 余白
      
      // 使用可能な幅を計算
      const availableWidth = screenWidth - sidebarWidth - padding - margin;
      
      // レスポンシブな最大幅を設定
      if (screenWidth <= 768) {
        setMaxWidth(Math.min(600, availableWidth));
      } else if (screenWidth <= 1024) {
        setMaxWidth(Math.min(800, availableWidth));
      } else {
        setMaxWidth(Math.min(1000, availableWidth));
      }
    };

    updateMaxWidth();
    window.addEventListener('resize', updateMaxWidth);

    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  // 表示用の感情データを生成
  useEffect(() => {
    if (allEmotions) {
      const data: EmotionData[] = Object.entries(allEmotions).map(([emotion, value]) => ({
        emotion: emotion as Emotion,
        value: value * 100, // パーセンテージに変換
        color: emotionDetails[emotion as Emotion].color
      }))
      setChartData(data)
    }
    
    // 履歴に現在の感情を追加
    const now = new Date()
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
    
    setHistoryData(prev => {
      const newHistory = [...prev, { time: timeString, emotion: currentEmotion }]
      // 最新10件のみ保持
      return newHistory.slice(-10)
    })
  }, [currentEmotion, allEmotions])

  // カスタムツールチップのフォーマッター
  const customFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(1)}%`, '確率']
    }
    return [`${value}%`, '確率']
  }

  return (
    <div 
      className="bg-white/40 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all duration-300 border border-gray-200/20 w-full mx-auto"
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">感情分析ダッシュボード</h2>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{emotionDetails[currentEmotion].emoji}</span>
          <span className="font-semibold capitalize" style={{ color: emotionDetails[currentEmotion].color }}>
            {currentEmotion}
          </span>
        </div>
      </div>
      
      {allEmotions && (
        <div className="mb-6 h-56 bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200/10">
          <h3 className="text-sm font-medium text-gray-500 mb-2">感情分布</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="emotion" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={customFormatter}
                labelFormatter={(label) => `${label}: ${emotionDetails[label as Emotion].emoji}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(8px)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(229, 231, 235, 0.2)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#8884d8" stroke="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">推奨アクション</h3>
        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-gray-200/10">
          <h4 className="font-bold mb-2" style={{ color: emotionDetails[currentEmotion].color }}>
            {emotionDetails[currentEmotion].actionTitle}
          </h4>
          <ul className="space-y-2">
            {emotionDetails[currentEmotion].actions.map((action, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block bg-white/80 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 shadow-sm border border-gray-200/20">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">感情履歴</h3>
        <div className="flex overflow-x-auto space-x-2 py-2 bg-white/60 backdrop-blur-sm px-3 rounded-xl border border-gray-200/10">
          {historyData.map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center min-w-[40px]"
            >
              <span className="text-xl">{emotionDetails[item.emotion].emoji}</span>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 