'use client'

import React, { useState, useEffect, useRef } from 'react';

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

// 感情に応じた最適化された内容
const getOptimizedContent = (emotion: EmotionType) => {
  const optimizations = {
    happy: {
      title: '更なる成長を加速する戦略提案',
      subtitle: manufacturingProposalContent.subtitle,
      factors: manufacturingProposalContent.factors.map(factor => ({
        ...factor,
        background: factor.background + ' 加えて、早期導入による競合優位性を最大化できます。'
      }))
    },
    concerned: {
      title: 'リスクを最小化した段階的DX戦略',
      subtitle: manufacturingProposalContent.subtitle,
      factors: manufacturingProposalContent.factors.map(factor => ({
        ...factor,
        background: factor.background + ' 小規模実証から開始し、確実な効果検証を経て展開します。'
      }))
    },
    neutral: manufacturingProposalContent
  };

  return optimizations[emotion === 'sad' || emotion === 'fearful' || emotion === 'angry' ? 'concerned' : 
                     emotion === 'happy' || emotion === 'surprised' ? 'happy' : 'neutral'];
};

// ターミナル風コーディングアニメーション用のコード生成
const getCodeSnippets = (emotion: EmotionType) => {
  const codeLines = [
    '# AI Content Optimizer',
    'def optimize_slide_content():',
    `    emotion = "${emotion.toUpperCase()}"`,
    '    strategy = analyze_emotion(emotion)',
    '',
    '    if emotion == "HAPPY":',
    '        return "aggressive_growth"',
    '    elif emotion == "FEARFUL":',
    '        return "risk_minimal"',
    '    else:',
    '        return "balanced_approach"',
    '',
    'result = optimize_slide_content()',
    'print(f"Strategy: {result}")'
  ];

  return codeLines;
};

