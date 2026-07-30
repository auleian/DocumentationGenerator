import { useState } from 'react';
import type { Draft } from './types';
import { useScreenEnter } from './lib/animations';
import {
  FileText,
  Plus,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Circle,
  Trash2,
  X,
} from 'lucide-react';

interface DraftsProps {
  drafts: Draft[];
  onOpenDraft: (id: string) => void;
  onStartNew: () => void;
  onBackHome: () => void;
  onDeleteDraft: (id: string) => void;
}

export default function Drafts({
  drafts,
  onOpenDraft,
  onStartNew,
  onBackHome,
  onDeleteDraft,
}: DraftsProps) {
  const screenRef = useScreenEnter();

  return (
    <div ref={screenRef} className="min-h-screen bg-paper">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackHome}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">The Documentation Generator</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800">Drafts</span>
          </div>
          <button
            onClick={onStartNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New document
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-10">
        <div className="animate-fade-up mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Your documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Everything you're drafting, across every document type.
          </p>
        </div>

        <div className="stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((d, i) => (
            <div key={d.id} style={{ '--i': i } as React.CSSProperties}>
              <DraftCard
                draft={d}
                onOpen={() => onOpenDraft(d.id)}
                onDelete={() => onDeleteDraft(d.id)}
              />
            </div>
          ))}

          {/* New document card */}
          <button
            onClick={onStartNew}
            style={{ '--i': drafts.length } as React.CSSProperties}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 hover:border-brand-500 transition-all p-6 min-h-[180px] text-left"
          >
            <div className="h-11 w-11 rounded-full bg-brand-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-brand-700">New document</div>
              <div className="text-xs text-brand-600/70 mt-0.5">Start from any document type</div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

function DraftCard({
  draft,
  onOpen,
  onDelete,
}: {
  draft: Draft;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const { total, complete: completedSections, inProgress } = draft.sectionSummary;
  const pct = total === 0 ? 0 : Math.round((completedSections / total) * 100);

  return (
    <div className="group h-full rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-card transition-all overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="h-4.5 w-4.5" strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono">
              <Clock className="h-3 w-3" /> {draft.lastEdited}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(true);
              }}
              aria-label="Delete document"
              className="rounded-md p-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <h3 className="mt-3.5 text-[15px] font-semibold text-gray-900 leading-snug">
          {draft.title.trim() || 'Untitled document'}
        </h3>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">{draft.subtitle}</p>

        {/* Status row */}
        <div className="mt-4 flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1 text-brand-700">
            <CheckCircle2 className="h-3 w-3" /> {completedSections} done
          </span>
          {inProgress > 0 && (
            <span className="inline-flex items-center gap-1 text-brand-500">
              <CircleDot className="h-3 w-3" /> {inProgress} in progress
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Circle className="h-3 w-3" /> {SECTIONS.length - completedSections - inProgress} left
          </span>
        </div>

        {/* Progress bar — solid color */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              {completedSections}/{SECTIONS.length} sections
            </span>
            <span className="text-xs font-semibold text-brand-600">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="bar-grow h-full rounded-full bg-brand-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center justify-between gap-3 border-t border-red-100 bg-red-50/60 px-5 py-3">
          <span className="text-xs text-red-700">Delete this document?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onOpen}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 group/btn"
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
