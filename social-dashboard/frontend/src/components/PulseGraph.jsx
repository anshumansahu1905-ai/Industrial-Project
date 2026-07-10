// Signature element: a live "heartbeat" line built from real engagement counts
// rather than decorative noise. Each point is one day's (likes + comments),
// normalized into a waveform so the shape itself reads as "activity."
export default function PulseGraph({ timeline = [], height = 64 }) {
  const values = timeline.length ? timeline.map((d) => d.likes + d.comments * 2) : [0];
  const max = Math.max(...values, 1);
  const width = 600;
  const step = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 12) - 6;
    return [x, y];
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <line x1="0" y1={height - 6} x2={width} y2={height - 6} stroke="rgba(231,228,218,0.08)" strokeWidth="1" />
      <path d={path} fill="none" stroke="#4F8C7A" strokeWidth="2" className="pulse-line" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#E4A853" opacity={i === points.length - 1 ? 1 : 0} />
      ))}
    </svg>
  );
}
