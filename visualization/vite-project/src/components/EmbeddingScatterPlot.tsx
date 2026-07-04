import { useEffect, useRef, useState, useCallback } from "react";
import type { Embeddings, EmbeddingPoint } from "../types/types";

const PADDING = 40;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 40;
const HOVER_RADIUS_PX = 10;
const GRID_SPACING = 28; // px, dot-grid texture

export interface Transform {
  x: number;
  y: number;
  k: number;
}

interface Props {
  searchTerm: string;
  transform: Transform;
  onTransformChange: (t: Transform) => void;
  onPointCountChange?: (count: number) => void;
  onCursorDataChange?: (pos: { x: number; y: number } | null) => void;
}

export function EmbeddingScatterPlot({
  searchTerm,
  transform,
  onTransformChange,
  onPointCountChange,
  onCursorDataChange,
}: Props) {
  const [data, setData] = useState<Embeddings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<EmbeddingPoint | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const pulseStartRef = useRef<number>(0);

  const baseScaleRef = useRef<{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } | null>(null);

  useEffect(() => {
    fetch("/embeddings_2d.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Could not load embeddings (status ${res.status})`);
        }
        return res.json();
      })
      .then((json: Embeddings) => {
        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("embeddings_2d.json is empty or malformed");
        }
        const xs = json.map((d) => d.x);
        const ys = json.map((d) => d.y);
        baseScaleRef.current = {
          xMin: Math.min(...xs),
          xMax: Math.max(...xs),
          yMin: Math.min(...ys),
          yMax: Math.max(...ys),
        };
        setData(json);
        onPointCountChange?.(json.length);
      })
      .catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataToCanvas = useCallback(
    (px: number, py: number, width: number, height: number) => {
      const s = baseScaleRef.current!;
      const cx =
        PADDING + ((px - s.xMin) / (s.xMax - s.xMin)) * (width - 2 * PADDING);
      const cy =
        PADDING + ((py - s.yMin) / (s.yMax - s.yMin)) * (height - 2 * PADDING);
      return { cx, cy };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!data || !canvas || !searchTerm.trim()) {
      setHighlightedWord(null);
      return;
    }
    const match = data.find(
      (d) => d.word.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (!match) {
      setHighlightedWord(null);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const { cx, cy } = dataToCanvas(match.x, match.y, rect.width, rect.height);
    const targetK = 6;
    onTransformChange({
      k: targetK,
      x: rect.width / 2 - cx * targetK,
      y: rect.height / 2 - cy * targetK,
    });
    setHighlightedWord(match.word);
    pulseStartRef.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, data]);

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || !data) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "#0a0e17";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // dot-grid texture, screen-space, subtle
      ctx.fillStyle = "rgba(230, 235, 245, 0.035)";
      for (let gx = 0; gx < rect.width; gx += GRID_SPACING) {
        for (let gy = 0; gy < rect.height; gy += GRID_SPACING) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      for (const point of data) {
        const { cx, cy } = dataToCanvas(point.x, point.y, rect.width, rect.height);
        const isHighlighted = point.word === highlightedWord;
        const isHovered = hoveredPoint?.word === point.word;

        if (isHighlighted) {
          const elapsed = (now - pulseStartRef.current) / 1000;
          const pulsePhase = (elapsed % 1.4) / 1.4; // 1.4s loop
          const pulseRadius = (6 + pulsePhase * 14) / transform.k;
          const pulseOpacity = 0.5 * (1 - pulsePhase);
          ctx.beginPath();
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34, 211, 238, ${pulseOpacity})`;
          ctx.lineWidth = 1.5 / transform.k;
          ctx.stroke();
        }

        ctx.beginPath();
        const r = isHighlighted ? 7 / transform.k : isHovered ? 6 / transform.k : 4 / transform.k;
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? "#22d3ee" : isHovered ? "#f0b756" : "#3d6f9e";
        ctx.fill();

        if (isHighlighted) {
          ctx.font = `500 ${12 / transform.k}px "JetBrains Mono", monospace`;
          ctx.fillStyle = "#e6ebf5";
          ctx.fillText(point.word, cx + 8 / transform.k, cy + 4 / transform.k);
        }
      }

      ctx.restore();

      if (highlightedWord) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    },
    [data, transform, highlightedWord, hoveredPoint, dataToCanvas]
  );

  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draw]);

  if (error) {
    return (
      <div style={{ color: "#ef4444", padding: 16, fontSize: 14 }}>
        Error loading embeddings: {error}
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: "var(--text-muted)", padding: 16 }}>Loading embeddings...</div>;
  }

  const findNearestPoint = (clientX: number, clientY: number): EmbeddingPoint | null => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const canvasX = (screenX - transform.x) / transform.k;
    const canvasY = (screenY - transform.y) / transform.k;

    let nearest: EmbeddingPoint | null = null;
    let nearestDistSq = Infinity;
    const thresholdSq = (HOVER_RADIUS_PX / transform.k) ** 2;

    for (const point of data!) {
      const { cx, cy } = dataToCanvas(point.x, point.y, rect.width, rect.height);
      const dx = cx - canvasX;
      const dy = cy - canvasY;
      const distSq = dx * dx + dy * dy;
      if (distSq < thresholdSq && distSq < nearestDistSq) {
        nearest = point;
        nearestDistSq = distSq;
      }
    }
    return nearest;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newK = Math.min(Math.max(transform.k * zoomFactor, MIN_ZOOM), MAX_ZOOM);
    const dataX = (px - transform.x) / transform.k;
    const dataY = (py - transform.y) / transform.k;
    onTransformChange({
      k: newK,
      x: px - dataX * newK,
      y: py - dataY * newK,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const dataX = (screenX - transform.x) / transform.k;
    const dataY = (screenY - transform.y) / transform.k;
    onCursorDataChange?.({ x: dataX, y: dataY });

    if (isPanning.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      onTransformChange({ ...transform, x: transform.x + dx, y: transform.y + dy });
      return;
    }

    const nearest = findNearestPoint(e.clientX, e.clientY);
    setHoveredPoint(nearest);
    setHoverScreenPos(nearest ? { x: screenX, y: screenY } : null);
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  const handleMouseLeave = () => {
    isPanning.current = false;
    onCursorDataChange?.(null);
    setHoveredPoint(null);
    setHoverScreenPos(null);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: "grab", borderRadius: 8, width: "100%", height: "100%" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {hoveredPoint && hoverScreenPos && (
        <div
          className="data-mono"
          style={{
            position: "absolute",
            left: hoverScreenPos.x + 12,
            top: hoverScreenPos.y - 10,
            padding: "4px 8px",
            background: "var(--bg-panel-alt)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 4,
            fontSize: 12,
            color: "var(--text-primary)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredPoint.word}
        </div>
      )}
    </div>
  );
}