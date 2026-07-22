import { useMemo } from 'react';
import type { Draft } from './types';
import { buildDocumentHtml } from './markdown';
import { SECTIONS } from './data';
import { sectionProgress } from './helpers';
import {
  BookOpen,
  ArrowLeft,
  FileDown,
  FileText,
  CheckCircle2,
  CircleDot,
  Circle,
  Pencil,
} from 'lucide-react';

interface ReviewProps {
  draft: Draft;
  onBackToDrafts: () => void;
  onBackToWizard: () => void;
}

export default function Review({ draft, onBackToDrafts, onBackToWizard }: ReviewProps) {
  const html = useMemo(() => buildDocumentHtml(draft), [draft]);
  const pct = Math.round(
    (SECTIONS.reduce((acc, s) => acc + sectionProgress(s, draft), 0) / SECTIONS.length) * 100,
  );
  const completeCount = SECTIONS.filter((s) => sectionProgress(s, draft) === 1).length;

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-8 h-14 flex items-center justify-between">
          <button
            onClick={onBackToDrafts}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">The Documentation Generator</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWizard}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <FileDown className="h-3.5 w-3.5" /> Export Markdown
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors">
              <FileDown className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-8 py-8">
        {/* Summary strip */}
        <div className="animate-fade-up mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{draft.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {draft.subtitle} · Assembled from {SECTIONS.length} sections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-semibold text-brand-600">{pct}%</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">complete</div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-800">
                {completeCount}/{SECTIONS.length}
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">sections done</div>
            </div>
          </div>
        </div>

        {/* Section status chips */}
        <div className="stagger mb-6 flex flex-wrap gap-2">
          {SECTIONS.map((s, i) => {
            const p = sectionProgress(s, draft);
            const st = p === 1 ? 'complete' : p === 0 ? 'not_started' : 'in_progress';
            return (
              <span
                key={s.id}
                style={{ '--i': i } as React.CSSProperties}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600"
              >
                {st === 'complete' ? (
                  <CheckCircle2 className="h-3 w-3 text-brand-600" />
                ) : st === 'in_progress' ? (
                  <CircleDot className="h-3 w-3 text-brand-500" />
                ) : (
                  <Circle className="h-3 w-3 text-gray-300" />
                )}
                <span className="font-mono text-gray-400">{s.id}</span>
                {s.title}
              </span>
            );
          })}
        </div>

        {/* Overall progress bar — solid */}
        <div className="animate-fade-up mb-6">
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="bar-grow h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Document preview */}
        <div className="animate-scale-in rounded-xl border border-gray-200 bg-white shadow-soft">
          <div className="px-8 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-mono">{draft.title.toLowerCase().replace(/\s+/g, '-')}.md</span>
          </div>
          <div className="px-10 py-8 max-h-[calc(100vh-360px)] overflow-y-auto">
            <div className="md-doc" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onBackToDrafts}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