const ConsultingSlide: React.FC<ConsultingSlideProps> = ({ isVisible, currentEmotion, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCoding, setIsCoding] = useState(false);
  const [displayedCode, setDisplayedCode] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showOptimized, setShowOptimized] = useState(false);
  const [codingComplete, setCodingComplete] = useState(false);
  const [isOptimizedContentShowing, setIsOptimizedContentShowing] = useState(false);
  const [isRadarScanning, setIsRadarScanning] = useState(false);
  const [radarPosition, setRadarPosition] = useState(-10);
  
  // テキスト色変化用のstate
  const [isTextGlowing, setIsTextGlowing] = useState(false);

  const [currentContent, setCurrentContent] = useState(manufacturingProposalContent);
  const codeLines = getCodeSnippets(currentEmotion);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  // タイマーをクリーンアップするヘルパー関数
  const clearAllTimers = () => {
    timeoutRefs.current.forEach(clearTimeout);
    intervalRefs.current.forEach(clearInterval);
    timeoutRefs.current = [];
    intervalRefs.current = [];
  };

  useEffect(() => {
    if (isVisible) {
      // 初期化: 元のコンテンツに戻す
              clearAllTimers(); // 既存のタイマーをクリア
        setCurrentContent(manufacturingProposalContent);
        setIsCoding(false);
        setCodingComplete(false);
        setShowOptimized(false);
        setIsOptimizedContentShowing(false);
        setIsRadarScanning(false);
        setRadarPosition(-10);
      
      setIsAnimating(true);
      const timer1 = setTimeout(() => {
        setIsAnimating(false);
        // 1秒後にレーダースキャン開始
        const timer2 = setTimeout(() => {
          startRadarScan();
        }, 1000);
        timeoutRefs.current.push(timer2);
      }, 300);
      timeoutRefs.current.push(timer1);
    }

    return () => {
      clearAllTimers();
    };
  }, [isVisible]);

  const startRadarScan = () => {
    console.log('レーダースキャン開始 (シンプル版)'); // デバッグ用
    setIsRadarScanning(true);
    setRadarPosition(-10);
    
    // ゆっくりとしたシンプルスキャン（5秒）
    const animationTimer = setTimeout(() => {
      console.log('レーダー位置を100%に移動開始'); // デバッグ用
      setRadarPosition(105);
    }, 100);
    timeoutRefs.current.push(animationTimer);
    
    // 5秒でレーダースキャン完了後、コーディングアニメーション開始
    const completeTimer = setTimeout(() => {
      setIsRadarScanning(false);
      setRadarPosition(-10);
      console.log('レーダースキャン完了、コーディングアニメーション開始'); // デバッグ用
      startTerminalCoding();
    }, 5200);
    timeoutRefs.current.push(completeTimer);
  };

  const startTerminalCoding = () => {
    setIsCoding(true);
    setDisplayedCode([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setCodingComplete(false);
    setShowOptimized(false);
    
    // 1.5秒でタイプライター効果を完了させる
    const totalDuration = 1500; // 1.5秒
    const totalCharacters = codeLines.join('').length;
    const baseDelay = totalDuration / totalCharacters;
    
    // タイプライター効果でコードを表示
    const timer = setTimeout(() => {
      typewriterEffect(0, 0, [], baseDelay);
    }, 50);
    timeoutRefs.current.push(timer);
  };

  const typewriterEffect = (lineIndex: number, charIndex: number, displayedLines: string[], baseDelay: number = 25) => {
    if (lineIndex >= codeLines.length) {
      // コーディング完了、即座に最適化コンテンツに移行
      console.log('タイプライター効果完了、最適化コンテンツに即座に移行'); // デバッグ用
      setCodingComplete(true);
      
      // 最適化されたコンテンツに即座に変更
      const optimizedContent = getOptimizedContent(currentEmotion);
      setCurrentContent(optimizedContent);
      setIsCoding(false);
      setCodingComplete(false);
      setShowOptimized(false);
      setIsOptimizedContentShowing(true);
      
      // 最適化後のコンテンツが表示されてからテキスト色変化を開始
      const optimizedTextGlowTimer = setTimeout(() => {
        setIsTextGlowing(true);
        console.log('最適化後コンテンツのテキスト色変化開始'); // デバッグ用
        
        // 3秒後に色変化終了
        const optimizedTextGlowEndTimer = setTimeout(() => {
          setIsTextGlowing(false);
          console.log('最適化後コンテンツのテキスト色変化終了'); // デバッグ用
        }, 3000);
        timeoutRefs.current.push(optimizedTextGlowEndTimer);
      }, 500); // 0.5秒後にテキスト色変化開始
      timeoutRefs.current.push(optimizedTextGlowTimer);
      
      console.log('Content optimized immediately:', optimizedContent.title); // デバッグ用
      
      return;
    }

    const currentLine = codeLines[lineIndex];
    
    if (charIndex >= currentLine.length) {
      // 現在の行が完了、次の行へ
      const newDisplayedLines = [...displayedLines, currentLine];
      setDisplayedCode(newDisplayedLines);
      setCurrentLineIndex(lineIndex + 1);
      setCurrentCharIndex(0);
      
      // 次の行の遅延
      const delay = currentLine === '' ? baseDelay * 2 : baseDelay * 3;
      
      const timer = setTimeout(() => {
        typewriterEffect(lineIndex + 1, 0, newDisplayedLines, baseDelay);
      }, delay);
      timeoutRefs.current.push(timer);
    } else {
      // 文字を一文字ずつ追加
      const partialLine = currentLine.substring(0, charIndex + 1);
      const newDisplayedLines = [...displayedLines];
      newDisplayedLines[lineIndex] = partialLine;
      
      setDisplayedCode(newDisplayedLines);
      setCurrentLineIndex(lineIndex);
      setCurrentCharIndex(charIndex + 1);
      
      // タイプライター速度（baseDelayを使用）
      const delay = baseDelay + Math.random() * baseDelay * 0.5;
      const timer = setTimeout(() => {
        typewriterEffect(lineIndex, charIndex + 1, newDisplayedLines, baseDelay);
      }, delay);
      timeoutRefs.current.push(timer);
    }
  };

  if (!isVisible) return null;

  // 不要になったスタイル関数は削除

  const renderTerminalPlaceholder = (terminalType: 'main' | 'solution') => {
    // テキスト色変更と同タイミングでプレースホルダーの枠をシアンブルーに
    const glowClass = isTextGlowing ? 'ring-4 ring-cyan-400 ring-opacity-75 shadow-lg shadow-cyan-400/50' : '';
    
    if (terminalType === 'main') {
      return (
        <div className={`w-full h-full bg-black rounded-sm p-1 font-mono text-[10px] leading-3 overflow-hidden flex flex-col transition-all duration-500 ${glowClass}`}>
          <div className={`mb-1 truncate transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-green-400'}`}>$ python optimize.py</div>
          <div className="flex-1 overflow-hidden">
            {displayedCode.slice(0, 6).map((line, lineIndex) => (
              <div key={lineIndex} className="truncate">
                <span className={`transition-colors duration-500 ${
                  isTextGlowing ? 'text-cyan-400' :
                  line.trim().startsWith('#') ? 'text-gray-400' :
                  line.includes('def ') ? 'text-yellow-400' :
                  line.includes('=') ? 'text-green-400' :
                  line.includes('"') ? 'text-red-400' :
                  'text-white'
                }`}>
                  {line.length > 35 ? line.substring(0, 32) + '...' : line}
                </span>
                {lineIndex === currentLineIndex && !codingComplete && (
                  <span className={`animate-pulse ${isTextGlowing ? 'bg-cyan-400 text-black' : 'bg-green-400 text-black'}`}>_</span>
                )}
              </div>
            ))}
          </div>
          {showOptimized && (
            <div className={`mt-1 animate-pulse truncate text-[9px] transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-cyan-400'}`}>
              ✅ Content optimized!
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className={`w-full h-full bg-black rounded-sm p-1 font-mono text-[10px] leading-3 overflow-hidden flex flex-col transition-all duration-500 ${glowClass}`}>
          <div className={`mb-1 truncate transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-green-400'}`}>$ generate_solution.py</div>
          <div className={`truncate transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-cyan-400'}`}>Analyzing emotion...</div>
          <div className={`truncate transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-yellow-400'}`}>emotion = "{currentEmotion.toUpperCase()}"</div>
          {codingComplete && (
            <div className="flex-1 flex flex-col justify-between">
              <div className={`truncate transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-white'}`}>strategy = "optimized"</div>
              <div className={`animate-pulse truncate text-[9px] transition-colors duration-500 ${isTextGlowing ? 'text-cyan-400' : 'text-green-400'}`}>
                ✅ Solution generated!
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      
      <div className={`w-full h-full bg-white ${isAnimating ? 'opacity-50' : 'opacity-100'} transition-all duration-300 relative flex flex-col`}>

      {/* レーダースキャンアニメーション */}
      {isRadarScanning && (
        <>
          {/* レーダースキャンライン（シンプル版） */}
          <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
            {/* メインレーダーライン */}
            <div 
              className="absolute w-full transition-all duration-[5000ms] ease-out"
              style={{
                height: '10px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 0, 0, 0.2) 10%, rgba(255, 0, 0, 0.6) 30%, rgba(255, 0, 0, 1) 50%, rgba(255, 0, 0, 0.6) 70%, rgba(255, 0, 0, 0.2) 90%, transparent 100%)',
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.5), 0 0 60px rgba(255, 0, 0, 0.3)',
                top: `${radarPosition}%`,
                left: 0,
                right: 0
              }}
            >
              {/* グロー効果上層 */}
              <div 
                className="absolute w-full -top-3"
                style={{
                  height: '16px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 0, 0, 0.1) 20%, rgba(255, 0, 0, 0.4) 40%, rgba(255, 0, 0, 0.6) 50%, rgba(255, 0, 0, 0.4) 60%, rgba(255, 0, 0, 0.1) 80%, transparent 100%)',
                  filter: 'blur(5px)'
                }}
              />
              {/* グロー効果下層 */}
              <div 
                className="absolute w-full -top-5"
                style={{
                  height: '20px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 0, 0, 0.05) 30%, rgba(255, 0, 0, 0.2) 45%, rgba(255, 0, 0, 0.3) 50%, rgba(255, 0, 0, 0.2) 55%, rgba(255, 0, 0, 0.05) 70%, transparent 100%)',
                  filter: 'blur(10px)'
                }}
              />
            </div>
          </div>
          
          {/* レーダースキャン中のインジケーター */}
          <div className="absolute top-4 right-4 z-[110] bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse shadow-lg">
            🔍 AI深層分析中... (位置: {radarPosition.toFixed(0)}%)
          </div>
        </>
      )}

      {/* 最適化されたコンテンツ表示中のインジケーター - パルス効果付き */}
      {isOptimizedContentShowing && (
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse shadow-lg border-2 border-green-300">
          ✅ AI最適化されたコンテンツを表示中
        </div>
      )}
      
      {/* 16:9 スライドコンテナ */}
      <div className="w-full max-w-none mx-auto bg-white flex flex-col h-full" style={{ aspectRatio: '16/9' }}>
        {/* ヘッダー */}
        <div className="px-8 py-6 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h1 className={`text-3xl font-bold text-gray-800 transition-all duration-500 ${isOptimizedContentShowing ? 'text-blue-600 animate-pulse' : ''}`}>
              {currentContent.title}
            </h1>
            <img 
              src="/SBLOGO.png" 
              alt="SoftBank Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* サブタイトル */}
        <div className="px-8 py-4">
          <p className="text-xl text-gray-700 text-center font-semibold">
            ソフトバンクと実現する<span className="text-blue-600">AI-Readyな製造業DX実装</span>による競争力強化戦略
          </p>
        </div>

        {/* メインコンテンツ - 3列レイアウト - フェードイン効果付き */}
        <div className="px-8 py-4 grid grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* 左側：導入阻害要因 */}
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 text-center">導入阻害要因</h3>
            <div className="flex flex-col space-y-2 flex-1 overflow-hidden">
              {currentContent.factors.map((factor, index) => (
                <div 
                  key={factor.id} 
                  className={`bg-blue-100 border border-blue-200 p-3 rounded flex-1 flex items-center transition-all duration-700 ${
                    isOptimizedContentShowing ? 'transform hover:scale-105 hover:shadow-md' : ''
                  }`}
                  style={{
                    animationDelay: isOptimizedContentShowing ? `${index * 200}ms` : '0ms'
                  }}
                >
                  <div className="text-base font-bold text-blue-800 text-center w-full leading-tight">{factor.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 中央：背景 - コーディングアニメーション対象 */}
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 text-center">背景</h3>
            <div className="flex flex-col space-y-2 flex-1 overflow-hidden">
              {currentContent.factors.map((factor, index) => (
                <div 
                  key={`bg-${index}`} 
                  className={`text-sm text-gray-600 leading-tight border-b border-gray-200 pb-2 flex-1 flex items-start relative overflow-hidden transition-all duration-700 ${
                    isOptimizedContentShowing ? 'hover:bg-gray-50 hover:shadow-sm' : ''
                  }`}
                  style={{
                    animationDelay: isOptimizedContentShowing ? `${(index + 4) * 200}ms` : '0ms'
                  }}
                >
                  {isCoding && index === 1 ? 
                    <div className="w-full h-full min-h-[80px] max-h-[120px]">
                      {renderTerminalPlaceholder('main')}
                    </div> : 
                    <div className={`w-full h-full flex items-start transition-colors duration-1000 ${
                      isTextGlowing && index === 1 ? 'text-cyan-400 font-semibold' : ''
                    }`}>
                      {factor.background}
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* 右側：導入促進の方向性 */}
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 text-center">導入促進の方向性</h3>
            <div className="flex flex-col space-y-2 flex-1 overflow-hidden">
              {currentContent.factors.map((factor, index) => (
                <div 
                  key={`sol-${factor.id}`} 
                  className="flex-1 overflow-hidden transition-all duration-700"
                  style={{
                    animationDelay: isOptimizedContentShowing ? `${(index + 8) * 200}ms` : '0ms'
                  }}
                >
                  {isCoding && index === 2 ? 
                    <div className="w-full h-full min-h-[80px] max-h-[120px] p-1">
                      {renderTerminalPlaceholder('solution')}
                    </div> : 
                    <div className={`p-3 rounded h-full flex flex-col transition-all duration-500 ${
                      isTextGlowing && index === 2 
                        ? 'bg-blue-600 text-white border border-blue-600' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${
                      isOptimizedContentShowing 
                        ? (isTextGlowing && index === 2 
                            ? 'hover:bg-blue-700 hover:scale-105 hover:shadow-lg' 
                            : 'hover:bg-gray-200 hover:scale-105 hover:shadow-md')
                        : ''
                    }`}>
                      <div className="text-sm font-bold mb-1 leading-tight transition-colors duration-1000">
                        {factor.solution}
                      </div>
                      <div className="text-xs leading-snug whitespace-pre-line flex-1 transition-colors duration-1000">
                        {factor.solutionDetails}
                      </div>
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 凡例 - スライド最下部に配置 - フェードイン効果付き */}
        <div className={`px-8 py-4 border-t border-gray-200 mt-auto transition-all duration-1000 ${
          isOptimizedContentShowing ? 'opacity-100' : 'opacity-100'
        }`}>
          <div className="flex justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-sm text-gray-600">短期間で実施可能且つ実効性あり</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">数年以上の時間を要するもの実現可</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">現状は打ち手案に乏しい</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ConsultingSlide;