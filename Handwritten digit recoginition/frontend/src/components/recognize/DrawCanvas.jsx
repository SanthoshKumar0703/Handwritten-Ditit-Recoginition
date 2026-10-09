import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Undo2, Redo2, Eraser } from "lucide-react";

const CANVAS_SIZE = 320;
const STROKE_WIDTH = 20;
const MAX_HISTORY = 25;

const DrawCanvas = forwardRef(function DrawCanvas({ onChange }, ref) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const getCtx = () => canvasRef.current.getContext("2d");

  const fillBackground = (ctx) => {
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = getCtx();
    fillBackground(ctx);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#F5F5F7";
    ctx.lineWidth = STROKE_WIDTH;
    pushHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushHistory() {
    const ctx = getCtx();
    const snapshot = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    redoRef.current = [];
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(false);
  }

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e) {
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPoint(e);
    setIsEmpty(false);
    onChange?.();
  }

  function handlePointerMove(e) {
    if (!drawing.current) return;
    const ctx = getCtx();
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    pushHistory();
  }

  function clear() {
    const ctx = getCtx();
    fillBackground(ctx);
    setIsEmpty(true);
    pushHistory();
    onChange?.();
  }

  function undo() {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    redoRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    getCtx().putImageData(prev, 0, 0);
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(true);
    onChange?.();
  }

  function redo() {
    if (redoRef.current.length === 0) return;
    const next = redoRef.current.pop();
    historyRef.current.push(next);
    getCtx().putImageData(next, 0, 0);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    onChange?.();
  }

  useImperativeHandle(ref, () => ({
    isEmpty: () => isEmpty,
    toDataURL: () => canvasRef.current.toDataURL("image/png"),
    clear,
  }));

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-border bg-[#0a0a12] touch-none">
        <canvas
          ref={canvasRef}
          className="w-full aspect-square cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-muted text-sm font-mono">draw a digit here</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 size={13} /> Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs text-muted hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 size={13} /> Redo
        </button>
        <button
          onClick={clear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs text-muted hover:text-red-300 transition-colors ml-auto"
        >
          <Eraser size={13} /> Clear
        </button>
      </div>
    </div>
  );
});

export default DrawCanvas;
