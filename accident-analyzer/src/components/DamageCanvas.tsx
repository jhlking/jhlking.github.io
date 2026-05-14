import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Pencil, Eraser, Undo, Redo, Trash2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAccidentStore } from '../stores/accidentStore';
import { DamageArea, DamageType, Point, DAMAGE_COLORS, DAMAGE_LABELS } from '../types';
import { calculatePolygonArea, pixelsToRealArea, generateId } from '../utils/areaCalculator';

type Tool = 'brush' | 'eraser';

const DamageCanvas: React.FC = () => {
  const {
    currentImage,
    damages,
    selectedDamageType,
    addDamage,
    removeDamage,
    clearDamages,
    setSelectedDamageType,
    images,
    currentImageIndex
  } = useAccidentStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [history, setHistory] = useState<DamageArea[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const imageKey = `${currentImageIndex}-${currentImage}`;

  useEffect(() => {
    if (currentImage) {
      const img = new Image();
      img.onload = () => {
        setImgElement(img);
        setImageLoaded(true);
      };
      img.src = currentImage;
    } else {
      setImageLoaded(false);
      setImgElement(null);
    }
  }, [currentImage, imageKey]);

  useEffect(() => {
    if (imageLoaded && imgElement && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const maxWidth = containerRef.current?.clientWidth || 800;
      const scale = Math.min(1, maxWidth / imgElement.width);
      const width = imgElement.width * scale;
      const height = imgElement.height * scale;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      drawCanvas(ctx, imgElement, scale);
    }
  }, [imageLoaded, imgElement, damages, currentPoints, zoom, offset, imageKey]);

  const drawCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    scale: number
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

    damages.forEach(damage => {
      if (damage.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(damage.points[0].x, damage.points[0].y);
        damage.points.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = damage.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.fillStyle = damage.color + '30';
        ctx.fill();
      }
    });

    if (currentPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = DAMAGE_COLORS[selectedDamageType];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
  }, [damages, currentPoints, selectedDamageType, zoom, offset]);

  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX - offset.x / zoom,
      y: (clientY - rect.top) * scaleY - offset.y / zoom
    };
  }, [zoom, offset]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!imageLoaded || tool === 'eraser') return;

    if ('button' in e && e.button !== 0) return;

    const point = getCanvasCoords(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentPoints([point]);
  }, [imageLoaded, tool, getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === 'eraser') return;

    const point = getCanvasCoords(e);
    if (!point) return;

    setCurrentPoints(prev => [...prev, point]);
  }, [isDrawing, tool, getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || currentPoints.length < 3) {
      setIsDrawing(false);
      setCurrentPoints([]);
      return;
    }

    const pixelArea = calculatePolygonArea(currentPoints);
    const canvasWidth = canvasRef.current?.width || 1;
    const realArea = pixelsToRealArea(pixelArea, canvasWidth);

    const newDamage: DamageArea = {
      id: generateId(),
      type: selectedDamageType,
      points: currentPoints,
      color: DAMAGE_COLORS[selectedDamageType],
      pixelArea,
      realArea: Math.round(realArea * 100) / 100,
      severity: 1,
      estimatedCost: 0
    };

    addDamage(newDamage);
    saveToHistory([...damages, newDamage]);

    setIsDrawing(false);
    setCurrentPoints([]);
  }, [isDrawing, currentPoints, selectedDamageType, damages, addDamage]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(3, Math.max(0.5, prev * delta)));
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'eraser' || e.button !== 0) return;
    const point = getCanvasCoords(e);
    if (!point) return;

    const clickedDamage = damages.find(damage => {
      return damage.points.some(p =>
        Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10
      );
    });

    if (clickedDamage) {
      removeDamage(clickedDamage.id);
    }
  }, [tool, damages, getCanvasCoords, removeDamage]);

  const saveToHistory = useCallback((newDamages: DamageArea[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDamages);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevDamages = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      clearDamages();
      prevDamages.forEach(d => addDamage(d));
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      clearDamages();
    }
  }, [history, historyIndex, clearDamages, addDamage]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextDamages = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      clearDamages();
      nextDamages.forEach(d => addDamage(d));
    }
  }, [history, historyIndex, clearDamages, addDamage]);

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (tool === 'eraser') {
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  }, [tool]);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPanPos.x;
    const dy = e.clientY - lastPanPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPanPos({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPanPos]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  if (!currentImage) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(DAMAGE_COLORS) as DamageType[]).map(type => (
          <motion.button
            key={type}
            onClick={() => setSelectedDamageType(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${selectedDamageType === type
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                : 'opacity-70 hover:opacity-100'
              }
            `}
            style={{ backgroundColor: DAMAGE_COLORS[type] + '30', color: DAMAGE_COLORS[type] }}
          >
            {DAMAGE_LABELS[type]}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setTool('brush')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              p-2 rounded-lg transition-colors
              ${tool === 'brush' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
          >
            <Pencil className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => setTool('eraser')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              p-2 rounded-lg transition-colors
              ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
          >
            <Move className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleUndo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={historyIndex < 0}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={handleRedo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Redo className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={clearDamages}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="w-px h-6 bg-slate-600 mx-1" />

        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="ml-auto text-sm text-slate-400">
          缩放: {Math.round(zoom * 100)}%
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700"
        style={{ cursor: tool === 'eraser' ? 'grab' : 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={tool === 'brush' ? handleMouseDown : handleCanvasMouseDown}
          onMouseMove={tool === 'brush' ? handleMouseMove : handlePanMove}
          onMouseUp={() => {
            handleMouseUp();
            handlePanEnd();
          }}
          onMouseLeave={() => {
            handleMouseUp();
            handlePanEnd();
          }}
          onTouchStart={tool === 'brush' ? handleMouseDown : undefined}
          onTouchMove={tool === 'brush' ? handleMouseMove : undefined}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          className="block touch-none"
        />

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center">
        {tool === 'brush'
          ? '使用画笔在损伤区域绘制 · 点击已有标记可删除'
          : '拖动平移视图 · 点击标记可删除'
        }
      </p>
    </div>
  );
};

export default DamageCanvas;
