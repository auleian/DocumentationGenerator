import { useEffect, useRef, useState } from 'react';
import type { Draft } from './types';
import { TEMPLATES } from './data';
import { generateDocument } from './lib/generate';
import { useScreenEnter, loopingPulse } from './lib/animations';
import { BookOpen, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';

interface GenerateProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onDone: () => void;
  onBack: () => void;
}

export default function Generate({ draft, onUpdateDraft, onDone, onBack }: GenerateProps) {
  const [error, setError] = useState<string | null>(null);
  const template = TEMPLATES.find((t) => t.id === draft.templateId);
  const sectionCount = draft.selectedSectionIds.length;

  const screenRef = useScreenEnter();
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draft.generationStatus !== 'generating' && draft.generationStatus !== 'idle') return;
    const anim = loopingPulse(pulseRef.current);
    return () => {
      anim?.revert();
    };
  }, [draft.generationStatus]);

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
    <div ref={screenRef} className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto max-w-md px-8 text-center">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">The Documentation Generator</span>
        </button>

        {draft.generationStatus === 'error' ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Generation failed</h1>
            <p className="mt-1.5 text-sm text-gray-500">{error ?? 'Please try again.'}</p>
            <button
              onClick={runGeneration}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </>
        ) : draft.generationStatus === 'done' ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Your document is ready</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Review what was generated — you can edit or regenerate any section.
            </p>
            <button
              onClick={onDone}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              View document <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div
              ref={pulseRef}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600"
            >
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Generating your document…</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Drafting {sectionCount} section{sectionCount === 1 ? '' : 's'} from your answers.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
