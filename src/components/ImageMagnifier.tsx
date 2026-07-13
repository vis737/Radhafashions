import React, { useState, useRef } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}

export default function ImageMagnifier({
  src,
  alt,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.2,
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [{ x, y }, setXY] = useState({ x: 0, y: 0 });
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseEnter = () => {
    const elem = imgRef.current;
    if (elem) {
      const { width, height } = elem.getBoundingClientRect();
      setSize([width, height]);
      setShowMagnifier(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const elem = imgRef.current;
    if (elem) {
      const { top, left } = elem.getBoundingClientRect();
      // Calculate cursor position relative to the image
      const xCoord = e.clientX - left - window.scrollX;
      const yCoord = e.clientY - top - window.scrollY;
      setXY({ x: xCoord, y: yCoord });
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div className="relative inline-block w-full h-full select-none justify-center items-center overflow-hidden rounded-2xl border border-gray-100 dark:border-navy-900 bg-gray-50/50 dark:bg-navy-900/40">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-300 cursor-zoom-in"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        referrerPolicy="no-referrer"
      />

      {/* Loupe magnifier box */}
      {showMagnifier && (
        <div
          style={{
            display: '',
            position: 'absolute',
            pointerEvents: 'none',
            // Set size of magnifier lens
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            // Center the lens over the mouse pointer
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: '1',
            border: '2px solid #D4AF37', // Gold ring brand accent
            borderRadius: '50%',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            // Calculate zoomed background size
            backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
            // Calculate position of zoomed background image
            backgroundPosition: `${-x * zoomLevel + magnifierWidth / 2}px ${-y * zoomLevel + magnifierHeight / 2}px`,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)',
            zIndex: 30,
          }}
        />
      )}

      {/* Helpful Hint */}
      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-black/60 dark:bg-navy-950/80 text-[9px] font-mono tracking-wider text-gold-400 select-none backdrop-blur-xs pointer-events-none uppercase">
        Hover to Magnify
      </span>
    </div>
  );
}


