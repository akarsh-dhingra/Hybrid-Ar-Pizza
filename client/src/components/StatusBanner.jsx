const statusColor = {
  idle: 'bg-slate-800 text-slate-200',
  requesting: 'bg-ember-500/30 text-ember-200',
  ready: 'bg-emerald-500/20 text-emerald-200',
  error: 'bg-red-500/30 text-red-200',
  scanning: 'bg-slate-800 text-slate-200',
  found: 'bg-emerald-500/20 text-emerald-200',
  invalid: 'bg-amber-500/30 text-amber-200',
  lost: 'bg-slate-700 text-slate-200'
};

export default function StatusBanner({ status }) {
  const cameraStatus = status.cameraStatus || 'idle';
  const scanStatus = status.scanStatus || 'idle';
  const mode = status.mode || 'marker';
  const xrSupported = status.xrSupported;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className={`rounded-full px-3 py-1 ${statusColor[cameraStatus] || 'bg-slate-800 text-slate-200'}`}>
        Camera: {cameraStatus}
      </span>
      <span className={`rounded-full px-3 py-1 ${statusColor[scanStatus] || 'bg-slate-800 text-slate-200'}`}>
        Scan: {scanStatus}
      </span>
      <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">Mode: {mode}</span>
      {mode === 'markerless' ? (
        <span className={`rounded-full px-3 py-1 ${xrSupported ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-200'}`}>
          WebXR: {xrSupported ? 'supported' : 'fallback'}
        </span>
      ) : null}
    </div>
  );
}
