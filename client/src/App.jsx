import { useCallback, useEffect, useMemo, useState } from 'react';
import MarkerARView from './components/MarkerARView.jsx';
import MarkerlessARView from './components/MarkerlessARView.jsx';
import ControlsPanel from './components/ControlsPanel.jsx';
import StatusBanner from './components/StatusBanner.jsx';
import MenuOverlay from './components/MenuOverlay.jsx';
import { getPizzaKey } from './utils/pizza.js';
import { DEFAULT_MENU_ID, getMenuById, getMenuQrPayload } from './utils/menu.js';
import {
  captureCanvasOnly,
  captureComposite,
  downloadJsonFile,
  triggerDownload
} from './utils/capture.js';

const MENU_CACHE_KEY = 'pizzaMenuCache';
const PIZZA_CACHE_KEY = 'pizzaCache';
const LAST_MENU_KEY = 'pizzaLastMenuId';

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    return fallback;
  }
}

function upsertMenuCache(prev, menuId) {
  const now = Date.now();
  const existing = prev.find((item) => item.menuId === menuId);
  if (existing) {
    return prev.map((item) => (
      item.menuId === menuId ? { ...item, lastOpenedAt: now } : item
    ));
  }

  return [{ menuId, scannedAt: now, lastOpenedAt: now }, ...prev].slice(0, 10);
}

function upsertPizzaCache(prev, pizza, sourceMenuId = null) {
  const key = getPizzaKey(pizza);
  if (!key) return prev;

  const now = Date.now();
  const existing = prev.find((item) => item.key === key);
  if (existing) {
    return prev.map((item) => (
      item.key === key ? { ...item, lastSeen: now, sourceMenuId } : item
    ));
  }

  return [{ ...pizza, key, sourceMenuId, savedAt: now, lastSeen: now }, ...prev].slice(0, 24);
}

