import { useState, useMemo } from 'react';
import { useSettings } from '../../../settings.mjs';
import { GENRE_EXAMPLES } from '../../ai/examples.js';
import cx from '@src/cx.mjs';

const CATEGORIES = ['All', ...new Set(GENRE_EXAMPLES.map(e => e.category))];

export function ExamplesTab({ context }) {
  const { fontFamily } = useSettings();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return GENRE_EXAMPLES.filter(ex => {
      const matchCat = activeCategory === 'All' || ex.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q) || ex.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const loadExample = (ex) => {
    if (context.editorRef?.current) {
      context.editorRef.current.setCode(ex.code);
      if (context.handleEvaluate) {
        context.handleEvaluate();
      }
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-3 overflow-hidden text-foreground" style={{ fontFamily }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">🎵 Genre Examples</h3>
        <span className="text-xs text-foreground/50">{filtered.length} patterns</span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search genres..."
        className="w-full p-2 bg-background border border-foreground/30 rounded-md focus:ring-1 focus:ring-foreground outline-none text-sm"
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cx(
              'px-2 py-0.5 rounded text-xs transition-colors border',
              activeCategory === cat
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-foreground/60 border-foreground/20 hover:border-foreground/50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Examples Grid */}
      <div className="flex-1 overflow-auto space-y-2 pr-1">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => loadExample(ex)}
            className="w-full text-left p-3 rounded-md bg-background border border-foreground/10 hover:border-foreground/40 hover:bg-lineHighlight transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm group-hover:text-foreground">{ex.name}</span>
              <span className="text-xs text-foreground/40 bg-foreground/5 px-1.5 py-0.5 rounded">
                {ex.bpm} BPM
              </span>
            </div>
            <div className="text-xs text-foreground/50 mb-1">{ex.description}</div>
            <div className="flex items-center gap-2 text-xs text-foreground/30">
              <span>{ex.category}</span>
              <span>•</span>
              <span>{ex.key}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-foreground/40 leading-snug">
        Click any example to load it into the editor and play. Based on the Strudel Genre Wheel project.
      </p>
    </div>
  );
}
