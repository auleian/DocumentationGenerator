import { useEffect, useMemo, useState } from 'react';
import type { ApiDocumentType, ApiQuestion, ApiQuestionStub, ApiSection } from './types';
import { createAnswer, getNextSection, getSession, updateAnswer } from './lib/api';
import { sectionByQuestionId, topLevelSections } from './lib/catalog';
import { BookOpen, CheckCircle2, CircleDot, Circle, Loader2, Save, Sparkles } from 'lucide-react';

interface WizardProps {
  sessionId: string;
  sessionTitle: string;
  sections: ApiSection[];
  questions: ApiQuestion[];
  documentTypes: ApiDocumentType[];
  onComplete: () => void;
  onBackToDrafts: () => void;
}

type CurrentSection = Extract<
  Awaited<ReturnType<typeof getNextSection>>,
  { section: { number: string; name: string } }
>;

export default function Wizard({
  sessionId,
  sessionTitle,
  sections,
  questions,
  documentTypes,
  onComplete,
  onBackToDrafts,
}: WizardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [current, setCurrent] = useState<CurrentSection | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [answerIds, setAnswerIds] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const sectionMap = useMemo(() => sectionByQuestionId(sections, questions), [sections, questions]);
  const topSections = useMemo(
    () => (documentType ? topLevelSections(sections, documentTypes, documentType) : []),
    [sections, documentTypes, documentType],
  );

  useEffect(() => {
    let cancelled = false;
    getSession(sessionId).then((s) => {
      if (!cancelled) setDocumentType(s.document_type);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    fetchNext();
    // Runs once on mount; fetchNext is re-invoked explicitly on "Continue".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNext() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNextSection(sessionId);
      if ('message' in res) {
        onComplete();
        return;
      }
      setCurrent(res);
      setValues({});
      setAnswerIds({});
    } catch {
      setError('Could not load this section. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function setValue(qId: string, v: string) {
    setValues((prev) => ({ ...prev, [qId]: v }));
  }

  function flashSaved() {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  }

  async function handleContinue() {
    if (!current) return;
    setSubmitting(true);
    setError(null);
    try {
      for (const q of current.questions) {
        const value = (values[q.id] ?? '').trim();
        if (!value) continue;
        const existingId = answerIds[q.id];
        if (existingId) {
          await updateAnswer(existingId, value);
        } else {
          const answer = await createAnswer(sessionId, q.id, value);
          setAnswerIds((prev) => ({ ...prev, [q.id]: answer.id }));
        }
      }
      flashSaved();
      await fetchNext();
    } catch {
      setError('Could not save your answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const groups = useMemo(() => groupBySubsection(current, sectionMap), [current, sectionMap]);
  const allRequiredFilled = current
    ? current.questions.every((q) => (values[q.id] ?? '').trim().length > 0)
    : false;
  const currentIndex = topSections.findIndex((s) => s.number === current?.section.number);

  if (loading && !current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchNext}
            className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDrafts}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">The Documentation Generator</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800">{sessionTitle}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-gray-50/40 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Sections</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-1.5">
            {topSections.length > 0
              ? topSections.map((s, i) => {
                  const active = i === currentIndex;
                  const done = currentIndex >= 0 && i < currentIndex;
                  return (
                    <div
                      key={s.id}
                      className={`w-full px-4 py-2.5 flex items-start gap-2.5 ${
                        active ? 'bg-brand-50 border-l-2 border-brand-500' : 'border-l-2 border-transparent'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />
                      ) : active ? (
                        <CircleDot className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" strokeWidth={2} />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" strokeWidth={2} />
                      )}
                      <div className="min-w-0">
                        <div className={`text-[11px] font-mono ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                          {s.number}
                        </div>
                        <div
                          className={`text-[13px] leading-snug truncate ${
                            active ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {s.name}
                        </div>
                      </div>
                    </div>
                  );
                })
              : (
                <div className="px-4 py-2.5 flex items-start gap-2.5">
                  <CircleDot className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div className="text-[13px] text-gray-600">{current.section.name}</div>
                </div>
              )}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div key={current.section.number} className="animate-fade-up mx-auto max-w-2xl px-10 py-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                {current.section.number}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{current.section.name}</h1>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-8 space-y-8">
              {groups.map((group) => (
                <div key={group.header}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
                    {group.header}
                  </div>
                  <div className="space-y-6">
                    {group.questions.map((q) => (
                      <QuestionField
                        key={q.id}
                        text={q.text}
                        value={values[q.id] || ''}
                        onChange={(v) => setValue(q.id, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="shrink-0 border-t border-gray-200 bg-white">
        <div className="px-6 h-12 flex items-center justify-between">
          <div
            className={`flex items-center gap-1.5 text-[11px] transition-all ${
              savedFlash ? 'saved-flash text-brand-600' : 'opacity-60 text-gray-400'
            }`}
          >
            <Save className={`h-3 w-3 ${savedFlash ? 'animate-pulse-soft' : ''}`} />
            {savedFlash ? 'Saved' : 'Not saved yet'}
          </div>
          <button
            onClick={handleContinue}
            disabled={!allRequiredFilled || submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Continue
          </button>
        </div>
      </footer>
    </div>
  );
}

function groupBySubsection(
  current: CurrentSection | null,
  sectionMap: Map<string, ApiSection>,
): { header: string; questions: ApiQuestionStub[] }[] {
  if (!current) return [];
  const out: { header: string; questions: ApiQuestionStub[] }[] = [];
  for (const q of current.questions) {
    const sec = sectionMap.get(q.id);
    const header = sec ? `${sec.number} ${sec.name}` : current.section.name;
    const last = out[out.length - 1];
    if (last && last.header === header) {
      last.questions.push(q);
    } else {
      out.push({ header, questions: [q] });
    }
  }
  return out;
}

function QuestionField({
  text,
  value,
  onChange,
}: {
  text: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{text}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-y leading-relaxed"
      />
    </div>
  );
}
