"use client";

import { useState, type ReactNode } from "react";

/** Tab sederhana satu-grup (untuk tab Description di detail produk). */
export function Tabs({
  tabs,
  defaultTab = 0,
}: {
  tabs: { label: string; content: ReactNode }[];
  defaultTab?: number;
}) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div>
      <div role="tablist" aria-label="Tab konten" className="flex gap-6 border-b border-line">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-[3px] pb-2 font-heading text-sm font-semibold uppercase tracking-wide ${
              active === i
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-ink-400 hover:text-ink-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="py-6"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
}
