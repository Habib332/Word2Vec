import { useEffect, useRef, useState, useCallback } from "react";
import type { Embeddings, EmbeddingPoint } from "../types/types";

const PADDING = 40;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 40;
const HOVER_RADIUS_PX = 10;
const K_NEAREST = 3;
const MAX_POINTS_FOR_CONNECTIONS = 55000; // grid-based kNN, scales much further than brute-force
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

// ---------------------------------------------------------------------
// Spatial grid over data-space coordinates. Shared by kNN connection
// building AND by pointer hit-testing, so both scale sublinearly with
// the dataset instead of scanning every single point every time.
// ---------------------------------------------------------------------
interface SpatialGrid {
  cellsX: number;
  cellsY: number;
  cellW: number;
  cellH: number;
  xMin: number;
  yMin: number;
  buckets: Map<string, number[]>;
}

function buildSpatialGrid(data: Embeddings): SpatialGrid {
  const n = data.length;
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

  const buckets = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const cx = Math.min(cellsX - 1, Math.max(0, Math.floor((data[i].x - xMin) / cellW)));
    const cy = Math.min(cellsY - 1, Math.max(0, Math.floor((data[i].y - yMin) / cellH)));
    const key = `${cx},${cy}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(i);
  }

  return { cellsX, cellsY, cellW, cellH, xMin, yMin, buckets };
}

function gridCell(grid: SpatialGrid, x: number, y: number) {
  const cx = Math.min(grid.cellsX - 1, Math.max(0, Math.floor((x - grid.xMin) / grid.cellW)));
  const cy = Math.min(grid.cellsY - 1, Math.max(0, Math.floor((y - grid.yMin) / grid.cellH)));
  return { cx, cy };
}

function collectNearbyCandidates(grid: SpatialGrid, cx: number, cy: number, minCandidates: number): number[] {
  let radius = 1;
  let candidates: number[] = [];
  const maxRadius = Math.max(grid.cellsX, grid.cellsY);

  while (candidates.length < minCandidates && radius < maxRadius) {
    candidates = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= grid.cellsX || ny >= grid.cellsY) continue;
        const bucket = grid.buckets.get(`${nx},${ny}`);
        if (bucket) candidates.push(...bucket);
      }
    }
    radius++;
  }

  return candidates;
}

function computeKNNConnections(data: Embeddings, grid: SpatialGrid, k: number): Array<[number, number]> {
  const n = data.length;
  if (n < 2) return [];

  const connections = new Set<string>();
  const neededCandidates = k * 4;

  for (let i = 0; i < n; i++) {
    const { cx, cy } = gridCell(grid, data[i].x, data[i].y);
    const candidates = collectNearbyCandidates(grid, cx, cy, neededCandidates);

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
  const gridRef = useRef<SpatialGrid | null>(null);

  // ms after mount when the pop-in animation is fully finished (nodes AND
  // their trailing connection lines). Precomputed once from the max delay
  // so we never need to re-scan every point just to know "are we still
  // animating in?" — that check used to cost O(n) every single frame.
  const introFinishRef = useRef<number>(0);

  const baseScaleRef = useRef<{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } | null>(null);

  // Offscreen cache of the fully-settled scene (every connection line +
  // every ordinary point, batched into one stroke() and one fill() call).
  // Rebuilt only when the data, pan/zoom, or canvas size actually change —
  // NOT every animation frame — so the perpetual highlight-pulse loop
  // only has to blit a bitmap and paint two small overlays each frame
  // instead of redrawing tens of thousands of shapes 60 times a second.
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticCacheKeyRef = useRef<string>("");
  const lastCanvasSizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 0 });

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

        const delays = new Float32Array(json.map(() => Math.random() * ANIM_STAGGER_WINDOW));
        nodeDelaysRef.current = delays;
        let maxDelay = 0;
        for (let i = 0; i < delays.length; i++) if (delays[i] > maxDelay) maxDelay = delays[i];
        introFinishRef.current = maxDelay + LINE_EXTRA_DELAY + ANIM_DURATION;

        const grid = buildSpatialGrid(json);
        gridRef.current = grid;

        if (json.length <= MAX_POINTS_FOR_CONNECTIONS) {
          connectionsRef.current = computeKNNConnections(json, grid, K_NEAREST);
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

  // Renders the settled scene (batched lines + batched points) into the
  // offscreen cache canvas. Only invoked when it's actually needed.
  const renderStaticLayer = useCallback(
    (rectW: number, rectH: number, dpr: number) => {
      if (!data) return;

      let off = staticCanvasRef.current;
      if (!off) {
        off = document.createElement("canvas");
        staticCanvasRef.current = off;
      }
      const pxW = Math.max(1, Math.round(rectW * dpr));
      const pxH = Math.max(1, Math.round(rectH * dpr));
      if (off.width !== pxW || off.height !== pxH) {
        off.width = pxW;
        off.height = pxH;
      }

      const octx = off.getContext("2d")!;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, rectW, rectH);
      octx.fillStyle = "#0a0a0b";
      octx.fillRect(0, 0, rectW, rectH);

      octx.save();
      octx.translate(transform.x, transform.y);
      octx.scale(transform.k, transform.k);

      // All connection lines in a single path -> a single stroke() call,
      // instead of one stroke() per edge (previously the single biggest
      // cost on dense datasets).
      octx.beginPath();
      for (const [i, j] of connectionsRef.current) {
        const a = dataToCanvas(data[i].x, data[i].y, rectW, rectH);
        const b = dataToCanvas(data[j].x, data[j].y, rectW, rectH);
        octx.moveTo(a.cx, a.cy);
        octx.lineTo(b.cx, b.cy);
      }
      octx.strokeStyle = "rgba(110, 139, 255, 0.22)";
      octx.lineWidth = 1 / transform.k;
      octx.stroke();

      // All ordinary points in a single path -> a single fill() call.
      // The highlighted/hovered point is drawn here too as a plain dot;
      // its special ring/label/enlarged dot is painted as a cheap overlay
      // every frame so hover/highlight changes never force a cache rebuild.
      octx.beginPath();
      const r = 4 / transform.k;
      for (let idx = 0; idx < data.length; idx++) {
        const { cx, cy } = dataToCanvas(data[idx].x, data[idx].y, rectW, rectH);
        octx.moveTo(cx + r, cy);
        octx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      octx.fillStyle = "#8f95a0";
      octx.fill();

      octx.restore();
    },
    [data, transform, dataToCanvas]
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const delays = nodeDelaysRef.current;
      if (!canvas || !container || !data || !delays) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      // Only touch canvas.width/height when the size actually changed.
      // Assigning them — even to the same value — resets the whole
      // canvas bitmap and its context state, which was previously
      // happening on every single animation frame regardless of resize.
      const sizeChanged =
        lastCanvasSizeRef.current.w !== rect.width ||
        lastCanvasSizeRef.current.h !== rect.height ||
        lastCanvasSizeRef.current.dpr !== dpr;

      if (sizeChanged) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        lastCanvasSizeRef.current = { w: rect.width, h: rect.height, dpr };
      }

      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const elapsedSinceMount = now - mountTimeRef.current;
      const introActive = elapsedSinceMount < introFinishRef.current;

      if (introActive) {
        // Pop-in phase: per-point scale/opacity, drawn straight to the
        // visible canvas. This lasts well under two seconds total, so
        // its per-point cost is a one-time cost rather than an ongoing one.
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = "#0a0a0b";
        ctx.fillRect(0, 0, rect.width, rect.height);

        const nodeScale = (idx: number) => {
          const t = (elapsedSinceMount - delays[idx]) / ANIM_DURATION;
          const clamped = Math.min(Math.max(t, 0), 1);
          return t <= 0 ? 0 : easeOutBack(clamped);
        };
        const nodeOpacity = (idx: number) => {
          const t = (elapsedSinceMount - delays[idx]) / (ANIM_DURATION * 0.5);
          return Math.min(Math.max(t, 0), 1);
        };

        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // Batched into one path/stroke even mid-animation: every line
        // shares the same strokeStyle, only endpoints differ per-frame.
        ctx.beginPath();
        for (const [i, j] of connectionsRef.current) {
          const startAfter = Math.max(delays[i], delays[j]) + LINE_EXTRA_DELAY;
          const lineT = (elapsedSinceMount - startAfter) / ANIM_DURATION;
          const lineProgress = easeOutCubic(Math.min(Math.max(lineT, 0), 1));
          if (lineProgress <= 0) continue;
          const a = dataToCanvas(data[i].x, data[i].y, rect.width, rect.height);
          const b = dataToCanvas(data[j].x, data[j].y, rect.width, rect.height);
          ctx.moveTo(a.cx, a.cy);
          ctx.lineTo(a.cx + (b.cx - a.cx) * lineProgress, a.cy + (b.cy - a.cy) * lineProgress);
        }
        ctx.strokeStyle = "rgba(110, 139, 255, 0.22)";
        ctx.lineWidth = 1 / transform.k;
        ctx.stroke();

        for (let idx = 0; idx < data.length; idx++) {
          const point = data[idx];
          const scale = nodeScale(idx);
          const opacity = nodeOpacity(idx);
          if (scale <= 0 && opacity <= 0) continue;

          const { cx, cy } = dataToCanvas(point.x, point.y, rect.width, rect.height);
          const isHighlighted = point.word === highlightedWord;
          const isHovered = hoveredPoint?.word === point.word;

          const baseR = isHighlighted ? 7 : isHovered ? 6 : 4;
          const r = (baseR * Math.max(scale, 0)) / transform.k;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.globalAlpha = opacity;
          ctx.fillStyle = isHighlighted ? "#f0a35f" : isHovered ? "#edf0f4" : "#8f95a0";
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      } else {
        // Settled phase: blit the cached static bitmap (rebuilt only
        // when pan/zoom/size/data actually changed) instead of redrawing
        // every line and point from scratch.
        const cacheKey = `${transform.x.toFixed(1)},${transform.y.toFixed(1)},${transform.k.toFixed(4)},${rect.width},${rect.height},${dpr}`;
        if (cacheKey !== staticCacheKeyRef.current || !staticCanvasRef.current) {
          renderStaticLayer(rect.width, rect.height, dpr);
          staticCacheKeyRef.current = cacheKey;
        }

        ctx.clearRect(0, 0, rect.width, rect.height);
        const off = staticCanvasRef.current;
        if (off) {
          ctx.drawImage(off, 0, 0, off.width, off.height, 0, 0, rect.width, rect.height);
        }

        // Overlays drawn every frame regardless of the cache: the pulse
        // ring, the highlighted dot + label, and the hovered dot. This is
        // O(1) work — at most two special points — not O(n).
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        if (highlightedWord) {
          const match = data.find((d) => d.word === highlightedWord);
          if (match) {
            const { cx, cy } = dataToCanvas(match.x, match.y, rect.width, rect.height);
            const elapsed = (now - pulseStartRef.current) / 1000;
            const pulsePhase = (elapsed % 1.4) / 1.4;
            const pulseRadius = (6 + pulsePhase * 14) / transform.k;
            const pulseOpacity = 0.4 * (1 - pulsePhase);

            ctx.beginPath();
            ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(240, 163, 95, ${pulseOpacity})`;
            ctx.lineWidth = 1.5 / transform.k;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, 7 / transform.k, 0, Math.PI * 2);
            ctx.fillStyle = "#f0a35f";
            ctx.fill();

            ctx.font = `500 ${12 / transform.k}px -apple-system, sans-serif`;
            ctx.fillStyle = "#edf0f4";
            ctx.fillText(match.word, cx + 8 / transform.k, cy + 4 / transform.k);
          }
        }

        if (hoveredPoint && hoveredPoint.word !== highlightedWord) {
          const { cx, cy } = dataToCanvas(hoveredPoint.x, hoveredPoint.y, rect.width, rect.height);
          ctx.beginPath();
          ctx.arc(cx, cy, 6 / transform.k, 0, Math.PI * 2);
          ctx.fillStyle = "#edf0f4";
          ctx.fill();
        }

        ctx.restore();
      }

      if (introActive || highlightedWord) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    },
    [data, transform, highlightedWord, hoveredPoint, dataToCanvas, renderStaticLayer]
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
      <div style={{ color: "var(--danger)", padding: 16, fontSize: 14, fontFamily: "var(--font-body)" }}>
        Error loading embeddings: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ color: "var(--text-muted)", padding: 16, fontFamily: "var(--font-body)", fontSize: 13.5 }}>
        Loading embeddings…
      </div>
    );
  }

  // Hit-testing now goes through the same spatial grid used to build the
  // kNN connections, so a mousemove only checks a handful of nearby
  // candidates instead of scanning every point in the dataset.
  const findNearestPoint = (clientX: number, clientY: number): EmbeddingPoint | null => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const canvasX = (screenX - transform.x) / transform.k;
    const canvasY = (screenY - transform.y) / transform.k;

    const grid = gridRef.current;
    const s = baseScaleRef.current;
    if (!grid || !s) return null;

    // Invert dataToCanvas to land back in data-space, so we can look up
    // the right grid cell.
    const px = s.xMin + ((canvasX - PADDING) / (rect.width - 2 * PADDING)) * (s.xMax - s.xMin);
    const py = s.yMin + ((canvasY - PADDING) / (rect.height - 2 * PADDING)) * (s.yMax - s.yMin);

    const { cx: gx, cy: gy } = gridCell(grid, px, py);
    const candidates = collectNearbyCandidates(grid, gx, gy, 8);

    let nearest: EmbeddingPoint | null = null;
    let nearestDistSq = Infinity;
    const thresholdSq = (HOVER_RADIUS_PX / transform.k) ** 2;

    for (const i of candidates) {
      const point = data[i];
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
            padding: "5px 9px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-sm)",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          {hoveredPoint.word}
        </div>
      )}
      {connectionCount === 0 && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.01em",
            color: "var(--text-muted)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "5px 10px",
          }}
        >
          No connections drawn (dataset too large or too small)
        </div>
      )}
    </div>
  );
}