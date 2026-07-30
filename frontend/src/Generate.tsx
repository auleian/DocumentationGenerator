import { useEffect, useMemo, useRef, useState } from 'react';
import type { ApiGeneratedSection, Draft, GeneratedSectionStatus } from './types';
import { triggerDocumentGeneration } from './lib/api';
import { leafNodes } from './lib/catalog';
import { polishSections } from './lib/polling';
import { useSrsCatalog } from './lib/sections';
import { useScreenEnter, loopingPulse } from './lib/animations';
import { BookOpen, Sparkles, RotateCcw, ArrowRight, Check, Circle, CircleDot, AlertTriangle } from 'lucide-react';

interface GenerateProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onDone: () => void;
  onBack: () => void;
}

const STAGES = [
  'Reading your answers…',
  'Structuring the sections…',
  'Writing in AIBOS house style…',
  'Finishing up…',
];

export default function Generate({ draft, onUpdateDraft, onDone, onBack }: GenerateProps) {
  const [error, setError] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, GeneratedSectionStatus>>({});

  const screenRef = useScreenEnter();
  const pulseRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const { catalog, loading: catalogLoading, error: catalogError } = useSrsCatalog();
  const sections = useMemo(() => {
    if (!catalog) return [];
    return leafNodes(catalog.tree).filter((n) => draft.selectedSectionIds.includes(n.section.id));
  }, [catalog, draft.selectedSectionIds]);
  const sectionCount = sections.length;

  const isActive = draft.generationStatus === 'generating' || draft.generationStatus === 'idle';
  const done = draft.generationStatus === 'done';

  useEffect(() => {
    if (!isActive) return;
    const anim = loopingPulse(pulseRef.current);
    return () => {
      anim?.revert();
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    setStageIndex(0);
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, [isActive]);

  const settledCount = sections.filter((s) => {
    const st = statuses[s.section.id];
    return st === 'ready' || st === 'failed';
  }).length;
  const readyCount = sections.filter((s) => statuses[s.section.id] === 'ready').length;
  const progressPct = sectionCount === 0 ? 0 : Math.round((settledCount / sectionCount) * 100);

  const firstGeneratedLine = useMemo(() => {
    for (const section of sections) {
      const content = draft.generated[section.section.id]?.trim();
      if (content) return content.split('\n')[0];
    }
    return null;
  }, [sections, draft.generated]);

  function applyRows(rows: ApiGeneratedSection[]) {
    setStatuses((prev) => {
      const next = { ...prev };
      for (const row of rows) next[row.section] = row.status;
      return next;
    });
    const current = draftRef.current;
    const generated = { ...current.generated };
    const generatedSectionIds = { ...current.generatedSectionIds };
    for (const row of rows) {
      if (row.status === 'ready') generated[row.section] = row.content;
      generatedSectionIds[row.section] = row.id;
    }
    onUpdateDraft({ ...current, generated, generatedSectionIds });
  }

  async function runGeneration() {
    setError(null);
    setStatuses({});
    onUpdateDraft({ ...draftRef.current, generationStatus: 'generating' });

    if (!draft.sessionId) {
      setError('This draft is not linked to a live session.');
      onUpdateDraft({ ...draftRef.current, generationStatus: 'error' });
      return;
    }
    if (sectionCount === 0) {
      setError('No sections are selected for this document.');
      onUpdateDraft({ ...draftRef.current, generationStatus: 'error' });
      return;
    }

    try {
      const sessionId = draft.sessionId;
      const rows = await polishSections(
        sessionId,
        sections.map((s) => s.section.id),
        { onUpdate: applyRows },
      );
      applyRows(rows);

      const anyReady = rows.some((r) => r.status === 'ready');
      if (!anyReady) {
        setError('None of the selected sections could be generated. Please try again.');
        onUpdateDraft({ ...draftRef.current, generationStatus: 'error' });
        return;
      }

      const doc = await triggerDocumentGeneration(sessionId);
      onUpdateDraft({
        ...draftRef.current,
        generationStatus: 'done',
        generatedDocumentId: doc.id,
        lastEdited: 'just now',
      });
    } catch {
      setError('Something went wrong generating your document.');
      onUpdateDraft({ ...draftRef.current, generationStatus: 'error' });
    }
  }

  useEffect(() => {
    if (catalogLoading || catalogError || sectionCount === 0) return;
    runGeneration();
    // Runs once the catalog/selected sections are known (i.e. right after the author clicks "Generate").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogLoading, catalogError, sectionCount]);

  if (catalogLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading sections…</p>
      </div>
    );
  }

  return (
    <div ref={screenRef} className="min-h-screen bg-paper">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">The Documentation Generator</span>
          </button>
        </div>
      </header>

      {draft.generationStatus === 'error' || catalogError ? (
        <main className="mx-auto max-w-md px-8 py-24 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-gray-900">Generation failed</h1>
          <p className="mt-1.5 text-sm text-gray-500">{error ?? catalogError ?? 'Please try again.'}</p>
          <button
            onClick={runGeneration}
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </main>
      ) : (
        <main className="mx-auto max-w-4xl px-8 py-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_360px]">
            {/* Status card */}
            <div className="animate-fade-up rounded-xl border border-gray-200 bg-white p-8 shadow-soft">
              <div
                ref={pulseRef}
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
                  done ? 'bg-brand-100 text-brand-700' : 'bg-brand-50 text-brand-600'
                }`}
              >
                {done ? (
                  <Check className="h-6 w-6" strokeWidth={2.4} />
                ) : (
                  <Sparkles className="h-6 w-6" strokeWidth={1.8} />
                )}
              </div>

              <h1 className="font-serif text-2xl font-semibold text-gray-900">
                {done ? 'Your document is ready' : STAGES[stageIndex]}
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                {done
                  ? 'Review what was generated — you can edit or regenerate any section.'
                  : `Drafting ${sectionCount} section${sectionCount === 1 ? '' : 's'} from your answers.`}
              </p>

              <div className="mt-6">
                <div className="mb-1.5 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {readyCount} of {sectionCount} sections
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {done && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-paper p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {draft.title.trim() || 'Untitled document'}
                  </div>
                  {draft.subtitle && <p className="mt-0.5 text-xs text-gray-500">{draft.subtitle}</p>}
                  {firstGeneratedLine && (
                    <p className="mt-2 line-clamp-2 font-serif text-sm leading-relaxed text-gray-700">
                      {firstGeneratedLine}
                    </p>
                  )}
                </div>
              )}

              {done && (
                <button
                  onClick={onDone}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  View document <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Live section checklist */}
            <aside className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft lg:sticky lg:top-16">
              <div className="border-b border-gray-100 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {done ? 'Generated sections' : 'Drafting…'}
                </span>
              </div>
              <div className="max-h-[65vh] space-y-1.5 overflow-y-auto px-4 py-3">
                {sections.map((s) => {
                  const st = statuses[s.section.id];
                  return (
                    <div key={s.section.id} className="flex items-center gap-2">
                      {st === 'ready' ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.4} />
                      ) : st === 'failed' ? (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" strokeWidth={2.2} />
                      ) : st === 'polishing' ? (
                        <CircleDot className="h-3.5 w-3.5 shrink-0 animate-pulse-soft text-brand-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                      )}
                      <span
                        className={`shrink-0 font-mono text-[11px] ${st === 'ready' ? 'text-brand-600' : 'text-gray-400'}`}
                      >
                        {s.section.number}
                      </span>
                      <span
                        className={`truncate font-serif text-sm ${st === 'ready' ? 'text-gray-800' : 'text-gray-400'}`}
                      >
                        {s.section.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
