import { useEffect, useRef, useState } from 'react';
import type { ApiDocumentType, ApiSection } from './types';
import { generateDocument, getNextSection, getSession, listGeneratedSections } from './lib/api';
import { topLevelSections } from './lib/catalog';
import { BookOpen, Sparkles, RotateCcw } from 'lucide-react';

const POLL_INTERVAL_MS = 2000;

interface GenerateProps {
  sessionId: string;
  documentTypes: ApiDocumentType[];
  sections: ApiSection[];
  onDone: (generatedDocumentId: string) => void;
  onBack: () => void;
}

type Phase = 'loading' | 'polishing' | 'assembling' | 'failed' | 'error';

export default function Generate({ sessionId, documentTypes, sections, onDone, onBack }: GenerateProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const expectedIdsRef = useRef<string[]>([]);
  const pollTimer = useRef<number | undefined>(undefined);
  const cancelledRef = useRef(false);

  function startPolling() {
    window.clearInterval(pollTimer.current);
    pollTimer.current = window.setInterval(async () => {
      try {
        const all = await listGeneratedSections();
        const relevant = all.filter(
          (gs) => gs.session === sessionId && expectedIdsRef.current.includes(gs.section),
        );
        const ready = relevant.filter((gs) => gs.status === 'ready');
        const failed = relevant.filter((gs) => gs.status === 'failed');

        if (failed.length > 0) {
          window.clearInterval(pollTimer.current);
          if (!cancelledRef.current) setPhase('failed');
          return;
        }
        if (ready.length === expectedIdsRef.current.length) {
          window.clearInterval(pollTimer.current);
          if (cancelledRef.current) return;
          setPhase('assembling');
          const doc = await generateDocument(sessionId);
          if (!cancelledRef.current) onDone(doc.id);
        }
      } catch {
        window.clearInterval(pollTimer.current);
        if (!cancelledRef.current) {
          setPhase('error');
          setError('Something went wrong while checking on your document.');
        }
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => {
    cancelledRef.current = false;

    async function start() {
      try {
        const session = await getSession(sessionId);
        const expected = topLevelSections(sections, documentTypes, session.document_type).map((s) => s.id);
        if (cancelledRef.current) return;
        if (expected.length === 0) {
          setPhase('error');
          setError('Could not determine this document’s sections.');
          return;
        }
        expectedIdsRef.current = expected;
        setPhase('polishing');
        startPolling();
      } catch {
        if (!cancelledRef.current) {
          setPhase('error');
          setError('Could not reach the server.');
        }
      }
    }

    start();
    return () => {
      cancelledRef.current = true;
      window.clearInterval(pollTimer.current);
    };
    // Runs once per mount for this session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function retry() {
    setError(null);
    setPhase('polishing');
    try {
      // Re-triggers polishing for every completed section (see next_section's own behavior).
      await getNextSection(sessionId);
    } catch {
      setPhase('failed');
      return;
    }
    startPolling();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="mx-auto max-w-md px-8 text-center">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">The Documentation Generator</span>
        </button>

        {phase === 'failed' || phase === 'error' ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Generation failed</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {error ?? 'One or more sections failed to generate.'}
            </p>
            <button
              onClick={retry}
              className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse-soft items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              {phase === 'assembling' ? 'Assembling your document…' : 'Polishing your sections…'}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">This can take a little while — please don&apos;t close this tab.</p>
          </>
        )}
      </div>
    </div>
  );
}
