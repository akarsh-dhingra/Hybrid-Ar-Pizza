import { useMemo, useState } from 'react';
import { getMenuById } from '../utils/menu.js';
import { getRadiusForSize, getSizeMeasurement, SIZE_MEASUREMENTS } from '../utils/pizza.js';

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-200">{label}</span>
        <span className="text-ember-200">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700"
      />
    </label>
  );
}

export default function ControlsPanel({
  pizza,
  activeMenu,
  qrRaw,
  qrError,
  scanStatus,
  cameraStatus,
  mode,
  menuOverlayOpen,
  onModeChange,
  controls,
  onControlsChange,
  onReset,
  onScreenshot,
  onDownloadJson,
  cachedMenus,
  cachedPizzas,
  onSelectCachedMenu,
  onSelectCachedPizza,
  onSizeChange,
  onOpenMenu,
  onCloseMenu
}) {
  const [controlsOpen, setControlsOpen] = useState(false);
  const statusLabel = cameraStatus === 'ready' ? scanStatus : cameraStatus;
  const measurement = pizza ? getSizeMeasurement(pizza.size) : null;
  const radius = pizza ? getRadiusForSize(pizza.size) : null;
  const sizeOptions = ['small', 'medium', 'large'];

  const cachedMenuDetails = useMemo(
    () => (cachedMenus || [])
      .map((entry) => {
        const menu = getMenuById(entry.menuId);
        return menu ? { ...entry, menu } : null;
      })
      .filter(Boolean),
    [cachedMenus]
  );

  const handleUpdate = (key, value) => {
    onControlsChange({
      ...controls,
      [key]: value
    });
  };

  return (
    <>
      <aside
        className="pointer-events-auto absolute bottom-3 left-3 right-3 z-10 max-h-[42vh] overflow-hidden rounded-2xl shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:w-[min(390px,92vw)] sm:max-h-[78vh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="glass-panel flex h-full flex-col gap-4 overflow-y-auto p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {activeMenu ? 'Menu Loaded' : 'Pizza Data'}
              </p>
              <h2 className="font-serif text-2xl text-ember-100">
                {activeMenu ? activeMenu.name : pizza?.name || 'Awaiting QR'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {activeMenu
                  ? `${activeMenu.pizzas.length} pizzas ready to open in 3D`
                  : 'Scan a menu QR or legacy pizza QR to begin'}
              </p>
            </div>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-200">
              {statusLabel}
            </span>
          </div>

          {activeMenu ? (
            <div className="rounded-2xl bg-slate-950/55 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Menu Browser</p>
                  <p className="mt-1 text-sm text-slate-200">
                    {pizza ? `Selected: ${pizza.name}` : 'Select a pizza from the scanned menu to open it in 3D.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={menuOverlayOpen ? onCloseMenu : onOpenMenu}
                  className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-950 shadow-glow"
                >
                  {menuOverlayOpen ? 'Back to Viewer' : 'Open Menu'}
                </button>
              </div>
            </div>
          ) : null}

          {pizza ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">Size</p>
                  <p className="text-base text-slate-100">{pizza.size}</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">Crust</p>
                  <p className="text-base text-slate-100">{pizza.crust}</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">Price</p>
                  <p className="text-base text-slate-100">Rs {pizza.price}</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">Mode</p>
                  <p className="text-base text-slate-100">
                    {mode === 'marker' ? 'Marker Based' : 'Markerless'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Toppings</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pizza.toppings.map((topping) => (
                    <span
                      key={topping}
                      className="rounded-full border border-ember-400/40 bg-ember-500/20 px-3 py-1 text-xs text-ember-100"
                    >
                      {topping}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3 text-xs text-slate-200">
                <p className="uppercase tracking-[0.2em] text-slate-400">Measurements</p>
                <p className="mt-2">
                  Size: {pizza.size} | Diameter: {measurement.diameterIn} in / {measurement.diameterCm} cm
                </p>
                <p className="mt-1 text-slate-400">AR model diameter: {(radius * 2).toFixed(2)} units</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onSizeChange?.(size)}
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition ${
                        pizza.size === size
                          ? 'bg-ember-500 text-slate-950'
                          : 'border border-slate-700 text-slate-200 hover:border-ember-400/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(SIZE_MEASUREMENTS).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {key}: {value.diameterIn} in
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
              Scan the menu QR, then choose any pizza card to load its 3D model here.
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Payload</p>
            <div className="mt-2 max-h-28 overflow-auto rounded-xl bg-slate-950/70 p-3 font-mono text-xs text-slate-200">
              {qrRaw}
            </div>
            {qrError ? <p className="mt-2 text-xs text-ember-200">{qrError}</p> : null}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scanned Menus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cachedMenuDetails.length ? (
                cachedMenuDetails.map(({ menu, menuId }) => (
                  <button
                    key={menuId}
                    type="button"
                    onClick={() => onSelectCachedMenu?.(menuId)}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-ember-400/60 hover:text-ember-100"
                  >
                    {menu.name}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400">Scan a menu QR to keep it available here.</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recent Pizza Picks</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(cachedPizzas || []).length ? (
                cachedPizzas.slice(0, 8).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectCachedPizza?.(item.key)}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-ember-400/60 hover:text-ember-100"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400">Selections you open from the menu will appear here.</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div
        className="pointer-events-auto absolute left-3 right-3 top-14 z-10 sm:left-auto sm:right-4 sm:top-4 sm:w-[min(460px,92vw)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-ember-500/20 px-3 py-1 text-xs text-ember-200">
            {mode === 'marker' ? 'Marker Mode' : 'Markerless'}
          </span>
          <button
            type="button"
            onClick={() => setControlsOpen((open) => !open)}
            className="rounded-full bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 shadow-glow transition hover:bg-slate-800"
            aria-expanded={controlsOpen}
          >
            {controlsOpen ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>

        <div
          className={`mt-2 origin-top-right transition-all duration-200 ${
            controlsOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
        >
          <div className="glass-panel rounded-2xl p-4 shadow-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Controls</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onModeChange('marker')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === 'marker' ? 'bg-ember-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                Marker Based
              </button>
              <button
                type="button"
                onClick={() => onModeChange('markerless')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === 'markerless' ? 'bg-ember-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                Markerless
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <Slider
                label="Rotation"
                min={0}
                max={360}
                step={1}
                value={controls.rotation}
                onChange={(value) => handleUpdate('rotation', value)}
              />
              <Slider
                label="Scale"
                min={0.4}
                max={2.2}
                step={0.05}
                value={controls.scale}
                onChange={(value) => handleUpdate('scale', value)}
              />
              <Slider
                label="Offset X"
                min={-0.6}
                max={0.6}
                step={0.01}
                value={controls.offsetX}
                onChange={(value) => handleUpdate('offsetX', value)}
              />
              <Slider
                label="Offset Y"
                min={-0.6}
                max={0.6}
                step={0.01}
                value={controls.offsetY}
                onChange={(value) => handleUpdate('offsetY', value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onReset}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onScreenshot}
                className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-glow"
              >
                Screenshot
              </button>
              <button
                type="button"
                onClick={onDownloadJson}
                className="rounded-full border border-ember-400/50 px-4 py-2 text-sm text-ember-100"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
