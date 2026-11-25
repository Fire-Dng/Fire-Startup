'use client';

import React from 'react';

export function MiniSparkline({
  points,
  color = 'var(--color-accent)',
}: {
  points: number[];
  color?: string;
}) {
  const width = 120;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points, min + 1);
  const coords = points.map((pt, i) => {
    const x = (i / Math.max(1, points.length - 1)) * (width - 8) + 4;
    const y = height - 5 - ((pt - min) / (max - min)) * (height - 10);
    return { x, y };
  });
  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && <circle cx={last.x} cy={last.y} r={3.2} fill={color} />}
    </svg>
  );
}
