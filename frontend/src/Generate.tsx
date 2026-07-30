import { useEffect, useMemo, useRef, useState } from 'react';
import type { Draft } from './types';
import { TEMPLATES } from './data';
import { generateDocument, MOCK_LATENCY_MS } from './lib/generate';
import { useScreenEnter, loopingPulse } from './lib/animations';
import { BookOpen, Sparkles, RotateCcw, ArrowRight, Check, Circle, CircleDot } from 'lucide-react';

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Generate({ draft, onUpdateDraft, onDone, onBack }: GenerateProps) {
  const [error, setError] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  const screenRef = useScreenEnter();
  const pulseRef = useRef<HTMLDivElement>(null);

  const template = TEMPLATES.find((t) => t.id === draft.templateId);
  const sections = useMemo(
    () => (template?.sections ?? []).filter((s) => draft.selectedSectionIds.includes(s.id)),
    [template, draft.selectedSectionIds],
  );
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
    }, 420);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || sectionCount === 0) return;
    setRevealedCount(0);
    const stepMs = clamp(MOCK_LATENCY_MS / sectionCount, 90, 260);
    const interval = setInterval(() => {
      setRevealedCount((c) => Math.min(c + 1, sectionCount));
    }, stepMs);
    return () => clearInterval(interval);
  }, [isActive, sectionCount]);

  useEffect(() => {
    // Once generation actually finishes, snap the checklist to fully done
    // rather than leaving it lagging behind the real result.
    if (done) setRevealedCount(sectionCount);
  }, [done, sectionCount]);

  const progressPct = sectionCount === 0 ? 0 : Math.round((revealedCount / sectionCount) * 100);

  const firstGeneratedLine = useMemo(() => {
    for (const section of sections) {
      const content = draft.generated[section.id]?.trim();
      if (content) return content.split('\n')[0];
    }
    return null;
  }, [sections, draft.generated]);

  async function runGeneration() {
    setError(null);
    onUpdateDraft({ ...draft, generationStatus: 'generating' });

    if (!template) {
      setError('Could not find the template for this draft.');
      onUpdateDraft({ ...draft, generationStatus: 'error' });
      return;
    }

    try {
      const generated = await generateDocument({
        template,
        selectedSectionIds: draft.selectedSectionIds,
        answers: draft.answers,
        diagrams: draft.diagrams,
      });
      onUpdateDraft({ ...draft, generated, generationStatus: 'done', lastEdited: 'just now' });
    } catch {
      setError('Something went wrong generating your document.');
      onUpdateDraft({ ...draft, generationStatus: 'error' });
    }
  }

  useEffect(() => {
    runGeneration();
    // Runs once when this screen mounts (i.e. right after the author clicks "Generate").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {draft.generationStatus === 'error' ? (
        <main className="mx-auto max-w-md px-8 py-24 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Sparkles className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <h1 className="font-serif text-xl font-semibold text-gray-900">Generation failed</h1>
          <p className="mt-1.5 text-sm text-gray-500">{error ?? 'Please try again.'}</p>
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
                    {revealedCount} of {sectionCount} sections
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
                {sections.map((s, i) => {
                  const rowDone = i < revealedCount;
                  const rowActive = i === revealedCount && !done;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      {rowDone ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2.4} />
                      ) : rowActive ? (
                        <CircleDot className="h-3.5 w-3.5 shrink-0 animate-pulse-soft text-brand-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                      )}
                      <span
                        className={`shrink-0 font-mono text-[11px] ${rowDone ? 'text-brand-600' : 'text-gray-400'}`}
                      >
                        {s.id}
                      </span>
                      <span className={`truncate font-serif text-sm ${rowDone ? 'text-gray-800' : 'text-gray-400'}`}>
                        {s.title}
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
