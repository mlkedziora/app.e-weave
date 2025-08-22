// frontend/src/components/common/BlurryOverlayPanel.tsx
import React, { ReactNode, useState, useEffect, useRef } from 'react';

interface BlurryOverlayPanelProps {
  children: ReactNode;
  onClose: () => void;
  draggable?: boolean;
  innerStyle?: React.CSSProperties;
  innerClassName?: string;
}

export default function BlurryOverlayPanel({
  children,
  onClose,
  draggable = false,
  innerStyle = {},
  innerClassName = '',
}: BlurryOverlayPanelProps) {
  const innerRef = useRef(null);
  const [useAbsolute, setUseAbsolute] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  // Easy consts to tweak the drag limits
  const MIN_Y_OFFSET = -40; // Adjust this to change the top limit (positive: lower min Y, negative: allow higher than topbar)
  const MIN_X_OFFSET = 40; // Adjust this to change the left limit (positive: more right, negative: allow left of sidebar)
  const MAX_Y_OFFSET = -90; // Adjust this for bottom limit (positive: allow lower, negative: restrict more)
  const MAX_X_OFFSET = -360; // Adjust this for right limit (positive: allow more right, negative: restrict more)

  useEffect(() => {
    setFadeIn(true);
    if (draggable && innerRef.current) {
      const rect = innerRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      setUseAbsolute(true);
    }
  }, [draggable]);

  useEffect(() => {
    if (dragging && draggable) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [dragging, draggable, rel]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!draggable || e.button !== 0) return;
    setRel({ x: e.clientX - position.x, y: e.clientY - position.y });
    setDragging(true);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = (e: MouseEvent) => {
    setDragging(false);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging || !innerRef.current) return;
    let newX = e.clientX - rel.x;
    let newY = e.clientY - rel.y;
    const sidebarWidth = window.innerWidth * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) / 100) || 0;
    const topbarHeight = document.querySelector('header')?.offsetHeight || 0;
    const width = innerRef.current.offsetWidth;
    const height = innerRef.current.offsetHeight;
    // The top limit is defined here by topbarHeight + MIN_Y_OFFSET
    newX = Math.max(sidebarWidth + MIN_X_OFFSET, Math.min(newX, window.innerWidth - width + MAX_X_OFFSET));
    newY = Math.max(topbarHeight + MIN_Y_OFFSET, Math.min(newY, window.innerHeight - height + MAX_Y_OFFSET));
    setPosition({ x: newX, y: newY });
    e.stopPropagation();
    e.preventDefault();
  };

  const outerClass = `absolute inset-0 backdrop-blur-[3px] z-50 overscroll-none ${useAbsolute || !draggable ? '' : 'flex items-start justify-center'}`;
  const outerStyle = {
    opacity: fadeIn ? 1 : 0,
    transition: 'opacity 200ms ease-in-out',
    isolation: 'isolate',
    willChange: 'filter, opacity',
    backfaceVisibility: 'hidden',
    transform: 'translate3d(0, 0, 0)',
  };
  const combinedInnerStyle = {
    ...(useAbsolute || !draggable ? innerStyle : {}),
    ...(useAbsolute ? { position: 'absolute', left: position.x, top: position.y } : {}),
    // Removed conditional opacity; now always 1 for smoother render (fade handled by outer)
  };
  const combinedInnerClass = `bg-white p-6 rounded-lg shadow-md overflow-y-auto w-11/12 max-w-4xl max-h-[80vh] select-none overscroll-none ${useAbsolute || !draggable ? '' : 'mt-[1px]'} ${innerClassName}`;

  return (
    <div className={outerClass} style={outerStyle} onClick={onClose}>
      <div
        ref={innerRef}
        className={combinedInnerClass}
        style={combinedInnerStyle}
        onMouseDown={onMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}