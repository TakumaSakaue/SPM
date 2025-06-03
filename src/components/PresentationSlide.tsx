'use client'

import React, { useState, useEffect, useRef } from 'react';

type AnimationState = 'slide' | 'coding' | 'complete';
type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

interface PresentationSlideProps {
  isVisible: boolean;
  currentEmotion: EmotionType;
  onComplete?: () => void;
}

// 感情に基づくプレースホルダー選択マップ
const emotionToPlaceholder = {
  happy: 'scenario-1',      // R&D・製品設計支援（成功・革新）
  sad: 'scenario-2',        // 技術伝承・ナレッジ管理（サポート・解決）
  angry: 'scenario-3',      // 生産管理・品質保証（効率化・問題解決）
  fearful: 'scenario-4',    // 異常検知エージェント（セキュリティ・安全）
  disgusted: 'scenario-4',  // サプライチェーン最適化（改善・最適化）
  surprised: 'scenario-1',  // R&D・製品設計支援（驚きの発見）
  neutral: 'random'         // ランダム選択
};

// 感情に基づくコンテンツデータ（コンサルタント風）
const emotionBasedContent = {
  'scenario-1': {
    happy: {
      icon: '🚀',
      title: 'AI駆動イノベーション加速',
      subtitle: 'Innovation Acceleration',
      description: '最先端AI技術の戦略的導入により、製品開発リードタイムを40%短縮。競合他社との差別化を実現し、市場シェア拡大を加速。',
      effect: '40%',
      effectLabel: '開発速度向上',
      roi: '6ヶ月',
      roiLabel: '投資回収期間',
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'emerald',
      category: '短期実装・高効果'
    },
    surprised: {
      icon: '⚡',
      title: '次世代設計最適化AI',
      subtitle: 'Revolutionary Design System',
      description: '機械学習による設計パラメータ最適化で、従来設計の性能限界を突破。業界標準を塗り替える革新的製品開発を実現。',
      effect: '60%',
      effectLabel: '性能指標改善',
      roi: '4ヶ月',
      roiLabel: '成果発現期間',
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'emerald',
      category: '短期実装・高効果'
    }
  },
  'scenario-2': {
    sad: {
      icon: '🤝',
      title: 'ナレッジマネジメントAI',
      subtitle: 'Knowledge Preservation',
      description: 'ベテラン技術者の暗黙知を体系化し、次世代への技術継承を自動化。組織の知的資産を永続的に保護・活用。',
      effect: '95%',
      effectLabel: '技術継承成功率',
      roi: '安定化',
      roiLabel: '技術継承課題',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'blue',
      category: '短期実装・中効果'
    }
  },
  'scenario-3': {
    angry: {
      icon: '⚙️',
      title: '製造最適化AI',
      subtitle: 'Production Excellence',
      description: 'リアルタイム製造データ分析による効率化で、生産性を50%向上。品質管理の完全自動化により不良率を大幅削減。',
      effect: '50%',
      effectLabel: '生産効率向上',
      roi: '25%',
      roiLabel: '不良率削減',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'orange',
      category: '中期実装・高効果'
    }
  },
  'scenario-4': {
    fearful: {
      icon: '🛡️',
      title: 'リスク管理AI',
      subtitle: 'Predictive Security',
      description: '多層的リスク分析により、潜在的脅威を事前検知。予測的セキュリティで事業継続性を確保し、競争優位を維持。',
      effect: '95%',
      effectLabel: '脅威検知精度',
      roi: '80%',
      roiLabel: 'リスク軽減率',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'purple',
      category: '長期実装・変革的効果'
    },
    disgusted: {
      icon: '🔄',
      title: 'SCM変革AI',
      subtitle: 'Supply Chain Revolution',
      description: 'サプライチェーン全体の最適化により、調達コストを30%削減。地政学的リスクを最小化し、持続可能な供給体制を構築。',
      effect: '30%',
      effectLabel: 'コスト削減',
      roi: '40%',
      roiLabel: 'リスク軽減',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'purple',
      category: '長期実装・変革的効果'
    }
  }
};

