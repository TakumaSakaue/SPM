'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';

type AnimationState = 'initial' | 'scanning' | 'highlighting' | 'coding' | 'changing' | 'complete';
type ChangeItem = {
  selector: string;
  originalText: string;
  newText: string;
  element?: HTMLElement | null;
  htmlCoding?: boolean;
  codeContent?: string;
};

interface PresentationSlideProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const PresentationSlide: React.FC<PresentationSlideProps> = ({ isVisible, onComplete }) => {
  const [animationState, setAnimationState] = useState<AnimationState>('initial');
  const [scanProgress, setScanProgress] = useState(0);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(-1);
  const slideRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [debugMessage, setDebugMessage] = useState<string>(''); // デバッグメッセージ用の状態

  // アニメーション効果音
  useEffect(() => {
    audioRef.current = new Audio('/test.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 変更する項目のリスト - サプライチェーン最適化を先頭に移動
  const changeItems: ChangeItem[] = [
    {
      selector: '.scenario-4', // サプライチェーン最適化を最初に処理
      originalText: 'サプライチェーン最適化',
      newText: '異常検知エージェント',
      htmlCoding: true,
      codeContent: `<div class="scenario-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
  <div class="scenario-icon anomaly-agent-icon" style="background: linear-gradient(135deg, #4a6fa5 0%, #2c5282 100%); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
    <i class="fas fa-shield-alt"></i>
  </div>
  <div class="scenario-title anomaly-agent-title" style="font-size: 22px; font-weight: 600;">異常検知エージェント</div>
</div>

<div class="scenario-desc" style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 15px; line-height: 1.4; flex-grow: 1;">
  異常検知エージェント複雑なシステムデータの分析と最適アラート推奨、異常予測の精度向上、パターン最適化シミュレーション。セキュリティリスク分析によるシステムの脆弱性評価と対策立案。イベント相関分析による対応工数・復旧時間削減を実現。
</div>`
    },
    {
      selector: '.scenario-1 .scenario-title',
      originalText: 'R&D・製品設計支援',
      newText: 'AIによる革新的R&D・設計支援'
    },
    {
      selector: '.scenario-1 .metric-value:first-of-type',
      originalText: '開発期間 30%短縮',
      newText: '開発期間 45%短縮'
    },
    {
      selector: '.scenario-2 .scenario-desc',
      originalText: '熟練技術者の暗黙知をAIが理解・構造化し、検索可能なナレッジベースを構築。技術マニュアル自動生成、動画解析による作業手順の抽出、若手への効率的な技術継承を支援。トレーニングプログラムの自動カスタマイズ提供。',
      newText: '熟練技術者の暗黙知をAIが理解・構造化し、マルチモーダルナレッジベースを構築。技術マニュアル自動生成、3D動画解析による作業手順の抽出、若手への効率的な技術継承を支援。個別最適化されたトレーニングプログラムをAR/VRで提供。'
    },
    {
      selector: '.scenario-3 .metric-value:nth-of-type(2)',
      originalText: '生産性 18%向上',
      newText: '生産性 31%向上'
    },
    {
      selector: '.scenario-5 .indicator:nth-child(2) .indicator-value',
      originalText: '',
      newText: ''
    }
  ];

  // スライド内の要素への参照を設定
  useEffect(() => {
    if (slideRef.current && isVisible) {
      // デバッグメッセージをリセット
      setDebugMessage('要素を検索中...');
      
      changeItems.forEach((item, index) => {
        const element = slideRef.current?.querySelector(item.selector);
        changeItems[index].element = element as HTMLElement;
        
        // インジケーターバーの特別な処理
        if (item.selector.includes('indicator-value')) {
          const element = slideRef.current?.querySelector(item.selector) as HTMLElement;
          if (element) {
            item.originalText = element.style.width;
            item.newText = '92%';
            changeItems[index].element = element;
          }
        }
        
        // 要素の検索結果をデバッグメッセージに追加
        setDebugMessage(prev => `${prev}\n${item.selector}: ${element ? '見つかりました' : '見つかりません'}`);
      });
      
      // サプライチェーンエリアの要素を明示的に確認
      const supplyChainElement = slideRef.current?.querySelector('.scenario-4');
      setDebugMessage(prev => `${prev}\nサプライチェーンエリア検出: ${supplyChainElement ? 'OK' : '失敗'}`);
    }
  }, [isVisible]);

  // スキャンアニメーション
  useEffect(() => {
    if (animationState === 'scanning' && isVisible) {
      setDebugMessage('スキャンアニメーション実行中...');
      
      const scanInterval = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + 0.57; // 約3.5秒で100%に到達するよう調整
          if (newProgress >= 100) {
            clearInterval(scanInterval);
            setAnimationState('highlighting');
            setDebugMessage('スキャン完了 → ハイライトフェーズへ移行');
            return 100;
          }
          return newProgress;
        });
      }, 20);
      
      return () => clearInterval(scanInterval);
    }
  }, [animationState, isVisible]);

  // ハイライト→変更アニメーション
  useEffect(() => {
    if (animationState === 'highlighting' && isVisible) {
      setDebugMessage('ハイライトフェーズでサプライチェーン要素を異常検知エージェントに直接置き換えます');
      
      // サプライチェーンエリアを直接置き換え
      const supplyChainElement = slideRef.current?.querySelector('.scenario-4') as HTMLElement;
      
      if (supplyChainElement) {
        setDebugMessage('サプライチェーンエリア発見: コーディングアニメーションのための準備');
        // コーディングアニメーションフェーズに移行
        setCurrentChangeIndex(0);
        setAnimationState('coding');
      } else {
        setDebugMessage('エラー: サプライチェーンエリアが見つかりません');
        setTimeout(() => {
          setAnimationState('changing');
          setCurrentChangeIndex(1); // サプライチェーンが見つからなくても次へ
        }, 800);
      }
    }
  }, [animationState, isVisible]);

  // HTMLコーディングアニメーション用の状態
  const [codeText, setCodeText] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // HTMLコーディングアニメーション
  useEffect(() => {
    if (animationState === 'coding' && currentChangeIndex >= 0 && isVisible) {
      const currentItem = changeItems[currentChangeIndex];
      
      setDebugMessage(`コーディング処理: 項目${currentChangeIndex} - ${currentItem.selector}`);
      
      // サプライチェーンエリアのHTMLコーディングアニメーションを強制的に実行
      if (currentChangeIndex === 0) { // 最初の項目はサプライチェーンに変更済み
        const supplyChainElement = slideRef.current?.querySelector('.scenario-4') as HTMLElement;
        
        if (supplyChainElement) {
          setDebugMessage(`サプライチェーンエリア発見: コーディングアニメーション開始`);
          
          // 元のコンテンツとスタイル情報を保存
          const originalContent = supplyChainElement.innerHTML;
          const originalClasses = Array.from(supplyChainElement.classList);
          
          // コードエディタスタイルを適用
          supplyChainElement.classList.add('code-editor');
          
          // コードを1文字ずつ表示するアニメーション
          let charIndex = 0;
          const codeContent = currentItem.codeContent || '';
          const codeLength = codeContent.length;
          const typingSpeed = 3; // 超高速タイピング
          
          setDebugMessage(`コード長: ${codeLength}文字 タイピング開始`);
          
          // タイピング音の設定
          if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => {});
          }
          
          const typingInterval = setInterval(() => {
            if (charIndex < codeLength) {
              const newChar = codeContent[charIndex];
              setCodeText((prev: string) => prev + newChar);
              
              // 整形されたHTMLで表示
              const displayCode = syntaxHighlight(codeContent.substring(0, charIndex + 1));
              supplyChainElement.innerHTML = `<pre class="code-content">${displayCode}</pre>`;
              
              charIndex++;
              
              // 進捗をデバッグ表示に反映
              if (charIndex % 50 === 0) {
                setDebugMessage(`タイピング中: ${Math.floor(charIndex/codeLength*100)}%完了`);
              }
            } else {
              // タイピング完了
              clearInterval(typingInterval);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.loop = false;
              }
              
              setDebugMessage('タイピング完了 → レンダリングフェーズへ');
              
              setTimeout(() => {
                // レンダリング完了アニメーション
                supplyChainElement.classList.add('rendering');
                setDebugMessage('レンダリング中...');
                
                setTimeout(() => {
                  // 最終的な内容に置換
                  supplyChainElement.classList.remove('code-editor', 'rendering');
                  
                  // 元々のクラスを確実に再適用
                  originalClasses.forEach(cls => {
                    if (!['code-editor', 'rendering'].includes(cls)) {
                      supplyChainElement.classList.add(cls);
                    }
                  });
                  
                  // インラインスタイルですべての要素を構築 - 重要: インラインスタイルを直接指定
                  supplyChainElement.innerHTML = `
                  <div class="scenario-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div class="scenario-icon anomaly-agent-icon" style="background: linear-gradient(135deg, #4a6fa5 0%, #2c5282 100%); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="scenario-title anomaly-agent-title" style="font-size: 22px; font-weight: 600;">異常検知エージェント</div>
                  </div>
                  
                  <div class="scenario-desc" style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 15px; line-height: 1.4; flex-grow: 1;">
                    異常検知エージェント複雑なシステムデータの分析と最適アラート推奨、異常予測の精度向上、パターン最適化シミュレーション。セキュリティリスク分析によるシステムの脆弱性評価と対策立案。イベント相関分析による対応工数・復旧時間削減を実現。
                  </div>
                  `;
                  
                  // スタイルが適用されていることを確認するための追加処理
                  setTimeout(() => {
                    const headerElement = supplyChainElement.querySelector('.scenario-header');
                    const iconElement = supplyChainElement.querySelector('.scenario-icon');
                    const titleElement = supplyChainElement.querySelector('.scenario-title');
                    const descElement = supplyChainElement.querySelector('.scenario-desc');
                    
                    if (headerElement) {
                      headerElement.setAttribute('style', 'display: flex; align-items: center; gap: 15px; margin-bottom: 15px;');
                    }
                    
                    if (iconElement) {
                      // 確実にスタイルを適用
                      iconElement.setAttribute('style', 'background: linear-gradient(135deg, #4a6fa5 0%, #2c5282 100%); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;');
                    }
                    
                    if (titleElement) {
                      // 確実にスタイルを適用
                      titleElement.setAttribute('style', 'font-size: 22px; font-weight: 600;');
                    }
                    
                    if (descElement) {
                      // 確実に本文スタイルを適用
                      descElement.setAttribute('style', 'font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 15px; line-height: 1.4; flex-grow: 1;');
                    }
                  }, 100);
                  
                  // コンテンツ変換完了エフェクト
                  supplyChainElement.classList.add('transform-complete');
                  setDebugMessage('レンダリング完了 → トランスフォーム効果適用中');
                  
                  setTimeout(() => {
                    supplyChainElement.classList.remove('transform-complete');
                    setIsRendering(false);
                    setCodeText('');
                    
                    // 次の処理へ移行
                    setDebugMessage('アニメーション完了 → 次の項目へ');
                    setCurrentChangeIndex(prev => prev + 1);
                    setAnimationState('changing');
                  }, 1000);
                }, 1000);
              }, 500);
            }
          }, typingSpeed);
          
          return () => clearInterval(typingInterval);
        }
      } else {
        // 通常のテキスト変更処理に移行
        setAnimationState('changing');
      }
    }
  }, [animationState, currentChangeIndex, isVisible]);

  // changeItemsのコードコンテンツも更新する
  useEffect(() => {
    if (isVisible && changeItems.length > 0 && changeItems[0].htmlCoding) {
      // コードコンテンツを最新のスタイル情報で更新
      const updatedCodeContent = `<div class="scenario-header" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
  <div class="scenario-icon anomaly-agent-icon" style="background: linear-gradient(135deg, #4a6fa5 0%, #2c5282 100%); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">
    <i class="fas fa-shield-alt"></i>
  </div>
  <div class="scenario-title anomaly-agent-title" style="font-size: 22px; font-weight: 600;">異常検知エージェント</div>
</div>

<div class="scenario-desc" style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 15px; line-height: 1.4; flex-grow: 1;">
  異常検知エージェント複雑なシステムデータの分析と最適アラート推奨、異常予測の精度向上、パターン最適化シミュレーション。セキュリティリスク分析によるシステムの脆弱性評価と対策立案。イベント相関分析による対応工数・復旧時間削減を実現。
</div>`;
      
      changeItems[0].codeContent = updatedCodeContent;
    }
  }, [isVisible]);

  // シンタックスハイライト関数
  const syntaxHighlight = (code: string) => {
    // HTMLタグを強調
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(".*?")/g, '<span class="string">$1</span>')
      .replace(/(&lt;\/?[a-z].*?&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(class|style|id)=/g, '<span class="attr">$1</span>');
  };

  // テキスト変更アニメーション
  useEffect(() => {
    if (animationState === 'changing' && currentChangeIndex >= 0 && currentChangeIndex < changeItems.length && isVisible) {
      const currentItem = changeItems[currentChangeIndex];
      console.log('Processing item', currentChangeIndex, currentItem.selector, currentItem.htmlCoding ? 'HTML Coding' : 'Normal');
      
      // HTML編集対象の場合、コーディングフェーズに移行
      if (currentItem.htmlCoding) {
        console.log('Moving to coding state for HTML item');
        setAnimationState('coding');
        return;
      }
      
      const element = currentItem.element;
      
      if (element) {
        // 特別なケース：インジケーターバー
        if (currentItem.selector.includes('indicator-value')) {
          element.style.width = '78%';
          
          // インジケーターの値テキストも更新
          const valueText = element.closest('.indicator')?.querySelector('div:last-child');
          if (valueText) {
            valueText.textContent = '92%';
          }
          
          // ハイライト効果
          element.classList.add('highlight-animation');
          setTimeout(() => {
            element.classList.remove('highlight-animation');
            element.style.width = '92%';
            
            // 次の項目へ
            setTimeout(() => {
              setCurrentChangeIndex(prev => prev + 1);
              if (currentChangeIndex === changeItems.length - 1) {
                setTimeout(() => {
                  setAnimationState('complete');
                  if (onComplete) onComplete();
                }, 1000);
              }
            }, 800);
          }, 1200);
          
          return;
        }
        
        // ハイライト効果
        element.classList.add('highlight-text');
        
        setTimeout(() => {
          // タイプライター効果
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
          
          let originalText = element.textContent || '';
          const newText = currentItem.newText;
          let currentIndex = 0;
          
          const typingInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex <= newText.length) {
              element.textContent = newText.substring(0, currentIndex);
            } else {
              clearInterval(typingInterval);
              
              // ハイライト解除して青背景
              element.classList.remove('highlight-text');
              element.classList.add('highlight-bg');
              
              // 背景色フェードアウト
              setTimeout(() => {
                element.classList.remove('highlight-bg');
                element.classList.add('highlight-bg-fade');
                
                // 次の項目へ
                setTimeout(() => {
                  element.classList.remove('highlight-bg-fade');
                  setCurrentChangeIndex(prev => prev + 1);
                  
                  // 最後の項目が完了したら完了状態へ
                  if (currentChangeIndex === changeItems.length - 1) {
                    setTimeout(() => {
                      setAnimationState('complete');
                      if (onComplete) onComplete();
                    }, 1000);
                  }
                }, 800);
              }, 1000);
            }
          }, 30);
          
          return () => clearInterval(typingInterval);
        }, 800);
      } else {
        // 要素が見つからない場合は次へ
        setCurrentChangeIndex(prev => prev + 1);
      }
    }
  }, [animationState, currentChangeIndex, isVisible, onComplete]);

  // アニメーション開始ロジックを修正：サプライチェーン要素のHTMLコーディングアニメーションへの対応
  const startAnimation = useCallback(() => {
    if (isVisible) {
      if (animationState === 'initial') {
        setDebugMessage('アニメーション開始: スキャンフェーズ');
        setAnimationState('scanning');
      } else if (animationState === 'coding' && currentChangeIndex === 0) {
        // サプライチェーン要素が見つかったら、HTMLコーディングアニメーションを開始
        const supplyChainElement = slideRef.current?.querySelector('.scenario-4');
        if (supplyChainElement) {
          console.log('Found supply chain element, starting HTML coding animation');
          setDebugMessage('コーディングアニメーション開始');
        }
      }
    }
  }, [isVisible, animationState, currentChangeIndex]);

  // 表示されたらアニメーション開始
  useEffect(() => {
    if (isVisible) {
      setTimeout(startAnimation, 800);
    } else {
      setAnimationState('initial');
      setScanProgress(0);
      setCurrentChangeIndex(-1);
      setDebugMessage('');
    }
  }, [isVisible, startAnimation]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full">
      {/* デバッグ表示 - 開発中のみ表示 */}
      <div className="fixed top-0 right-0 bg-black/80 text-white p-4 z-50 max-w-md overflow-auto max-h-64 text-xs font-mono whitespace-pre-wrap">
        <div className="text-cyan-400 mb-2">デバッグ情報:</div>
        <div>状態: {animationState}</div>
        <div>現在の項目: {currentChangeIndex}</div>
        <div>スキャン進捗: {Math.round(scanProgress)}%</div>
        <div className="mt-2 text-yellow-300">{debugMessage}</div>
      </div>

      {/* スライドコンテナを中央寄せ */}
      <div className="relative flex-grow flex items-center justify-center bg-gray-900 rounded-lg p-4 overflow-hidden">
        {/* スキャンラインのオーバーレイ */}
        {animationState === 'scanning' && (
          <div 
            className="absolute left-0 right-0 h-1 bg-cyan-500 z-10 scanline-animation"
            style={{ 
              top: `${scanProgress}%`,
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.5)'
            }}
          ></div>
        )}
        
        {/* 実際のスライド */}
        <div className="slide-container" ref={slideRef}>
          <div className="slide">
            <div className="header">
                <div className="title">製造業における生成AI活用シナリオ</div>
                <div className="subtitle">ChatGPT Enterprise活用によるバリューチェーン全体の革新</div>
            </div>
            
            <div className="content">
                {/* シナリオ1: R&D・設計 */}
                <div className="scenario scenario-1">
                    <div className="scenario-header">
                        <div className="scenario-icon">
                            <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="scenario-title">R&D・製品設計支援</div>
                    </div>
                    
                    <div className="scenario-desc">
                        技術文献の要約・分析、設計案の自動生成、CADモデルの最適化支援、特許分析による競合調査など、製品開発プロセスを加速化。最新技術トレンドの継続的モニタリングと実装案提案により革新的製品開発を実現。
                    </div>
                    
                    <div className="metrics">
                        <div className="metric benefit">
                            <div className="metric-title">期待効果</div>
                            <div className="metric-value">開発期間 30%短縮</div>
                        </div>
                        <div className="metric benefit">
                            <div className="metric-title">ROI</div>
                            <div className="metric-value">投資対効果 3.2倍</div>
                        </div>
                    </div>
                </div>
                
                {/* シナリオ2: 技術伝承 */}
                <div className="scenario scenario-2">
                    <div className="scenario-header">
                        <div className="scenario-icon">
                            <i className="fas fa-user-graduate"></i>
                        </div>
                        <div className="scenario-title">技術伝承・ナレッジ管理</div>
                    </div>
                    
                    <div className="scenario-desc">
                        熟練技術者の暗黙知をAIが理解・構造化し、検索可能なナレッジベースを構築。技術マニュアル自動生成、動画解析による作業手順の抽出、若手への効率的な技術継承を支援。トレーニングプログラムの自動カスタマイズ提供。
                    </div>
                    
                    <div className="metrics">
                        <div className="metric benefit">
                            <div className="metric-title">期待効果</div>
                            <div className="metric-value">技術習得期間 40%短縮</div>
                        </div>
                        <div className="metric challenge">
                            <div className="metric-title">課題</div>
                            <div className="metric-value">データ品質管理の徹底</div>
                        </div>
                    </div>
                </div>
                
                {/* シナリオ3: 生産管理 */}
                <div className="scenario scenario-3">
                    <div className="scenario-header">
                        <div className="scenario-icon">
                            <i className="fas fa-industry"></i>
                        </div>
                        <div className="scenario-title">生産管理・品質保証</div>
                    </div>
                    
                    <div className="scenario-desc">
                        製造プロセスデータのリアルタイム分析と最適化提案、異常検知と原因推定、品質保証レポートの自動生成。複雑な生産スケジュールの最適化と需要予測による生産計画の精度向上。異常時の対応策を迅速に提案し生産効率を維持。
                    </div>
                    
                    <div className="metrics">
                        <div className="metric benefit">
                            <div className="metric-title">期待効果</div>
                            <div className="metric-value">不良率 25%低減</div>
                        </div>
                        <div className="metric benefit">
                            <div className="metric-title">効率化</div>
                            <div className="metric-value">生産性 18%向上</div>
                        </div>
                    </div>
                </div>
                
                {/* シナリオ4: サプライチェーン */}
                <div className="scenario scenario-4">
                    <div className="scenario-header">
                        <div className="scenario-icon">
                            <i className="fas fa-truck"></i>
                        </div>
                        <div className="scenario-title">サプライチェーン最適化</div>
                    </div>
                    
                    <div className="scenario-desc">
                        複雑な調達データの分析と最適サプライヤー推奨、需要予測の精度向上、在庫最適化シミュレーション。地政学的リスク分析によるサプライチェーンの脆弱性評価と対策立案。物流ルート最適化による環境負荷・コスト削減を実現。
                    </div>
                    
                    <div className="metrics">
                        <div className="metric benefit">
                            <div className="metric-title">期待効果</div>
                            <div className="metric-value">在庫コスト 22%削減</div>
                        </div>
                        <div className="metric challenge">
                            <div className="metric-title">課題</div>
                            <div className="metric-value">データ連携体制の整備</div>
                        </div>
                    </div>
                </div>
                
                {/* シナリオ5: カスタマーサポート */}
                <div className="scenario scenario-5">
                    <div className="scenario-5-content">
                        <div className="scenario-header">
                            <div className="scenario-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <div className="scenario-title">カスタマーサポート・アフターサービス</div>
                        </div>
                        
                        <div className="scenario-desc">
                            製品マニュアルをインテリジェント化し、ユーザーの質問に対して的確な回答を提供。技術文書から回答を抽出し、顧客満足度向上。故障予測によるプロアクティブなメンテナンス提案、複雑な技術的問い合わせへの対応品質向上。顧客フィードバック分析による製品改良点の自動抽出機能。
                        </div>
                    </div>
                    
                    <div className="scenario-5-metrics">
                        <div className="indicator">
                            <div className="indicator-label">応答時間短縮</div>
                            <div className="indicator-bar">
                                <div className="indicator-value" style={{ width: '85%' }}></div>
                            </div>
                            <div>85%</div>
                        </div>
                        
                        <div className="indicator">
                            <div className="indicator-label">顧客満足度</div>
                            <div className="indicator-bar">
                                <div className="indicator-value" style={{ width: '78%' }}></div>
                            </div>
                            <div>78%</div>
                        </div>
                        
                        <div className="indicator">
                            <div className="indicator-label">解決率向上</div>
                            <div className="indicator-bar">
                                <div className="indicator-value" style={{ width: '65%' }}></div>
                            </div>
                            <div>65%</div>
                        </div>
                        
                        <div className="indicator">
                            <div className="indicator-label">コスト削減</div>
                            <div className="indicator-bar">
                                <div className="indicator-value" style={{ width: '70%' }}></div>
                            </div>
                            <div>70%</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="footer">
                <div>© 2023 ソフトバンク株式会社</div>
                <div>製造業におけるChatGPT Enterprise活用戦略 | 4</div>
            </div>
          </div>
        </div>
      </div>
      
      {animationState === 'complete' && (
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            onClick={onComplete}
          >
            閉じる
          </button>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition"
          >
            最適化された提案資料を開く
          </button>
        </div>
      )}
      
      <style jsx>{`
        .slide-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            max-width: 1280px;
            max-height: 720px;
        }
        
        .slide {
            width: 100%;
            height: 100%;
            aspect-ratio: 16 / 9;
            background: linear-gradient(135deg, #454545 0%, #333333 100%);
            overflow: hidden;
            position: relative;
            color: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        /* 異常検知エージェント専用のスタイル */
        .anomaly-agent-icon {
          background: linear-gradient(135deg, #4a6fa5 0%, #2c5282 100%) !important;
          width: 50px !important;
          height: 50px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 24px !important;
          flex-shrink: 0 !important;
        }
        
        .anomaly-agent-title {
          font-size: 22px !important;
          font-weight: 600 !important;
        }

        .header {
            background: linear-gradient(90deg, #2c3e50 0%, #34495e 100%);
            padding: 25px 40px;
            border-bottom: 3px solid rgba(255,255,255,0.1);
        }
        .title {
            font-size: 36px;
            font-weight: 700;
            color: white;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 18px;
            color: #a3c6ff;
            font-weight: 300;
        }
        .content {
            padding: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 25px;
            height: calc(720px - 100px - 50px);
        }
        .scenario {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s;
            border-bottom: 3px solid transparent;
        }
        .scenario:hover {
            transform: translateY(-5px);
        }
        .scenario-1 {
            grid-column: 1;
            grid-row: 1;
            border-bottom-color: #3498db;
        }
        .scenario-2 {
            grid-column: 2;
            grid-row: 1;
            border-bottom-color: #3498db;
        }
        .scenario-3 {
            grid-column: 1;
            grid-row: 2;
            border-bottom-color: #3498db;
        }
        .scenario-4 {
            grid-column: 2;
            grid-row: 2;
            border-bottom-color: #3498db;
        }
        .scenario-5 {
            grid-column: 1 / span 2;
            grid-row: 3;
            border-bottom-color: #3498db;
            display: flex;
            flex-direction: row;
        }
        .scenario-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        .scenario-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
        }
        .scenario-title {
            font-size: 22px;
            font-weight: 600;
        }
        .scenario-desc {
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 15px;
            line-height: 1.4;
            flex-grow: 1;
        }
        .metrics {
            display: flex;
            gap: 15px;
        }
        .metric {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
        }
        .benefit {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(41, 128, 185, 0.3) 100%);
        }
        .challenge {
            background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(192, 57, 43, 0.3) 100%);
        }
        .metric-title {
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
            opacity: 0.7;
        }
        .metric-value {
            font-weight: 600;
        }
        .footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 15px 40px;
            font-size: 12px;
            color: rgba(255,255,255,0.5);
            background: rgba(0,0,0,0.2);
            display: flex;
            justify-content: space-between;
        }
        .scenario-5-content {
            flex: 2;
            padding-right: 20px;
        }
        .scenario-5-metrics {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 15px;
        }
        .indicator {
            display: flex;
            align-items: center;
            margin-top: 10px;
            gap: 5px;
        }
        .indicator-label {
            font-size: 12px;
            width: 100px;
        }
        .indicator-bar {
            height: 8px;
            flex-grow: 1;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        .indicator-value {
            height: 100%;
            background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
            border-radius: 4px;
        }
        
        /* HTMLコーディングアニメーション用スタイル */
        .code-editor {
          background-color: rgba(0, 0, 0, 0.9) !important;
          color: #ffffff;
          font-family: 'Consolas', 'Monaco', monospace;
          padding: 15px !important;
          overflow: auto;
          position: relative;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 255, 255, 0.3) !important;
          display: block !important;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
          z-index: 100;
        }
        
        .code-content {
          margin: 0;
          white-space: pre;
          line-height: 1.5;
          font-size: 14px;
          position: relative;
        }
        
        .tag {
          color: #569cd6; /* 青 */
        }
        
        .attr {
          color: #9cdcfe; /* 水色 */
        }
        
        .string {
          color: #ce9178; /* オレンジ */
        }
        
        .rendering {
          animation: pulse-render 1s ease-in-out;
          border: 1px solid rgba(0, 255, 255, 0.8) !important;
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
        }
        
        .transform-complete {
          animation: transform-flash 0.8s ease-out;
        }
        
        @keyframes pulse-render {
          0% { background-color: rgba(0, 0, 0, 0.9); }
          50% { background-color: rgba(0, 100, 150, 0.6); }
          100% { background-color: rgba(0, 0, 0, 0.1); }
        }
        
        @keyframes transform-flash {
          0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
          40% { box-shadow: 0 0 30px 15px rgba(52, 152, 219, 0.7); }
          100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
        }
        
        /* 既存のアニメーション関連スタイル */
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
        
        .scanline-animation {
            animation: scan 3.5s linear;
        }
        
        .highlight-text {
            background-color: rgba(52, 152, 219, 0.3);
            border-radius: 4px;
            color: white;
            box-shadow: 0 0 12px rgba(52, 152, 219, 0.5);
            position: relative;
            z-index: 10;
        }
        
        .highlight-bg {
            background-color: rgba(52, 152, 219, 0.2);
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        
        .highlight-bg-fade {
            background-color: rgba(52, 152, 219, 0);
            border-radius: 4px;
            transition: background-color 1s;
        }
        
        .highlight-animation {
            animation: pulse 1.2s ease;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
            100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
        }
      `}</style>
    </div>
  );
};

export default PresentationSlide; 