import { useEffect, useRef, useState, useCallback } from "react";
import type { Embeddings, EmbeddingPoint } from "../types/types";

const PADDING = 40;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 40;
const HOVER_RADIUS_PX = 10;
const K_NEAREST = 3;
const MAX_POINTS_FOR_CONNECTIONS = 30000; // grid-based kNN, scales much further than brute-force
const ANIM_DURATION = 650; // ms, per-node pop-in
const ANIM_STAGGER_WINDOW = 900; // ms, spread of random start delays
const LINE_EXTRA_DELAY = 150; // ms, lines appear slightly after their nodes

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

// Overshoots past 1 before settling back to 1 -> reads as a "pop" rather than a plain fade-in
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Grid-based approximate k-nearest-neighbors: buckets points spatially so each
// point only checks nearby cells instead of every other point. O(n) average
// case instead of brute force's O(n^2), so it scales to real-corpus sizes.
function computeKNNConnections(data: Embeddings, k: number): Array<[number, number]> {
  const n = data.length;
  if (n < 2) return [];

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const width = Math.max(xMax - xMin, 1e-9);
  const height = Math.max(yMax - yMin, 1e-9);

  // aim for roughly 4 points per cell on average
  const targetCells = Math.max(1, n / 4);
  const aspect = width / height;
  const cellsY = Math.max(1, Math.round(Math.sqrt(targetCells / aspect)));
  const cellsX = Math.max(1, Math.round(targetCells / cellsY));
  const cellW = width / cellsX;
  const cellH = height / cellsY;

  const cellOf = (i: number) => {
    const cx = Math.min(cellsX - 1, Math.floor((data[i].x - xMin) / cellW));
    const cy = Math.min(cellsY - 1, Math.floor((data[i].y - yMin) / cellH));
    return { cx, cy };
  };

  const grid = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const { cx, cy } = cellOf(i);
    const key = `${cx},${cy}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(i);
  }

  const connections = new Set<string>();
  const neededCandidates = k * 4;

  for (let i = 0; i < n; i++) {
    const { cx, cy } = cellOf(i);
    let radius = 1;
    let candidates: number[] = [];

    while (candidates.length < neededCandidates && radius < Math.max(cellsX, cellsY)) {
      candidates = [];
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cellsX || ny >= cellsY) continue;
          const bucket = grid.get(`${nx},${ny}`);
          if (bucket) candidates.push(...bucket);
        }
      }
      radius++;
    }

    const dists = candidates
      .filter((j) => j !== i)
      .map((j) => {
        const dx = data[i].x - data[j].x;
        const dy = data[i].y - data[j].y;
        return { j, d: dx * dx + dy * dy };
      })
      .sort((a, b) => a.d - b.d);

    for (let m = 0; m < Math.min(k, dists.length); m++) {
      const j = dists[m].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      connections.add(key);
    }
  }

  return Array.from(connections).map((key) => {
    const [a, b] = key.split("-").map(Number);
    return [a, b] as [number, number];
  });
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
  const [connectionCount, setConnectionCount] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const pulseStartRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);
  const nodeDelaysRef = useRef<Float32Array | null>(null);
  const connectionsRef = useRef<Array<[number, number]>>([]);

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

        nodeDelaysRef.current = new Float32Array(
          json.map(() => Math.random() * ANIM_STAGGER_WINDOW)
        );

        if (json.length <= MAX_POINTS_FOR_CONNECTIONS) {
          connectionsRef.current = computeKNNConnections(json, K_NEAREST);
        } else {
          console.warn(
            `Skipping nearest-neighbor connections: ${json.length} points exceeds the ${MAX_POINTS_FOR_CONNECTIONS} cap.`
          );
          connectionsRef.current = [];
        }
        setConnectionCount(connectionsRef.current.length);

        mountTimeRef.current = performance.now();
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
      const delays = nodeDelaysRef.current;
      if (!canvas || !container || !data || !delays) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "#0a0a0b";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const elapsedSinceMount = now - mountTimeRef.current;
      let stillAnimatingIn = false;

      // scale factor for node radius (can overshoot past 1 briefly -> the "pop")
      const nodeScale = (idx: number) => {
        const t = (elapsedSinceMount - delays[idx]) / ANIM_DURATION;
        if (t < 1) stillAnimatingIn = true;
        const clamped = Math.min(Math.max(t, 0), 1);
        return t <= 0 ? 0 : easeOutBack(clamped);
      };

      // separate 0-1 opacity ramp (no overshoot for alpha, only for size)
      const nodeOpacity = (idx: number) => {
        const t = (elapsedSinceMount - delays[idx]) / (ANIM_DURATION * 0.5);
        return Math.min(Math.max(t, 0), 1);
      };

      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      for (const [i, j] of connectionsRef.current) {
        const startAfter = Math.max(delays[i], delays[j]) + LINE_EXTRA_DELAY;
        const lineT = (elapsedSinceMount - startAfter) / ANIM_DURATION;
        if (lineT < 1) stillAnimatingIn = true;
        const lineProgress = easeOutCubic(Math.min(Math.max(lineT, 0), 1));
        if (lineProgress <= 0) continue;

        const a = dataToCanvas(data[i].x, data[i].y, rect.width, rect.height);
        const b = dataToCanvas(data[j].x, data[j].y, rect.width, rect.height);
        const endX = a.cx + (b.cx - a.cx) * lineProgress;
        const endY = a.cy + (b.cy - a.cy) * lineProgress;

        ctx.beginPath();
        ctx.moveTo(a.cx, a.cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "rgba(234, 200, 60, 0.25)";
        ctx.lineWidth = 1 / transform.k;
        ctx.stroke();
      }

      for (let idx = 0; idx < data.length; idx++) {
        const point = data[idx];
        const scale = nodeScale(idx);
        const opacity = nodeOpacity(idx);
        if (scale <= 0 && opacity <= 0) continue;

        const { cx, cy } = dataToCanvas(point.x, point.y, rect.width, rect.height);
        const isHighlighted = point.word === highlightedWord;
        const isHovered = hoveredPoint?.word === point.word;

        if (isHighlighted) {
          const elapsed = (now - pulseStartRef.current) / 1000;
          const pulsePhase = (elapsed % 1.4) / 1.4;
          const pulseRadius = (6 + pulsePhase * 14) / transform.k;
          const pulseOpacity = 0.4 * (1 - pulsePhase);
          ctx.beginPath();
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(217, 136, 79, ${pulseOpacity})`;
          ctx.lineWidth = 1.5 / transform.k;
          ctx.stroke();
        }

        const baseR = isHighlighted ? 7 : isHovered ? 6 : 4;
        const r = (baseR * Math.max(scale, 0)) / transform.k;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = isHighlighted ? "#d9884f" : isHovered ? "#ffffff" : "#b8b8bf";
        ctx.fill();
        ctx.globalAlpha = 1;

        if (isHighlighted) {
          ctx.font = `500 ${12 / transform.k}px -apple-system, sans-serif`;
          ctx.fillStyle = "#e8e8ea";
          ctx.fillText(point.word, cx + 8 / transform.k, cy + 4 / transform.k);
        }
      }

      ctx.restore();

      if (stillAnimatingIn || highlightedWord) {
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
    if (nearest) {
      animationFrameRef.current ??= requestAnimationFrame(draw);
    }
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
      {connectionCount === 0 && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 11,
            color: "var(--text-muted)",
            background: "var(--bg-panel-alt)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 4,
            padding: "4px 8px",
          }}
        >
          No connections drawn (dataset too large or too small)
        </div>
      )}
    </div>
  );
}