import { useEffect, useMemo, useState } from 'react';
import { getSizeMeasurement, normalizeToppings } from '../utils/pizza.js';
import { seededRandom } from '../utils/random.js';

const POSTER_THEMES = [
  ['from-amber-200/95 via-orange-300/90 to-red-400/85', '#f59e0b'],
  ['from-emerald-200/95 via-lime-300/90 to-green-500/80', '#22c55e'],
  ['from-sky-200/95 via-cyan-300/90 to-blue-500/80', '#38bdf8'],
  ['from-rose-200/95 via-pink-300/90 to-fuchsia-500/80', '#fb7185']
];

function getPosterSeed(pizza) {
  return `${pizza.name}-${pizza.size}-${pizza.crust}-${pizza.toppings.join(',')}`;
}

function PizzaPoster({ pizza }) {
  const seed = getPosterSeed(pizza);
  const rand = seededRandom(seed);
  const [gradientClass, accent] = POSTER_THEMES[Math.floor(rand() * POSTER_THEMES.length)];
  const toppings = normalizeToppings(pizza.toppings);
  const dots = toppings.slice(0, 8).map((topping, index) => ({
    id: `${topping}-${index}`,
    left: `${22 + rand() * 56}%`,
    top: `${20 + rand() * 50}%`,
    size: `${10 + rand() * 10}%`,
    rotate: `${rand() * 360}deg`,
    color: accent
  }));

  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${gradientClass}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_45%),linear-gradient(180deg,rgba(8,11,20,0.08),rgba(8,11,20,0.55))]" />
      <div className="absolute inset-x-[12%] top-[12%] h-[58%] rounded-full bg-[#d59c63] shadow-[0_16px_45px_rgba(61,29,16,0.24)]" />
      <div className="absolute inset-x-[17%] top-[17%] h-[48%] rounded-full bg-[#ba452f]" />
      <div className="absolute inset-x-[20%] top-[20%] h-[42%] rounded-full bg-[#f4d182]" />
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="absolute rounded-full border border-white/35 bg-white/45 backdrop-blur-[1px]"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            transform: `translate(-50%, -50%) rotate(${dot.rotate})`,
            boxShadow: `0 0 0 5px ${dot.color}55`
          }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 p-4 text-slate-950">
        <div className="rounded-2xl bg-white/72 p-3 shadow-[0_18px_35px_rgba(15,23,42,0.16)] backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">3D Preview</p>
          <p className="mt-1 min-h-[3.5rem] text-lg font-semibold leading-tight">{pizza.name}</p>
          <p className="mt-1 text-xs text-slate-600">{pizza.crust} crust</p>
        </div>
      </div>
    </div>
  );
}

function MenuCard({ pizza, isActive, onSelect }) {
  const measurement = getSizeMeasurement(pizza.size);

  return (
    <button
      type="button"
      onClick={() => onSelect(pizza)}
      className={`group rounded-[1.5rem] border p-3 text-left transition duration-200 ${
        isActive
          ? 'border-ember-400 bg-slate-900/80 shadow-[0_0_0_1px_rgba(255,122,70,0.4)]'
          : 'border-white/10 bg-slate-950/65 hover:border-ember-400/50 hover:bg-slate-900/80'
      }`}
    >
      <PizzaPoster pizza={pizza} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{pizza.name}</h3>
          <p className="mt-1 text-xs text-slate-400">
            {pizza.size} | {measurement.diameterIn} in | {pizza.crust}
          </p>
        </div>
        <span className="rounded-full bg-ember-500/15 px-3 py-1 text-xs font-semibold text-ember-100">
          Rs {pizza.price}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {normalizeToppings(pizza.toppings).slice(0, 5).map((topping) => (
          <span
            key={topping}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300"
          >
            {topping}
          </span>
        ))}
      </div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 transition group-hover:text-ember-200">
        Open in 3D
      </div>
    </button>
  );
}

export default function MenuOverlay({ menu, open, selectedPizza, onClose, onSelectPizza }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open, menu?.id]);

  const filteredPizzas = useMemo(() => {
    if (!menu) return [];
    const query = search.trim().toLowerCase();
    if (!query) return menu.pizzas;

    return menu.pizzas.filter((pizza) => {
      const haystack = `${pizza.name} ${pizza.size} ${pizza.crust} ${pizza.toppings.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [menu, search]);

  if (!menu || !open) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 bg-[radial-gradient(circle_at_top,rgba(255,122,70,0.16),transparent_38%),rgba(2,6,16,0.7)] backdrop-blur-md">
      <div className="flex h-full flex-col px-4 py-4 sm:px-6">
        <div className="glass-panel mx-auto flex w-full max-w-7xl items-start justify-between gap-4 rounded-[1.75rem] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scanned Menu</p>
            <h2 className="mt-1 font-serif text-3xl text-ember-100">{menu.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{menu.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-ember-400/50 hover:text-ember-100"
          >
            Back to Viewer
          </button>
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-7xl flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by pizza, size, crust, or topping"
            className="glass-panel min-w-[260px] flex-1 rounded-full px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400"
          />
          <div className="rounded-full bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            {filteredPizzas.length} of {menu.pizzas.length} pizzas
          </div>
        </div>

        <div className="mx-auto mt-4 w-full max-w-7xl flex-1 overflow-hidden">
          {filteredPizzas.length ? (
            <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto pb-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPizzas.map((pizza) => (
                <MenuCard
                  key={`${menu.id}-${pizza.name}-${pizza.size}`}
                  pizza={pizza}
                  isActive={selectedPizza?.name === pizza.name}
                  onSelect={onSelectPizza}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel flex h-full items-center justify-center rounded-[1.75rem] p-6 text-center text-slate-300">
              No pizzas matched that search. Try a topping, crust, or size keyword.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
