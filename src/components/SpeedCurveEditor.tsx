import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { KeyFrame } from '@/types/device';

interface SpeedCurveEditorProps {
  keyframes: KeyFrame[];
  onChange: (kfs: KeyFrame[]) => void;
  durationMs: number;
  baseSpeed: number;
  elapsedMs?: number;
}

const CANVAS_W  = 600;
const CANVAS_H  = 200;
const PAD       = { top: 16, right: 16, bottom: 32, left: 48 };
const MAX_SPEED = 500;
const POINT_R   = 7;
const RIGHT_EDGE = CANVAS_W - PAD.right;
const PLOT_W    = CANVAS_W - PAD.left - PAD.right;
const PLOT_H    = CANVAS_H - PAD.top  - PAD.bottom;

const C_PRIMARY     = 'var(--primary)';
const C_MUTED_FG    = 'var(--muted-foreground)';
const C_DESTRUCTIVE = 'var(--destructive)';

function toSvgX(tMs: number, dur: number) {
  return PAD.left + (tMs / Math.max(dur, 1)) * PLOT_W;
}
function toSvgY(speed: number) {
  return PAD.top + PLOT_H * (1 - Math.min(Math.max(speed, 0), MAX_SPEED) / MAX_SPEED);
}
function fromSvgX(svgX: number, dur: number) {
  return Math.round(((svgX - PAD.left) / PLOT_W) * dur);
}
function fromSvgY(svgY: number) {
  return Math.max(0, Math.min(MAX_SPEED, ((PAD.top + PLOT_H - svgY) / PLOT_H) * MAX_SPEED));
}
function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const SpeedCurveEditor: React.FC<SpeedCurveEditorProps> = ({
  keyframes,
  onChange,
  durationMs,
  baseSpeed,
  elapsedMs,
}) => {
  const [local, setLocal]       = useState<KeyFrame[]>(keyframes);
  const [selected, setSelected] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [addMode, setAddMode]   = useState<{ tMs: number; svgX: number; svgY: number } | null>(null);
  const [addSpeed, setAddSpeed] = useState('');
  // Edit fields for the selected keyframe
  const [editT, setEditT]       = useState('');   // seconds
  const [editSpd, setEditSpd]   = useState('');   // RPM

  const svgRef        = useRef<SVGSVGElement>(null);
  const draggingIdx   = useRef<number | null>(null);
  const durRef        = useRef(durationMs);

  // Keep durRef current so window handlers never see stale durationMs
  useEffect(() => { durRef.current = durationMs; }, [durationMs]);

  // Sync from props when not dragging (e.g. parent reset on start/stop)
  useEffect(() => {
    if (draggingIdx.current === null) {
      setLocal(keyframes);
      setSelected(null);
    }
  }, [keyframes]);

  // Populate edit fields whenever selection changes
  const populateEdit = useCallback((kfs: KeyFrame[], idx: number) => {
    setEditT((kfs[idx].t_ms / 1000).toFixed(1));
    setEditSpd(kfs[idx].speed.toFixed(0));
  }, []);

  // ── Global mouse handlers for drag ──────────────────────────────────────
  useEffect(() => {
    const getXY = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const r = svg.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (CANVAS_W / r.width),
        y: (e.clientY - r.top)  * (CANVAS_H / r.height),
      };
    };

    const onMove = (e: MouseEvent) => {
      const idx = draggingIdx.current;
      if (idx === null) return;
      const { x, y } = getXY(e);
      const dur = durRef.current;
      const rawT  = fromSvgX(x, dur);
      const speed = Math.round(fromSvgY(y));
      setLocal(prev => {
        const minT = idx > 0              ? prev[idx - 1].t_ms + 500 : 0;
        const maxT = idx < prev.length - 1 ? prev[idx + 1].t_ms - 500 : dur;
        const tMs  = Math.max(minT, Math.min(maxT, rawT));
        const next = [...prev];
        next[idx]  = { t_ms: tMs, speed };
        return next;
      });
    };

    const onUp = () => {
      const idx = draggingIdx.current;
      if (idx === null) return;
      draggingIdx.current = null;
      setIsDragging(false);
      // Refresh edit fields with final position
      setLocal(prev => {
        if (prev[idx]) populateEdit(prev, idx);
        return prev;
      });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [populateEdit]);

  // ── SVG coordinate helper ────────────────────────────────────────────────
  const svgCoords = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (CANVAS_W / r.width),
      y: (e.clientY - r.top)  * (CANVAS_H / r.height),
    };
  }, []);

  // ── Canvas click: select or add ──────────────────────────────────────────
  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (durationMs <= 0 || isDragging) return;
    const { x, y } = svgCoords(e);
    if (x < PAD.left || x > RIGHT_EDGE || y < PAD.top || y > CANVAS_H - PAD.bottom) return;

    // Hit-test circles
    for (let i = 0; i < local.length; i++) {
      const kx = toSvgX(local[i].t_ms, durationMs);
      const ky = toSvgY(local[i].speed);
      if (Math.hypot(x - kx, y - ky) <= POINT_R + 4) {
        if (selected === i) { setSelected(null); return; }
        setSelected(i);
        populateEdit(local, i);
        setAddMode(null);
        return;
      }
    }

    // Empty area → add mode
    setSelected(null);
    setAddMode({ tMs: fromSvgX(x, durationMs), svgX: x, svgY: y });
    setAddSpeed(String(Math.round(fromSvgY(y))));
  }, [durationMs, isDragging, local, selected, svgCoords, populateEdit]);

  // ── Circle mousedown → start drag ───────────────────────────────────────
  const handleCircleDown = useCallback((e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    e.preventDefault();
    draggingIdx.current = idx;
    setIsDragging(true);
    setSelected(idx);
    populateEdit(local, idx);
    setAddMode(null);
  }, [local, populateEdit]);

  // ── Commit "add" popup ───────────────────────────────────────────────────
  const commitAdd = useCallback(() => {
    if (!addMode) return;
    const speed = parseFloat(addSpeed);
    if (isNaN(speed) || speed < 0) { setAddMode(null); return; }
    setLocal(prev =>
      [...prev, { t_ms: addMode.tMs, speed }].sort((a, b) => a.t_ms - b.t_ms)
    );
    setAddMode(null);
    setAddSpeed('');
  }, [addMode, addSpeed]);

  // ── Delete selected ──────────────────────────────────────────────────────
  const deleteSelected = useCallback(() => {
    if (selected === null) return;
    setLocal(prev => prev.filter((_, i) => i !== selected));
    setSelected(null);
  }, [selected]);

  // ── Apply edit fields to localKfs ────────────────────────────────────────
  const commitEdit = useCallback(() => {
    if (selected === null) return;
    const tMs   = Math.round(parseFloat(editT) * 1000);
    const speed = parseFloat(editSpd);
    if (isNaN(tMs) || isNaN(speed) || tMs < 0) return;
    setLocal(prev => {
      const next = [...prev];
      next[selected] = { t_ms: tMs, speed };
      return next.sort((a, b) => a.t_ms - b.t_ms);
    });
    setSelected(null);
  }, [selected, editT, editSpd]);

  // ── Apply → push to parent ───────────────────────────────────────────────
  const handleApply = useCallback(() => {
    onChange(local);
  }, [local, onChange]);

  // ── Curve geometry ───────────────────────────────────────────────────────
  const hasKf      = local.length > 0;
  const lastKf     = hasKf ? local[local.length - 1] : null;
  const preEndX    = hasKf ? toSvgX(local[0].t_ms, durationMs) : RIGHT_EDGE;
  const baseY      = toSvgY(baseSpeed);
  const polyPts    = local.map(kf => `${toSvgX(kf.t_ms, durationMs)},${toSvgY(kf.speed)}`).join(' ');
  const postStartX = lastKf ? toSvgX(lastKf.t_ms, durationMs) : null;
  const postY      = lastKf ? toSvgY(lastKf.speed) : null;
  const progressX  = (elapsedMs && elapsedMs > 0 && durationMs > 0)
    ? toSvgX(elapsedMs, durationMs) : null;

  const xTicks: number[] = [];
  if (durationMs > 0) for (let i = 0; i <= 5; i++) xTicks.push((durationMs / 5) * i);
  const yTicks = [0, 100, 200, 300, 400, 500];

  return (
    <div className="space-y-2">
      {/* ── SVG canvas ── */}
      <div className="relative w-full bg-muted rounded-lg overflow-hidden border border-border"
        style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          className="w-full h-full cursor-crosshair"
          style={{ userSelect: 'none' }}
          onClick={handleCanvasClick}
        >
          {/* Y grid + labels */}
          {yTicks.map(v => (
            <g key={v}>
              <line x1={PAD.left} y1={toSvgY(v)} x2={RIGHT_EDGE} y2={toSvgY(v)}
                stroke={C_MUTED_FG} strokeOpacity={0.15} strokeWidth={1} />
              <text x={PAD.left - 5} y={toSvgY(v)} fontSize={10}
                textAnchor="end" dominantBaseline="middle" fill={C_MUTED_FG}>{v}</text>
            </g>
          ))}

          {/* X ticks + labels */}
          {xTicks.map(tMs => (
            <g key={tMs}>
              <line x1={toSvgX(tMs, durationMs)} y1={PAD.top}
                x2={toSvgX(tMs, durationMs)} y2={CANVAS_H - PAD.bottom}
                stroke={C_MUTED_FG} strokeOpacity={0.15} strokeWidth={1} />
              <text x={toSvgX(tMs, durationMs)} y={CANVAS_H - PAD.bottom + 14}
                fontSize={10} textAnchor="middle" fill={C_MUTED_FG}>{fmtMs(tMs)}</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CANVAS_H - PAD.bottom}
            stroke={C_MUTED_FG} strokeOpacity={0.4} strokeWidth={1} />
          <line x1={PAD.left} y1={CANVAS_H - PAD.bottom} x2={RIGHT_EDGE} y2={CANVAS_H - PAD.bottom}
            stroke={C_MUTED_FG} strokeOpacity={0.4} strokeWidth={1} />

          {durationMs > 0 && (<>
            {/* Base speed reference */}
            <line x1={PAD.left} y1={baseY} x2={RIGHT_EDGE} y2={baseY}
              stroke={C_MUTED_FG} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="6 3" />
            <text x={RIGHT_EDGE - 2} y={baseY - 5} fontSize={9}
              textAnchor="end" fill={C_MUTED_FG} fillOpacity={0.6}>
              base {baseSpeed}
            </text>

            {/* Pre-keyframe segment (gray dashed at baseSpeed) */}
            <line x1={PAD.left} y1={baseY} x2={preEndX} y2={baseY}
              stroke={C_MUTED_FG} strokeWidth={2} strokeDasharray="5 3" strokeLinecap="round" />

            {/* Jump at kf[0] */}
            {hasKf && Math.abs(toSvgY(local[0].speed) - baseY) > 1 && (
              <line x1={preEndX} y1={baseY} x2={preEndX} y2={toSvgY(local[0].speed)}
                stroke={C_PRIMARY} strokeWidth={1.5} strokeDasharray="3 2" strokeOpacity={0.5} />
            )}

            {/* Keyframe curve */}
            {local.length >= 2 && (
              <polyline points={polyPts} fill="none"
                stroke={C_PRIMARY} strokeWidth={2.5}
                strokeLinejoin="round" strokeLinecap="round" />
            )}

            {/* Post-keyframe segment (holds last speed) */}
            {postStartX !== null && postY !== null && postStartX < RIGHT_EDGE && (
              <line x1={postStartX} y1={postY} x2={RIGHT_EDGE} y2={postY}
                stroke={C_PRIMARY} strokeWidth={2} strokeDasharray="5 3" strokeLinecap="round" />
            )}
          </>)}

          {/* Keyframe circles */}
          {local.map((kf, i) => (
            <circle key={i}
              cx={toSvgX(kf.t_ms, durationMs)} cy={toSvgY(kf.speed)}
              r={POINT_R}
              fill={selected === i ? C_DESTRUCTIVE : C_PRIMARY}
              stroke={selected === i ? 'white' : 'white'}
              strokeWidth={selected === i ? 2.5 : 2}
              style={{ cursor: isDragging && draggingIdx.current === i ? 'grabbing' : 'grab' }}
              onMouseDown={e => handleCircleDown(e, i)}
            />
          ))}

          {/* Running progress line */}
          {progressX !== null && (
            <line x1={progressX} y1={PAD.top} x2={progressX} y2={CANVAS_H - PAD.bottom}
              stroke={C_DESTRUCTIVE} strokeWidth={2} strokeDasharray="4 2" />
          )}

          {/* Add ghost dot */}
          {addMode && (
            <circle cx={addMode.svgX} cy={addMode.svgY} r={POINT_R}
              fill="none" stroke={C_PRIMARY} strokeWidth={2} strokeDasharray="3 2" />
          )}

          {/* No-duration hint */}
          {durationMs <= 0 && (
            <text x={CANVAS_W / 2} y={CANVAS_H / 2}
              textAnchor="middle" dominantBaseline="middle" fontSize={13} fill={C_MUTED_FG}>
              请先设置运行总时长
            </text>
          )}
        </svg>
      </div>

      {/* ── Add keyframe popup ── */}
      {addMode && (
        <div className="flex items-center gap-2 bg-muted rounded-lg p-3 border border-border flex-wrap">
          <span className="text-sm text-muted-foreground">
            在 {fmtMs(addMode.tMs)} 处添加关键帧，速度（RPM）：
          </span>
          <input type="number" min={0} max={MAX_SPEED}
            value={addSpeed}
            onChange={e => setAddSpeed(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitAdd(); if (e.key === 'Escape') setAddMode(null); }}
            autoFocus
            className="w-24 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button onClick={commitAdd}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90">
            添加
          </button>
          <button onClick={() => setAddMode(null)}
            className="px-3 py-1 text-foreground rounded text-sm border border-border hover:bg-accent">
            取消
          </button>
        </div>
      )}

      {/* ── Selected keyframe edit panel ── */}
      {selected !== null && local[selected] && !addMode && (
        <div className="flex items-center gap-2 bg-muted rounded-lg p-3 border border-border flex-wrap">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            关键帧 #{selected + 1}
          </span>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            时间(s)
            <input type="number" min={0} max={durationMs / 1000} step={0.1}
              value={editT}
              onChange={e => setEditT(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); }}
              className="w-20 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            速度(RPM)
            <input type="number" min={0} max={MAX_SPEED}
              value={editSpd}
              onChange={e => setEditSpd(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); }}
              className="w-24 px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <button onClick={commitEdit}
            className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90">
            <Check className="w-3 h-3" />
            确认
          </button>
          <button onClick={deleteSelected}
            className="flex items-center gap-1 px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:opacity-90 ml-auto">
            <X className="w-3 h-3" />
            删除
          </button>
        </div>
      )}

      {/* ── Keyframe summary list ── */}
      {local.length > 0 && (
        <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
          {local.map((kf, i) => (
            <button key={i}
              onClick={() => { setSelected(i); populateEdit(local, i); setAddMode(null); }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                selected === i
                  ? 'border-primary text-foreground bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:text-foreground'
              }`}>
              {fmtMs(kf.t_ms)} → {kf.speed.toFixed(0)} RPM
            </button>
          ))}
        </div>
      )}

      {/* ── Apply button ── */}
      <div className="flex justify-end pt-1">
        <button onClick={handleApply}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Check className="w-4 h-4" />
          Apply
        </button>
      </div>
    </div>
  );
};

export default SpeedCurveEditor;
