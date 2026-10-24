import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

// ── Reusable Searchable Dropdown ─────────────────────────────────
const LocationDropdown = ({ label, placeholder, options, value, onChange, disabled, loading }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(filter.toLowerCase()));
  const select = (opt) => { onChange(opt); setOpen(false); setFilter(''); };

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-3 border rounded-lg text-sm text-left transition-all
          ${disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : open
              ? 'border-brand-500 ring-2 ring-brand-100 bg-white'
              : 'border-slate-200 bg-white hover:border-slate-300'}`}
      >
        <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400 text-center">No results</p>
            ) : filtered.map(opt => (
              <button
                key={opt}
                onClick={() => select(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-slate-50 last:border-0
                  ${value === opt ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
