import React, { useRef, useEffect, useState } from 'react';

// Propsの型定義を追加
interface StarrySphereProps {
  isAudioActive?: boolean;
  audioLevel?: number;
}

const StarrySphere = ({ isAudioActive = false, audioLevel = 0 }: StarrySphereProps) => {
  const sphereCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (sphereCanvasRef.current) {
      // Get canvas and context
      const canvas = sphereCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match parent element
      const setCanvasSize = () => {
        const container = canvas.parentElement;
        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        } else {
          // Default size
          canvas.width = 350;
          canvas.height = 350;
        }
      };
      
      setCanvasSize();
      
      // Reset size on window resize
      const handleResize = () => {
        setCanvasSize();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Define dots array
      const dots: any[] = [];
      
      // Purple/Pink colors array for CRISTAL theme
      const starColors = [
        'rgba(147, 51, 234, 0.9)',   // Purple
        'rgba(168, 85, 247, 0.8)',   // Light purple
        'rgba(196, 181, 253, 0.8)',  // Very light purple
        'rgba(219, 39, 119, 0.7)',  // Pink
        'rgba(236, 72, 153, 0.7)',  // Light pink
        'rgba(244, 114, 182, 0.7)'  // Very light pink
      ];
      
      // Generate points on sphere
      const generateSphere = () => {
        const canvasSize = Math.min(canvas.width, canvas.height);
        const numDots = 1200; // Number of dots (reduced from 1500)
        const radius = canvasSize * 0.45; // Sphere radius
        
        dots.length = 0; // Clear array
        
        for (let i = 0; i < numDots; i++) {
          // Distribute points evenly on sphere surface
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u; // 0~2π (longitude)
          const phi = Math.acos(2 * v - 1); // 0~π (latitude)
          
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          
          // Assign random size and color
          const randomSize = Math.random();
          const starSize = randomSize * 2.5 + 0.3; // More size variation
          const colorIndex = Math.floor(Math.random() * starColors.length);
          const brightness = randomSize * 0.7 + 0.3; // Random brightness
          
          // Star twinkling parameters
          const twinkle = Math.random() * 0.08 + 0.04; // Twinkle speed
          const twinkleOffset = Math.random() * Math.PI * 2; // Initial phase
          
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
      
      // Animation frame
      let angle = 0;
      let time = 0;
      
      const animate = () => {
        // キャンバスをクリア（透明に）
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate center point and radius
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const targetRadius = Math.min(canvas.width, canvas.height) * 0.45;
        
        // 音声レベルに基づくアニメーション効果をコントロール
        const effectiveAudioLevel = isAudioActive ? Math.max(0.1, audioLevel) : 0;
        const audioFactor = isAudioActive ? 1 + effectiveAudioLevel * 1.5 : 1; // 最大で2.5倍まで
        
        // Draw "CRISTAL" text
        const fontSize = Math.min(canvas.width, canvas.height) * 0.12 * (isAudioActive ? audioFactor * 0.8 : 1);
        ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Create purple/pink gradient for text
        const textGradient = ctx.createLinearGradient(
          centerX - fontSize * 2, 
          centerY, 
          centerX + fontSize * 2, 
          centerY
        );
        
        // 音声レベルに応じてグラデーションの色を調整
        const textAlpha = isAudioActive ? 0.7 + effectiveAudioLevel * 0.3 : 0.7;
        const highlightAlpha = isAudioActive ? 0.9 + effectiveAudioLevel * 0.1 : 0.9;
        
        textGradient.addColorStop(0, `rgba(147, 51, 234, ${textAlpha})`);
        textGradient.addColorStop(0.5, `rgba(236, 72, 153, ${highlightAlpha})`);
        textGradient.addColorStop(1, `rgba(147, 51, 234, ${textAlpha})`);
        
        // Add glow effect - 音声レベルに応じてグロー効果を強調
        const glowStrength = isAudioActive ? fontSize * (0.3 + effectiveAudioLevel * 0.5) : fontSize * 0.3;
        ctx.shadowColor = 'rgba(147, 51, 234, 0.8)';
        ctx.shadowBlur = glowStrength;
        ctx.fillStyle = textGradient;
        
        // テキストをそのまま描画（脈動効果を削除）
        ctx.fillText('CRISTAL', centerX, centerY);
        
        // Remove shadow for other elements
        ctx.shadowBlur = 0;
        
        // Update rotation angle and time
        // 音声アクティブ時は回転速度が音声レベルに対応して変化
        const rotationSpeed = isAudioActive ? 0.006 + effectiveAudioLevel * 0.02 : 0.006;
        angle += rotationSpeed;
        time += 0.016; // Approx 60fps
        
        // Draw dots
        for (const dot of dots) {
          // Apply rotation matrix (Y-axis)
          const cosAngle = Math.cos(angle);
          const sinAngle = Math.sin(angle);
          
          const rotatedX = dot.x * cosAngle - dot.z * sinAngle;
          const rotatedZ = dot.x * sinAngle + dot.z * cosAngle;
          
          // Adjust size and opacity based on Z value
          const scale = (rotatedZ + targetRadius) / (targetRadius * 2);
          
          // Twinkling effect (sine wave brightness variation)
          const twinkleEffect = Math.sin(time * dot.twinkle + dot.twinkleOffset) * 0.3 + 0.7;
          const size = dot.radius * (0.5 + scale) * twinkleEffect;
          const alpha = (0.1 + scale * dot.brightness) * twinkleEffect;
          
          // Use gradient for glowing star
          const exactX = Math.round(centerX + rotatedX);
          const exactY = Math.round(centerY + dot.y);

          // Only draw dots within screen (to maintain perfect circle)
          // 音声モードの場合、球体サイズを音声レベルに応じて変化させる
          const sphereScaleFactor = isAudioActive ? 1 + effectiveAudioLevel * 0.3 : 1;
          const scaledRadius = targetRadius * sphereScaleFactor;
          const distance = Math.sqrt(Math.pow(exactX - centerX, 2) + Math.pow(exactY - centerY, 2));

          if (distance <= scaledRadius) {
            const grd = ctx.createRadialGradient(
              exactX, exactY, 0,
              exactX, exactY, size * 2
            );
            
            // Set gradient color stops - 音声モードでは色の強度を上げる
            // Set gradient color stops
            const baseColor = dot.color.replace(/[^,]+(?=\))/, alpha.toString());
            grd.addColorStop(0, baseColor);
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            // Draw dot
            ctx.beginPath();
            ctx.arc(
              exactX,
              exactY,
              size,
              0, Math.PI * 2
            );
            ctx.fillStyle = baseColor;
            ctx.fill();
            
            // Add glow to bright stars
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
              
              // Add cross-shaped rays to brightest stars
              if (dot.radius > 2.0) {
                const glowSize = size * 3;
                
                // Horizontal ray
                ctx.beginPath();
                ctx.moveTo(exactX - glowSize, exactY);
                ctx.lineTo(exactX + glowSize, exactY);
                ctx.strokeStyle = `rgba(147, 51, 234, ${alpha * 0.3})`;
                ctx.lineWidth = size * 0.5;
                ctx.stroke();
                
                // Vertical ray
                ctx.beginPath();
                ctx.moveTo(exactX, exactY - glowSize);
                ctx.lineTo(exactX, exactY + glowSize);
                ctx.strokeStyle = `rgba(147, 51, 234, ${alpha * 0.3})`;
                ctx.lineWidth = size * 0.5;
                ctx.stroke();
              }
            }
          }
        }
        
        // Add gradient from edge to center
        const outerGlow = ctx.createRadialGradient(
          centerX, centerY, targetRadius * 0.7,
          centerX, centerY, targetRadius
        );
        outerGlow.addColorStop(0, 'rgba(147, 51, 234, 0)');
        outerGlow.addColorStop(1, 'rgba(147, 51, 234, 0.08)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
        
        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      // Start animation
      animate();
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isAudioActive, audioLevel]); // 依存配列を簡素化

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <canvas 
        ref={sphereCanvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default StarrySphere; 