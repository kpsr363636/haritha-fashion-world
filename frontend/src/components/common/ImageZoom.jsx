import { useState, useRef, useCallback } from 'react';

/**
 * Hover-to-zoom image component with a magnifier lens effect.
 * Renders the full image and, on hover, shows an enlarged sub-region
 * tracking the cursor position.
 */
export default function ImageZoom({ src, alt, className = '', zoomLevel = 2.5 }) {
  const containerRef = useRef(null);
  const [showLens, setShowLens] = useState(false);
  const [lensStyle, setLensStyle] = useState({});
  const [previewStyle, setPreviewStyle] = useState({});

  const LENS_SIZE = 120; // px

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp so the lens doesn't go outside the image
    x = Math.max(LENS_SIZE / 2, Math.min(x, rect.width - LENS_SIZE / 2));
    y = Math.max(LENS_SIZE / 2, Math.min(y, rect.height - LENS_SIZE / 2));

    const bgX = ((x - LENS_SIZE / 2) / rect.width) * 100;
    const bgY = ((y - LENS_SIZE / 2) / rect.height) * 100;

    setLensStyle({
      left: x - LENS_SIZE / 2,
      top: y - LENS_SIZE / 2,
      width: LENS_SIZE,
      height: LENS_SIZE,
    });

    setPreviewStyle({
      backgroundImage: `url('${src}')`,
      backgroundSize: `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`,
      backgroundPosition: `-${(x - LENS_SIZE / 2) * zoomLevel}px -${(y - LENS_SIZE / 2) * zoomLevel}px`,
    });
  }, [src, zoomLevel]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair select-none ${className}`}
      onMouseEnter={() => setShowLens(true)}
      onMouseLeave={() => setShowLens(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />

      {/* Lens circle */}
      {showLens && (
        <div
          className="absolute rounded-full border-2 border-brand-500 shadow-lg pointer-events-none z-10 overflow-hidden"
          style={{ ...lensStyle, position: 'absolute' }}
        >
          <div className="w-full h-full" style={previewStyle} />
        </div>
      )}

      {/* Zoom hint badge */}
      {!showLens && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          🔍 Hover to zoom
        </div>
      )}
    </div>
  );
}