const PresentationSlide: React.FC<PresentationSlideProps> = ({ isVisible, currentEmotion, onComplete }) => {
  const [animationState, setAnimationState] = useState<AnimationState>('slide');
  const [codeText, setCodeText] = useState<string>('');
  const [isShowingOriginal, setIsShowingOriginal] = useState(true);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string>('scenario-4');
  const [lastEmotion, setLastEmotion] = useState<EmotionType>(currentEmotion);
  const slideRef = useRef<HTMLDivElement>(null);
  const targetElementRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 感情変化の検出とプレースホルダー選択
  useEffect(() => {
    if (currentEmotion !== lastEmotion && isVisible) {
      let newPlaceholder = emotionToPlaceholder[currentEmotion];
      
      // ランダム選択の場合
      if (newPlaceholder === 'random') {
        const scenarios = ['scenario-1', 'scenario-2', 'scenario-3', 'scenario-4'];
        newPlaceholder = scenarios[Math.floor(Math.random() * scenarios.length)];
      }
      
      setSelectedPlaceholder(newPlaceholder);
      setLastEmotion(currentEmotion);
      
      // 感情変化時のエフェクト
      if (slideRef.current) {
        slideRef.current.style.transform = 'scale(1.02)';
        slideRef.current.style.filter = 'brightness(1.1)';
        setTimeout(() => {
          if (slideRef.current) {
            slideRef.current.style.transform = 'scale(1)';
            slideRef.current.style.filter = 'brightness(1)';
          }
        }, 300);
      }
    }
  }, [currentEmotion, lastEmotion, isVisible]);

  // アニメーション効果音
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/test.mp3');
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // コーディングアニメーション開始
  useEffect(() => {
    if (animationState === 'slide' && isVisible) {
      // 感情表示エフェクト
      setTimeout(() => {
        if (slideRef.current) {
          const emotionIndicator = document.createElement('div');
          emotionIndicator.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            color: #1f2937;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10;
            animation: slideInRight 0.5s ease-out;
          `;
          
          const emotionEmoji = {
            happy: '😊',
            sad: '😔',
            angry: '😠',
            fearful: '😰',
            disgusted: '😤',
            surprised: '😲',
            neutral: '😐'
          };
          
          emotionIndicator.innerHTML = `${emotionEmoji[currentEmotion]} ${currentEmotion.toUpperCase()} 感情検知`;
          slideRef.current.appendChild(emotionIndicator);
          
          setTimeout(() => {
            if (emotionIndicator.parentNode) {
              emotionIndicator.style.opacity = '0';
              setTimeout(() => {
                if (emotionIndicator.parentNode) {
                  emotionIndicator.parentNode.removeChild(emotionIndicator);
                }
              }, 300);
            }
          }, 2000);
        }
      }, 500);
      
      // 2秒後にコーディング開始
      setTimeout(() => {
        setAnimationState('coding');
      }, 2000);
    }
  }, [animationState, isVisible, currentEmotion]);

  // 選択されたプレースホルダーのコンテンツを取得
  const getSelectedContent = () => {
    const scenarioContent = emotionBasedContent[selectedPlaceholder as keyof typeof emotionBasedContent];
    if (scenarioContent && scenarioContent[currentEmotion as keyof typeof scenarioContent]) {
      return scenarioContent[currentEmotion as keyof typeof scenarioContent];
    }
    // フォールバック
    return emotionBasedContent['scenario-4'].fearful;
  };

  // コーディングアニメーション
  useEffect(() => {
    if (animationState === 'coding' && isVisible && targetElementRef.current) {
      const targetElement = targetElementRef.current;
      const selectedContent = getSelectedContent();
      
      // 元のコンテンツを保存
      const originalContent = targetElement.innerHTML;
      
      // 感情に基づく動的HTMLコード生成（コンサルタント風）
      const htmlCode = `<!-- Strategic Consulting: AI-Generated Content for ${currentEmotion.toUpperCase()} Emotion -->
<div class="quadrant-label absolute -top-3 left-6 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-xs font-medium">
  ${selectedContent.category}
</div>

<div class="flex items-start gap-4 mb-4">
  <div class="icon-container w-14 h-14 bg-gradient-to-br ${selectedContent.gradient} rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 ease-out hover:scale-105">
    <span class="text-3xl">${selectedContent.icon}</span>
  </div>
  <div class="flex-1">
    <h3 class="text-lg font-semibold text-gray-800 mb-1 leading-tight">${selectedContent.title}</h3>
    <p class="text-xs text-gray-500 uppercase tracking-wider font-medium">${selectedContent.subtitle}</p>
  </div>
</div>

<div class="mb-4">
  <p class="text-sm text-gray-600 leading-relaxed font-normal">
    ${selectedContent.description}
  </p>
</div>

<div class="space-y-3">
  <div class="metric-row flex justify-between items-center p-3 bg-opacity-10 rounded-lg border border-opacity-20 transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-md" style="background-color: rgba(var(--bg-color-rgb), 0.1); border-color: rgba(var(--bg-color-rgb), 0.2);">
    <span class="text-sm font-medium" style="color: var(--primary-color);">${selectedContent.effectLabel}</span>
    <span class="text-lg font-bold" style="color: var(--primary-color);">${selectedContent.effect}</span>
  </div>
  <div class="metric-row flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-md">
    <span class="text-sm font-medium text-gray-700">${selectedContent.roiLabel}</span>
    <span class="text-lg font-bold text-gray-600">${selectedContent.roi}</span>
  </div>
  <div class="emotion-badge bg-blue-50 rounded-lg px-3 py-2 text-xs border border-blue-100">
    <span class="text-blue-600 font-medium">🧠 感情分析ベース: </span>
    <span class="font-semibold text-blue-800">${currentEmotion.toUpperCase()}</span>
  </div>
</div>

<!-- Professional Consulting Styles -->
<style>
  :root {
    /* RGB値をCSS変数として定義する例 (Tailwindのbg-opacityやborder-opacityと連携させるため) */
    /* JavaScript側でselectedContent.gradientから適切にRGB値を抽出して設定する必要がある */
    /* 例: bg-emerald-500 のRGBが (16, 185, 129) の場合 */
    /* --bg-color-rgb: 16, 185, 129; */
    /* --primary-colorは既存のものを活かすか、RGBベースに合わせるか検討 */
    --primary-color: ${selectedContent.gradient.split(' ')[1]}; /* これは元のまま */
  }
</style>`;

      // 枠全体をコードエディタに変換
      targetElement.style.background = '#0d1117';
      targetElement.style.border = '1px solid #30363d';
      targetElement.style.fontFamily = 'Monaco, Menlo, Ubuntu Mono, monospace';
      targetElement.style.fontSize = '11px';
      targetElement.style.color = '#f0f6fc';
      targetElement.style.padding = '16px';
      targetElement.style.overflow = 'auto';
      targetElement.style.position = 'relative';

      // ヘッダーを追加
      const header = document.createElement('div');
      header.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: #21262d;
        border-bottom: 1px solid #30363d;
        padding: 8px 16px;
        font-size: 12px;
        color: #8b949e;
        display: flex;
        align-items: center;
        z-index: 10;
      `;
      header.innerHTML = `
        <div style="display: flex; gap: 6px; margin-right: 12px;">
          <div style="width: 12px; height: 12px; background: #ff5f56; border-radius: 50%;"></div>
          <div style="width: 12px; height: 12px; background: #ffbd2e; border-radius: 50%;"></div>
          <div style="width: 12px; height: 12px; background: #27ca3f; border-radius: 50%;"></div>
        </div>
        <span>slide-optimizer.html</span>
        <span style="margin-left: auto; color: #58a6ff;">AI Code Generator</span>
      `;
      
      targetElement.appendChild(header);

      // コードコンテナを作成
      const codeContainer = document.createElement('div');
      codeContainer.style.cssText = `
        margin-top: 40px;
        height: calc(100% - 40px);
        overflow: auto;
        line-height: 1.5;
      `;
      targetElement.appendChild(codeContainer);

      // タイピング音開始
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
      }

      let charIndex = 0;
      const typingSpeed = 3; // より高速に

      const typingInterval = setInterval(() => {
        if (charIndex < htmlCode.length) {
          const currentCode = htmlCode.substring(0, charIndex + 1);
          setCodeText(currentCode);
          
          // シンタックスハイライト適用
          const highlightedCode = syntaxHighlight(currentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
          codeContainer.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${highlightedCode}<span style="background: #58a6ff; color: #0d1117; animation: blink 1s infinite;">|</span></pre>`;
          
          // 自動スクロール
          codeContainer.scrollTop = codeContainer.scrollHeight;
          
          charIndex++;
        } else {
          clearInterval(typingInterval);
          
          // タイピング音停止
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.loop = false;
          }

          // 1秒間コードを表示してからレンダリング開始
          setTimeout(() => {
            // レンダリング効果
            targetElement.style.background = 'linear-gradient(45deg, #1e3a8a, #0369a1, #0891b2, #06b6d4)';
            targetElement.style.backgroundSize = '300% 300%';
            targetElement.style.animation = 'gradientMove 2s ease-in-out';
            
            // ヘッダーとコードを非表示
            header.style.display = 'none';
            codeContainer.style.display = 'none';
            
            // "Rendering..." 表示
            const renderingText = document.createElement('div');
            renderingText.style.cssText = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 18px;
              font-weight: 600;
              text-align: center;
            `;
            renderingText.innerHTML = `
              <div style="font-size: 32px; margin-bottom: 8px;">⚡</div>
              <div>Rendering Component...</div>
            `;
            targetElement.appendChild(renderingText);
            
            setTimeout(() => {
              // 全ての一時的な要素を削除
              targetElement.innerHTML = '';
              
              // 元のスタイルに戻す
              targetElement.style.background = '';
              targetElement.style.border = '';
              targetElement.style.fontFamily = '';
              targetElement.style.fontSize = '';
              targetElement.style.color = '';
              targetElement.style.padding = '';
              targetElement.style.overflow = '';
              targetElement.style.animation = '';
              targetElement.style.position = '';
              
              // 感情に基づく最終的なコンテンツに置き換え（コンサルタント風）
              const finalContent = getSelectedContent();
              // アニメーションクラスと遅延を追加
              targetElement.innerHTML = `
                <div class="quadrant-label absolute -top-3 left-6 bg-${finalContent.bgColor}-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-fadeInUp" style="animation-delay: 0s;">
                  ${finalContent.category}
                </div>
                
                <div class="flex items-start space-x-4 mb-4 animate-fadeInUp" style="animation-delay: 0.1s;">
                  <div class="icon-container w-14 h-14 bg-gradient-to-br ${finalContent.gradient} rounded-xl flex items-center justify-center shadow-lg">
                    <span class="text-2xl">${finalContent.icon}</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800 mb-1 animate-fadeInUp" style="animation-delay: 0.2s;">${finalContent.title}</h3>
                    <p class="text-xs text-gray-500 uppercase tracking-wide animate-fadeInUp" style="animation-delay: 0.3s;">${finalContent.subtitle}</p>
                  </div>
                </div>

                <div class="description mb-4 animate-fadeInUp" style="animation-delay: 0.4s;">
                  <p class="text-sm text-gray-600 leading-relaxed">
                    ${finalContent.description}
                  </p>
                </div>

                <div class="metrics space-y-3">
                  <div class="metric-row flex justify-between items-center p-3 bg-${finalContent.bgColor}-50 rounded-lg border border-${finalContent.bgColor}-100 animate-fadeInUp" style="animation-delay: 0.5s;">
                    <span class="text-sm font-medium text-${finalContent.bgColor}-700">${finalContent.effectLabel}</span>
                    <span class="text-lg font-bold text-${finalContent.bgColor}-600">${finalContent.effect}</span>
                  </div>
                  <div class="metric-row flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fadeInUp" style="animation-delay: 0.6s;">
                    <span class="text-sm font-medium text-gray-700">${finalContent.roiLabel}</span>
                    <span class="text-lg font-bold text-gray-600">${finalContent.roi}</span>
                  </div>
                  <div class="emotion-badge bg-blue-50 rounded-lg px-3 py-2 text-xs border border-blue-100 animate-fadeInUp" style="animation-delay: 0.7s;">
                    <span class="text-blue-600 font-medium">🧠 感情分析ベース: </span>
                    <span class="font-semibold text-blue-800">${currentEmotion.toUpperCase()}</span>
                  </div>
                </div>
              `;
              
              // 完了効果
              targetElement.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.5)';
              setTimeout(() => {
                targetElement.style.boxShadow = '';
              }, 1000);
              
              setIsShowingOriginal(false);
              setAnimationState('complete');
              
              // 2秒後に完了コールバック
              setTimeout(() => {
                onComplete?.();
              }, 2000);
            }, 2000);
          }, 1500);
        }
      }, typingSpeed);

      return () => clearInterval(typingInterval);
    }
  }, [animationState, isVisible, onComplete]);

  // シンタックスハイライト関数
  const syntaxHighlight = (code: string) => {
    return code
      // HTMLコメント
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color: #7c3aed;">$1</span>')
      // HTMLタグ
      .replace(/(&lt;\/?\w+[^&gt;]*&gt;)/g, '<span style="color: #61dafb;">$1</span>')
      // CSS properties
      .replace(/([\w-]+)(\s*:\s*)/g, '<span style="color: #ff79c6;">$1</span><span style="color: #f8f8f2;">$2</span>')
      // style属性
      .replace(/(style=)/g, '<span style="color: #f1fa8c;">$1</span>')
      // class属性
      .replace(/(class=)/g, '<span style="color: #ff79c6;">$1</span>')
      // 文字列値
      .replace(/("([^"])*")/g, '<span style="color: #50fa7b;">$1</span>')
      // CSS値
      .replace(/(:)\s*([^;"\s>]+)/g, '$1 <span style="color: #bd93f9;">$2</span>')
      // CSS単位
      .replace(/(\d+)(px|em|rem|%|vh|vw)/g, '<span style="color: #ffb86c;">$1$2</span>');
  };

  // リセット処理
  useEffect(() => {
    if (!isVisible) {
      setAnimationState('slide');
      setCodeText('');
      setIsShowingOriginal(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="slide-container w-full h-full flex items-center justify-center p-1 md:p-2 lg:p-4" ref={slideRef}>
      {/* 4:3 アスペクト比のスライドコンテナ - 画面サイズに完全フィット */}
      <div className="slide-wrapper" style={{ 
        width: '100%', 
        height: '100%',
        maxWidth: 'min(100vw - 1rem, (100vh - 1rem) * 4/3)',
        maxHeight: 'min(100vh - 1rem, (100vw - 1rem) * 3/4)',
        aspectRatio: '4/3',
        position: 'relative'
      }}>
        <div className="slide bg-white w-full h-full rounded-xl shadow-2xl relative overflow-hidden border border-gray-100">
          
                     {/* ヘッダーセクション */}
           <div className="header bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-2 md:p-3 lg:p-4 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-light tracking-wide">製造業DX戦略</h1>
                    <p className="text-blue-200 text-xs font-light">ChatGPT Enterprise導入による競争優位性確立</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-mono">CONFIDENTIAL</div>
                  <div className="text-white/60 text-xs">Strategy Consulting Division</div>
                </div>
              </div>
            </div>
          </div>

                     {/* メインコンテンツエリア */}
           <div className="content-area p-2 md:p-4 lg:p-6 h-[calc(100%-100px)] bg-gradient-to-br from-gray-50 to-white">
            
            {/* 戦略概要セクション */}
            <div className="mb-2 md:mb-3 lg:mb-4">
              <h2 className="text-lg md:text-xl font-light text-gray-800 mb-1 md:mb-2">AI活用によるバリューチェーン変革シナリオ</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>
            </div>

                         {/* 4象限戦略マトリックス */}
             <div className="strategy-matrix grid grid-cols-2 grid-rows-2 gap-2 md:gap-3 lg:gap-4 h-[calc(100%-40px)]">
              
              {/* 象限1: 短期・高効果 */}
              <div 
                ref={selectedPlaceholder === 'scenario-1' ? targetElementRef : null}
                className={`quadrant bg-white border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden h-full ${selectedPlaceholder === 'scenario-1' ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-gray-200 hover:border-blue-300'}`}
              >
                {(isShowingOriginal || selectedPlaceholder !== 'scenario-1') && (
                  <>
                    <div className="quadrant-label absolute -top-3 left-6 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      短期実装・高効果
                    </div>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="icon-container w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xl">💡</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">R&D・設計支援AI</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Innovation Acceleration</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-normal">
                          AI技術による設計案自動生成と開発プロセス効率化
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 象限2: 短期・中効果 */}
              <div 
                ref={selectedPlaceholder === 'scenario-2' ? targetElementRef : null}
                className={`quadrant bg-white border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden h-full ${selectedPlaceholder === 'scenario-2' ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
              >
                {(isShowingOriginal || selectedPlaceholder !== 'scenario-2') && (
                  <>
                    <div className="quadrant-label absolute -top-3 left-6 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      短期実装・中効果
                    </div>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="icon-container w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xl">🎓</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">ナレッジ管理AI</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Knowledge Preservation</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-normal">
                          熟練技術者の暗黙知をAIが体系化。動画解析による作業手順抽出と技術マニュアル自動生成で知識継承を効率化。
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 象限3: 中期・高効果 */}
              <div 
                ref={selectedPlaceholder === 'scenario-3' ? targetElementRef : null}
                className={`quadrant bg-white border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden h-full ${selectedPlaceholder === 'scenario-3' ? 'border-orange-500 ring-4 ring-orange-100' : 'border-gray-200 hover:border-blue-300'}`}
              >
                {(isShowingOriginal || selectedPlaceholder !== 'scenario-3') && (
                  <>
                    <div className="quadrant-label absolute -top-3 left-6 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      中期実装・高効果
                    </div>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="icon-container w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xl">🏭</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">製造最適化AI</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Production Excellence</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-normal">
                          リアルタイム製造データ分析による最適化提案。異常検知と原因推定、品質保証レポート自動生成を統合。
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 象限4: 長期・変革的効果 */}
              <div 
                ref={selectedPlaceholder === 'scenario-4' ? targetElementRef : null}
                className={`quadrant bg-white border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden h-full ${selectedPlaceholder === 'scenario-4' ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-200 hover:border-blue-300'}`}
              >
                {(isShowingOriginal || selectedPlaceholder !== 'scenario-4') && (
                  <>
                    <div className="quadrant-label absolute -top-3 left-6 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      長期実装・変革的効果
                    </div>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="icon-container w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-xl">🚚</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">SCM最適化AI</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Supply Chain Revolution</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-normal">
                          複雑な調達データ分析と最適サプライヤー推奨。地政学的リスク分析による脆弱性評価と対策立案を実現。
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

                     {/* フッター */}
           <div className="footer absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-gray-200 px-2 md:px-4 lg:px-6 py-1 md:py-2">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-2 md:space-x-4">
                <span>© 2024 Strategic Consulting</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></span>
                <span className="hidden md:block">Manufacturing DX Strategy</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <span>Page 4 of 12</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></span>
                <span className="hidden md:block">CONFIDENTIAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slide-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .slide {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.8);
        }
        
        .quadrant {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
        }
        
        .quadrant:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .quadrant::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
          border-radius: 12px 12px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .quadrant:hover::before {
          opacity: 1;
        }

        .icon-container {
          transition: transform 0.3s ease;
        }

        .quadrant:hover .icon-container {
          transform: scale(1.05);
        }

        .metric-row {
          transition: all 0.2s ease;
        }

        .metric-row:hover {
          transform: translateX(2px);
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes slideInRight {
          0% { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }

        /* 新しく追加するアニメーション */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          opacity: 0; /* 初期状態 */
          animation-name: fadeInUp;
          animation-duration: 0.4s; /* アニメーションの速さを調整 */
          animation-fill-mode: forwards;
          animation-timing-function: ease-out;
        }
        /* ここまで追加 */

        .emotion-pulse {
          animation: emotionPulse 3s ease-in-out infinite;
        }

        @keyframes emotionPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        /* レスポンシブ対応 - 完全フィット */
        .slide-container {
          overflow: hidden;
        }
        
        .slide-wrapper {
          overflow: hidden;
        }
        
        @media (max-width: 1400px) {
          .quadrant h3 {
            font-size: 1rem;
          }
          
          .description p {
            font-size: 0.8rem;
          }
          
          .icon-container {
            width: 3rem;
            height: 3rem;
          }
          
          .icon-container span {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 1024px) {
          .quadrant h3 {
            font-size: 0.9rem;
          }
          
          .description p {
            font-size: 0.75rem;
          }
          
          .metrics {
            gap: 0.5rem;
          }
          
          .metric-row {
            padding: 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .strategy-matrix {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            height: auto;
          }
          
          .quadrant h3 {
            font-size: 0.8rem;
          }
          
          .description p {
            font-size: 0.65rem;
          }
          
          .icon-container {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .icon-container span {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 640px) {
          .header h1 {
            font-size: 1.25rem;
          }
          
          .header p {
            font-size: 0.75rem;
          }
          
          .quadrant h3 {
            font-size: 0.75rem;
          }
          
          .description p {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PresentationSlide; 