'use client'

import React, { useState, useEffect } from 'react';

type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

interface ConsultingSlideProps {
  isVisible: boolean;
  currentEmotion: EmotionType;
  onComplete?: () => void;
}

// ChatGPT Enterprise提案スライドのコンテンツ
const chatGPTEnterpriseContent = {
  title: 'ChatGPT Enterprise導入を阻害する要因',
  subtitle: '企業のAI活用への関心は高いものの、セキュリティ・コンプライアンス要件や既存システムとの統合課題により、ChatGPT Enterpriseの本格導入が進まない状況。',
  factors: [
    {
      id: 'security',
      title: 'セキュリティ・プライバシー懸念',
      background: 'IT部門は機密情報漏洩を最重要リスクと認識し、クラウドベースAIサービスの利用に対して極めて慎重な姿勢を取る傾向にある',
      solution: 'セキュリティ要件の段階的クリア',
      solutionDetails: '• 専用環境でのPoC実施\n• データローカライゼーション対応\n• SOC2/ISO27001準拠証明の提示'
    },
    {
      id: 'compliance',
      title: '社内承認・コンプライアンス',
      background: '金融・医療等の規制業界では、AI利用に関する明確なガイドラインが未整備であり、コンプライアンス部門が導入にブレーキをかけるケースが多い',
      solution: 'AI活用ガバナンス体制構築',
      solutionDetails: '• AI利用ポリシーの策定\n• セキュリティ・コンプライアンス基準整備\n• リスク管理フレームワーク確立'
    },
    {
      id: 'integration',
      title: '既存システムとの統合困難',
      background: '多くの企業で基幹システムが複雑化・老朽化しており、新しいAIツールとの連携に技術的・予算的課題を抱えている',
      solution: '組織のAIリテラシー向上',
      solutionDetails: '• 全社員向けAI研修プログラム\n• プロンプトエンジニアリング教育\n• ベストプラクティス共有体制'
    },
    {
      id: 'cost',
      title: 'コスト対効果の不透明性',
      background: '生成AIの業務効果が定量化しにくく、従来のIT投資評価手法では投資対効果の算出が困難な状況',
      solution: 'システム統合支援サービス',
      solutionDetails: '• 既存システムとのAPI連携支援\n• セキュアな環境構築\n• 段階的移行計画の策定',
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
      <div className="bg-white border-l-4 border-blue-600 pl-4 py-3 mb-4">
        <h1 className="text-xl font-bold text-gray-800">{chatGPTEnterpriseContent.title}</h1>
      </div>

      {/* サブタイトル */}
      <div className="px-4 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">
          {chatGPTEnterpriseContent.subtitle}
        </p>
      </div>

      {/* メインコンテンツ - 3列レイアウト */}
      <div className="px-4 grid grid-cols-3 gap-6 h-[160px]">
        {/* 左側：導入阻害要因 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">導入阻害要因</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {chatGPTEnterpriseContent.factors.map((factor, index) => (
              <div key={factor.id} className="bg-blue-100 border border-blue-200 p-2 rounded flex-1 flex items-center">
                <div className="text-2xl font-bold text-blue-800 text-center w-full leading-tight">{factor.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 中央：背景 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">背景</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {chatGPTEnterpriseContent.factors.map((factor, index) => (
              <div key={index} className="text-xl text-gray-600 leading-snug border-b border-gray-200 pb-2 flex-1 flex items-start">
                <div>
                  <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-3 mt-2"></span>
                  {factor.background}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：導入促進の方向性 */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">導入促進の方向性</h3>
          <div className="flex flex-col space-y-2 flex-1">
            {chatGPTEnterpriseContent.factors.map((factor, index) => (
              <div key={factor.id} className="flex-1">
                <div className={`p-2 rounded h-full flex flex-col ${
                  factor.isHighPriority 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <div className="text-xl font-bold mb-1 leading-tight">{factor.solution}</div>
                  <div className="text-lg leading-snug whitespace-pre-line flex-1">
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