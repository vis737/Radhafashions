import React, { useState, useRef, useCallback, useEffect } from 'react';
import { handleImageError } from '../utils/imageUtils';

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImageMagnifier({ src, alt = '', className = '' }: ImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, [src]);

  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    if (!container) return { x, y };
    const rect = container.getBoundingClientRect();
    const maxX = (rect.width * (currentScale - 1)) / 2;
    const maxY = (rect.height * (currentScale - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Mouse wheel zoom (desktop)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale(prev => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta));
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      } else {
        setIsZoomed(true);
      }
      return next;
    });
  }, []);

  // Double-tap to zoom toggle (mobile)
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      } else {
        setScale(2.2);
        setIsZoomed(true);
      }
    }
    lastTapRef.current = now;
  }, [scale]);

  // Touch pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setLastPinchDistance(Math.sqrt(dx * dx + dy * dy));
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Pinch zoom
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = (distance - lastPinchDistance) * 0.01;
      setLastPinchDistance(distance);

      setScale(prev => {
        const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta));
        if (next <= 1) {
          setPosition({ x: 0, y: 0 });
          setIsZoomed(false);
        } else {
          setIsZoomed(true);
        }
        return next;
      });
    }
    // Single-finger drag when zoomed
    else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition(clampPosition(newX, newY, scale));
    }
  }, [lastPinchDistance, isDragging, scale, dragStart, clampPosition]);

  const handleTouchEnd = useCallback(() => {
    setLastPinchDistance(null);
    setIsDragging(false);
  }, []);

  // Mouse drag when zoomed (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition(clampPosition(newX, newY, scale));
    }
  }, [isDragging, scale, dragStart, clampPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'} ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
      style={{ touchAction: 'none' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={(e) => handleImageError(e, '')}
        className="w-full h-full object-cover transition-transform duration-200 ease-out"
        draggable={false}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
        }}
      />

      {/* Zoom indicator */}
      {scale > 1 && (
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px] font-mono pointer-events-none">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Drag hint on first load (mobile only) */}
      {scale === 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-[10px] font-mono pointer-events-none opacity-0 animate-[fadeInOut_3s_ease-in-out_1s_forwards] sm:hidden">
          Pinch or double-tap to zoom
        </div>
      )}
    </div>
  );
}