export default function App() {
  const [mode, setMode] = useState('marker');
  const [activePizza, setActivePizza] = useState(null);
  const [markerPizza, setMarkerPizza] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [lastMenuId, setLastMenuId] = useState(() => readStorage(LAST_MENU_KEY, null));
  const [menuOverlayOpen, setMenuOverlayOpen] = useState(false);
  const [qrRaw, setQrRaw] = useState('');
  const [qrError, setQrError] = useState('');
  const [scanStatus, setScanStatus] = useState('idle');
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [xrSupported, setXrSupported] = useState(false);
  const [videoEl, setVideoEl] = useState(null);
  const [canvasEl, setCanvasEl] = useState(null);
  const [controls, setControls] = useState({
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [cachedMenus, setCachedMenus] = useState(() => readStorage(MENU_CACHE_KEY, []));
  const [cachedPizzas, setCachedPizzas] = useState(() => readStorage(PIZZA_CACHE_KEY, []));

  const currentMenu = useMemo(() => {
    const menuId = activeMenu?.id || lastMenuId || cachedMenus[0]?.menuId || null;
    return menuId ? getMenuById(menuId) : null;
  }, [activeMenu, lastMenuId, cachedMenus]);

  const displayPayload = useMemo(() => {
    if (activePizza) {
      return JSON.stringify(activePizza, null, 2);
    }

    if (currentMenu) {
      return JSON.stringify(getMenuQrPayload(currentMenu.id), null, 2);
    }

    return qrRaw || 'Waiting for QR scan...';
  }, [activePizza, currentMenu, qrRaw]);

  const handleQrPayload = useCallback((payload) => {
    if (!payload) return;

    if (payload.kind === 'menu') {
      const menu = getMenuById(payload.menuId);
      if (!menu) {
        setQrError(`Menu "${payload.menuId}" is not available in this build.`);
        return;
      }

      setQrError('');
      setActiveMenu(menu);
      setLastMenuId(menu.id);
      setMenuOverlayOpen(true);
      setMarkerPizza(null);
      setCachedMenus((prev) => upsertMenuCache(prev, menu.id));
      setActivePizza((prev) => {
        if (activeMenu?.id !== menu.id) {
          return null;
        }
        if (!prev) return null;
        return menu.pizzas.some((pizza) => getPizzaKey(pizza) === getPizzaKey(prev)) ? prev : null;
      });
      return;
    }

    if (payload.kind === 'pizza') {
      setQrError('');
      setMenuOverlayOpen(false);
      setActivePizza(payload.pizza);
      setMarkerPizza(payload.pizza);
      setCachedPizzas((prev) => upsertPizzaCache(prev, payload.pizza));
      if (mode === 'marker') {
        setMode('markerless');
      }
    }
  }, [activeMenu?.id, mode]);

  const handleQrRaw = useCallback((raw) => {
    setQrRaw(raw || '');
  }, []);

  const handleQrError = useCallback((error) => {
    setQrError(error || '');
  }, []);

  const handleSelectMenuPizza = useCallback((pizza) => {
    if (!pizza) return;
    setActivePizza(pizza);
    setMarkerPizza(null);
    setMenuOverlayOpen(false);
    setCachedPizzas((prev) => upsertPizzaCache(prev, pizza, currentMenu?.id || null));
    setMode('markerless');
  }, [currentMenu?.id]);

  const handleOpenMenu = useCallback(() => {
    if (!currentMenu) return;
    setActiveMenu(currentMenu);
    setLastMenuId(currentMenu.id);
    setMenuOverlayOpen(true);
  }, [currentMenu]);

  const handleCloseMenu = useCallback(() => {
    setMenuOverlayOpen(false);
  }, []);

  const handleOpenCachedMenu = useCallback((menuId) => {
    const menu = getMenuById(menuId);
    if (!menu) return;
    setActiveMenu(menu);
    setLastMenuId(menu.id);
    setMenuOverlayOpen(true);
    setCachedMenus((prev) => upsertMenuCache(prev, menu.id));
  }, []);

  const handleScreenshot = useCallback(async () => {
    if (!canvasEl) return;
    let dataUrl = '';
    if (mode === 'marker' && videoEl) {
      dataUrl = captureComposite(videoEl, canvasEl);
    } else {
      dataUrl = captureCanvasOnly(canvasEl);
    }
    if (dataUrl) {
      triggerDownload(dataUrl, `pizza-ar-${Date.now()}.png`);
    }
  }, [canvasEl, mode, videoEl]);

  const handleDownloadJson = useCallback(() => {
    if (activePizza) {
      downloadJsonFile(JSON.stringify(activePizza, null, 2), `${activePizza.name.toLowerCase().replace(/\s+/g, '-')}.json`);
      return;
    }

    if (currentMenu) {
      downloadJsonFile(
        JSON.stringify(
          {
            ...getMenuQrPayload(currentMenu.id),
            name: currentMenu.name,
            pizzas: currentMenu.pizzas
          },
          null,
          2
        ),
        `${currentMenu.id}.json`
      );
      return;
    }

    downloadJsonFile(
      qrRaw || JSON.stringify(getMenuQrPayload(DEFAULT_MENU_ID), null, 2),
      `pizza-${Date.now()}.json`
    );
  }, [activePizza, currentMenu, qrRaw]);

  const handleReset = useCallback(() => {
    setControls({ rotation: 0, scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  const handleSizeChange = useCallback((size) => {
    setActivePizza((prev) => {
      if (!prev) return prev;
      const next = { ...prev, size };
      setCachedPizzas((cache) => upsertPizzaCache(cache, next, currentMenu?.id || null));
      return next;
    });
  }, [currentMenu?.id]);

  const handleSelectCachedPizza = useCallback((key) => {
    const found = cachedPizzas.find((item) => item.key === key);
    if (!found) return;
    if (found.sourceMenuId) {
      const menu = getMenuById(found.sourceMenuId);
      if (menu) {
        setActiveMenu(menu);
        setLastMenuId(menu.id);
      }
    }
    setActivePizza(found);
    setMenuOverlayOpen(false);
    setMode('markerless');
  }, [cachedPizzas]);

  useEffect(() => {
    try {
      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(cachedMenus));
    } catch (error) {
      // ignore storage issues
    }
  }, [cachedMenus]);

  useEffect(() => {
    try {
      localStorage.setItem(PIZZA_CACHE_KEY, JSON.stringify(cachedPizzas));
    } catch (error) {
      // ignore storage issues
    }
  }, [cachedPizzas]);

  useEffect(() => {
    try {
      if (lastMenuId) {
        localStorage.setItem(LAST_MENU_KEY, JSON.stringify(lastMenuId));
      } else {
        localStorage.removeItem(LAST_MENU_KEY);
      }
    } catch (error) {
      // ignore storage issues
    }
  }, [lastMenuId]);

  const status = useMemo(
    () => ({
      mode,
      scanStatus,
      cameraStatus,
      qrError,
      xrSupported
    }),
    [mode, scanStatus, cameraStatus, qrError, xrSupported]
  );

  return (
    <div className="min-h-[100dvh] w-full text-slate-100">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {mode === 'marker' ? (
          <MarkerARView
            enabled={mode === 'marker'}
            pizza={markerPizza}
            userControls={controls}
            onQrPayload={handleQrPayload}
            onQrRaw={handleQrRaw}
            onQrError={handleQrError}
            onScanStatus={setScanStatus}
            onCameraStatus={setCameraStatus}
            onVideoReady={setVideoEl}
            onCanvasReady={setCanvasEl}
          />
        ) : (
          <MarkerlessARView
            enabled={mode === 'markerless'}
            pizza={activePizza}
            userControls={controls}
            onCanvasReady={setCanvasEl}
            onXrSupport={setXrSupported}
          />
        )}

        <div
          className="pointer-events-none absolute left-3 right-3 top-3 z-10 sm:left-4 sm:right-4 sm:top-4"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <StatusBanner status={status} />
        </div>

        {currentMenu && !menuOverlayOpen ? (
          <div
            className="pointer-events-none absolute right-3 top-16 z-10 sm:right-4 sm:top-16"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            <button
              type="button"
              onClick={handleOpenMenu}
              className="pointer-events-auto rounded-full bg-slate-950/85 px-4 py-2 text-sm font-semibold text-slate-100 shadow-glow transition hover:bg-slate-900"
            >
              Reopen Menu
            </button>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-10">
          <ControlsPanel
            pizza={activePizza}
            activeMenu={currentMenu}
            qrRaw={displayPayload}
            qrError={qrError}
            scanStatus={scanStatus}
            cameraStatus={cameraStatus}
            mode={mode}
            menuOverlayOpen={menuOverlayOpen}
            onModeChange={setMode}
            controls={controls}
            onControlsChange={setControls}
            onReset={handleReset}
            onScreenshot={handleScreenshot}
            onDownloadJson={handleDownloadJson}
            cachedMenus={cachedMenus}
            cachedPizzas={cachedPizzas}
            onSelectCachedMenu={handleOpenCachedMenu}
            onSelectCachedPizza={handleSelectCachedPizza}
            onSizeChange={handleSizeChange}
            onOpenMenu={handleOpenMenu}
            onCloseMenu={handleCloseMenu}
          />
        </div>

        <MenuOverlay
          menu={currentMenu}
          open={menuOverlayOpen}
          selectedPizza={activePizza}
          onClose={handleCloseMenu}
          onSelectPizza={handleSelectMenuPizza}
        />
      </div>
    </div>
  );
}
