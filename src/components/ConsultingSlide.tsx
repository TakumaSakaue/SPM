'use client'

import React, { useState, useEffect } from 'react';

type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

interface ConsultingSlideProps {
  isVisible: boolean;
  currentEmotion: EmotionType;
  onComplete?: () => void;
}

// 製造業向け提案スライドのコンテンツ
const manufacturingProposalContent = {
  title: 'Cristalを基軸とした貴社競争力強化戦略',
  subtitle: 'ソフトバンクと実現するAI-Readyな製造業DX実装による競争力強化戦略',
  factors: [
    {
      id: 'productivity',
      title: '生産性向上の即効性',
      background: '既存設備のIoT化により、停止時間を40%削減。リアルタイム監視で不良品率を15%改善し、即座に収益インパクトを創出',
      solution: '設備稼働率向上プログラム',
      solutionDetails: '• 3ヶ月でIoTセンサー導入\n• 予知保全システム構築\n• 生産計画最適化AI実装'
    },
    {
      id: 'cost',
      title: 'コスト構造の抜本改革',
      background: '在庫コスト30%削減、エネルギー効率25%向上により、年間1億円のコスト削減を実現。競合他社との価格競争力を確保',
      solution: 'スマートファクトリー化',
      solutionDetails: '• 在庫最適化システム導入\n• エネルギー管理AI活用\n• 無駄取りプロセス自動化'
    },
    {
      id: 'quality',
      title: '品質革新による差別化',
      background: 'AI品質検査により不良率を90%削減。顧客満足度向上とクレーム対応コスト削減で、ブランド価値を大幅向上',
      solution: 'AI品質管理システム',
      solutionDetails: '• 画像認識による全数検査\n• 品質予測分析導入\n• トレーサビリティ強化'
    },
    {
      id: 'agility',
      title: '市場変化への対応力強化',
      background: '需要予測精度80%向上により、機会損失を最小化。多品種少量生産への柔軟対応で新市場開拓が可能',
      solution: 'アジャイル生産体制構築',
      solutionDetails: '• 需要予測AI導入\n• 生産ライン柔軟化\n• サプライチェーン最適化',
      isHighPriority: true
    }
  ]
};

const ConsultingSlide: React.FC<ConsultingSlideProps> = ({ isVisible, currentEmotion, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className={`w-full h-full bg-white ${isAnimating ? 'opacity-50' : 'opacity-100'} transition-all duration-300 relative`}>
      {/* ヘッダー */}
      <div className="px-4 py-3 mb-4">
        <div className="flex items-center justify-between mb-2 h-12 overflow-hidden">
          <h1 className="text-2xl font-bold text-gray-800">{manufacturingProposalContent.title}</h1>
          <img 
            src="/SBLOGO.png" 
            alt="SoftBank Logo" 
            className="h-28 w-auto ml-8"
          />
        </div>
        {/* タイトル下のグレー線 */}
        <div className="w-full h-px bg-gray-400"></div>
      </div>

      {/* サブタイトル */}
      <div className="px-4 mb-6">
        <p className="text-3xl text-gray-700 leading-relaxed text-center font-bold">
          ソフトバンクと実現する<span className="text-blue-600">AI-Readyな製造業DX実装</span>による競争力強化戦略
        </p>
      </div>

      {/* メインコンテンツ - 3列レイアウト */}
      <div className="px-4 grid grid-cols-3 gap-6 h-[180px]">
        {/* 左側：導入阻害要因 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3 text-center">導入阻害要因</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {manufacturingProposalContent.factors.map((factor, index) => (
              <div key={factor.id} className="bg-blue-100 border border-blue-200 p-2 rounded flex-1 flex items-center">
                <div className="text-xl font-bold text-blue-800 text-center w-full leading-tight">{factor.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 中央：背景 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3 text-center">背景</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {manufacturingProposalContent.factors.map((factor, index) => (
              <div key={index} className="text-lg text-gray-600 leading-snug border-b border-gray-200 pb-2 flex-1 flex items-start">
                <div>
                  {factor.background}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：導入促進の方向性 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3 text-center">導入促進の方向性</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {manufacturingProposalContent.factors.map((factor, index) => (
              <div key={factor.id} className="flex-1">
                <div className={`p-2 rounded h-full flex flex-col ${
                  factor.isHighPriority 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <div className="text-lg font-bold mb-1 leading-tight">{factor.solution}</div>
                  <div className="text-base leading-snug whitespace-pre-line flex-1">
                    {factor.solutionDetails}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 凡例 - スライド最下部に配置 */}
      <div className="absolute bottom-4 left-0 right-0 bg-white">
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-xs text-gray-600">短期間で実施可能且つ実効性あり</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-xs text-gray-600">数年以上の時間を要するもの実現可</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-600">現状は打ち手案に乏しい</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultingSlide;