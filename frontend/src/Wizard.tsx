import { useEffect, useMemo, useRef, useState } from 'react';
import type { Draft, DiagramAttachment, SectionNode, SectionStatus } from './types';
import { createAnswer, deleteDiagramRemote, updateAnswer, uploadDiagram } from './lib/api';
import { computeSectionSummary, leafNodes } from './lib/catalog';
import { useSrsCatalog } from './lib/sections';
import { sectionStatus, sectionProgress, statusLabel, statusTextClass } from './helpers';
import { buildDocumentHtml } from './markdown';
import { popIn, useScreenEnter } from './lib/animations';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  ImagePlus,
  FileText,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

const MAX_DIAGRAM_BYTES = 5 * 1024 * 1024; // 5MB, matches the UI's stated limit
const SAVE_DEBOUNCE_MS = 600;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface WizardProps {
  draft: Draft;
  onBackToDrafts: () => void;
  onGenerate: () => void;
  onUpdateDraft: (d: Draft) => void;
}

export default function Wizard({ draft, onBackToDrafts, onGenerate, onUpdateDraft }: WizardProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const screenRef = useScreenEnter();

  const { catalog, loading, error } = useSrsCatalog();
  const leaves = useMemo(() => (catalog ? leafNodes(catalog.tree) : []), [catalog]);
  const sections = useMemo(
    () => leaves.filter((n) => draft.selectedSectionIds.includes(n.section.id)),
    [leaves, draft.selectedSectionIds],
  );

  // Keep a ref mirroring the latest draft so debounced/async saves never act on a stale closure.
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const pendingValues = useRef<Record<string, string>>({});
  const saveTimers = useRef<Record<string, number>>({});

  async function persistAnswer(qId: string, value: string) {
    const sessionId = draftRef.current.sessionId;
    if (!sessionId) return;
    try {
      const existingId = draftRef.current.answerIds[qId];
      if (existingId) {
        await updateAnswer(existingId, value);
      } else {
        const created = await createAnswer(sessionId, qId, value);
        onUpdateDraft({
          ...draftRef.current,
          answerIds: { ...draftRef.current.answerIds, [qId]: created.id },
        });
      }
      setSaveError(null);
    } catch {
      setSaveError("Couldn't save your last answer — check your connection.");
    }
  }

  function commit(qId: string) {
    const value = pendingValues.current[qId];
    delete pendingValues.current[qId];
    delete saveTimers.current[qId];
    return persistAnswer(qId, value);
  }

  function scheduleSave(qId: string, value: string) {
    pendingValues.current[qId] = value;
    if (saveTimers.current[qId]) window.clearTimeout(saveTimers.current[qId]);
    saveTimers.current[qId] = window.setTimeout(() => {
      commit(qId);
    }, SAVE_DEBOUNCE_MS);
  }

  async function flushPendingSaves() {
    const ids = Object.keys(saveTimers.current);
    await Promise.all(
      ids.map((id) => {
        window.clearTimeout(saveTimers.current[id]);
        return commit(id);
      }),
    );
  }

  if (!draft.sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">This draft isn't linked to a live session.</p>
          <button
            onClick={onBackToDrafts}
            className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Back to drafts
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Loading sections…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onBackToDrafts}
            className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Back to drafts
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">No sections selected yet.</p>
          <button
            onClick={onBackToDrafts}
            className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Back to drafts
          </button>
        </div>
      </div>
    );
  }

  const section = sections[Math.min(activeIdx, sections.length - 1)];
  const status = sectionStatus(section, draft);

  function setAnswer(qId: string, value: string) {
    const answers = { ...draft.answers, [qId]: value };
    const sectionSummary = computeSectionSummary(leaves, draft.selectedSectionIds, answers);
    onUpdateDraft({ ...draft, answers, sectionSummary, lastEdited: 'just now' });
    flashSaved();
    scheduleSave(qId, value);
  }

  async function attachDiagram(file: File) {
    setDiagramError(null);
    if (!file.type.startsWith('image/')) {
      setDiagramError('Please choose an image file (PNG, JPG, or SVG).');
      return;
    }
    if (file.size > MAX_DIAGRAM_BYTES) {
      setDiagramError('That image is over 5MB — please choose a smaller export.');
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    const next: Draft = {
      ...draft,
      diagrams: { ...draft.diagrams, [section.section.id]: { dataUrl, fileName: file.name } },
      lastEdited: 'just now',
    };
    onUpdateDraft(next);
    flashSaved();
    uploadDiagram(draft.sessionId!, section.section.id, dataUrl, file.name).catch(() =>
      setDiagramError("Saved locally, but couldn't sync to the server."),
    );
  }

  function removeDiagram() {
    const rest = { ...draft.diagrams };
    delete rest[section.section.id];
    onUpdateDraft({ ...draft, diagrams: rest, lastEdited: 'just now' });
    flashSaved();
    deleteDiagramRemote(draft.sessionId!, section.section.id).catch(() => {});
  }

  let savedTimer: number | undefined;
  function flashSaved() {
    setSavedFlash(true);
    if (savedTimer) window.clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => setSavedFlash(false), 1400);
  }

  function go(delta: number) {
    const next = Math.min(sections.length - 1, Math.max(0, activeIdx + delta));
    setActiveIdx(next);
  }

  async function handleGenerate() {
    await flushPendingSaves();
    onGenerate();
  }

  const overallPct = Math.round(
    (sections.reduce((acc, s) => acc + sectionProgress(s, draft), 0) / sections.length) * 100,
  );

  return (
    <div ref={screenRef} className="h-screen flex flex-col bg-white">
      {/* Top bar */}
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
            <span className="text-sm font-semibold text-gray-800">{draft.title}</span>
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {overallPct}% complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Generate document
            </button>
            <button
              onClick={() => setPreviewOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {previewOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
              Preview
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-gray-50/40 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              SRS Sections
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-1.5">
            {sections.map((s, i) => {
              const st = sectionStatus(s, draft);
              const active = i === activeIdx;
              return (
                <button
                  key={s.section.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors ${
                    active
                      ? 'bg-brand-50 border-l-2 border-brand-500'
                      : 'border-l-2 border-transparent hover:bg-gray-100/70'
                  }`}
                >
                  <StatusIcon status={st} />
                  <div className="min-w-0">
                    <div className={`text-[11px] font-mono ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                      {s.section.number}
                    </div>
                    <div
                      className={`text-[13px] leading-snug truncate ${
                        active ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {s.section.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center panel */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* key forces re-mount + entrance animation on section change */}
          <div key={activeIdx} className="animate-fade-up mx-auto max-w-2xl px-10 py-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                {section.section.number}
              </span>
              <span className={`text-xs font-medium ${statusTextClass(status)}`}>{statusLabel(status)}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{section.section.name}</h1>

            <div className="mt-8 space-y-6">
              {section.questions.map((q, qi) => (
                <div key={q.id} className="animate-fade-up" style={{ animationDelay: `${qi * 50}ms` }}>
                  <QuestionField
                    label={q.text}
                    value={draft.answers[q.id] || ''}
                    onChange={(v) => setAnswer(q.id, v)}
                  />
                </div>
              ))}

              <div className="animate-fade-up" style={{ animationDelay: `${section.questions.length * 50}ms` }}>
                <DiagramCard
                  attached={draft.diagrams[section.section.id]}
                  onAttach={attachDiagram}
                  onRemove={removeDiagram}
                  error={diagramError}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right panel — live preview */}
        {previewOpen && (
          <aside className="w-[420px] shrink-0 border-l border-gray-200 bg-gray-50/40 flex flex-col animate-slide-in-right">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <FileText className="h-3.5 w-3.5" /> Live preview
              </div>
              <span className="text-[11px] text-gray-400 font-mono">IEEE 830</span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <PreviewPane draft={draft} sections={sections} />
            </div>
          </aside>
        )}
      </div>

      {/* Bottom bar */}
      <footer className="shrink-0 border-t border-gray-200 bg-white">
        <div className="px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(-1)}
              disabled={activeIdx === 0}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-[11px] text-gray-400 font-mono">
              {activeIdx + 1} / {sections.length}
            </span>
            <button
              onClick={() => go(1)}
              disabled={activeIdx === sections.length - 1}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 text-[11px] transition-all ${
                saveError
                  ? 'text-red-500'
                  : savedFlash
                    ? 'saved-flash text-brand-600'
                    : 'opacity-60 text-gray-400'
              }`}
            >
              <Save className={`h-3 w-3 ${savedFlash && !saveError ? 'animate-pulse-soft' : ''}`} />
              {saveError ? saveError : savedFlash ? 'Saved' : 'All changes saved'}
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" /> Generate document
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === 'complete')
    return <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" strokeWidth={2} />;
  if (status === 'in_progress')
    return <CircleDot className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" strokeWidth={2} />;
  return <Circle className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" strokeWidth={2} />;
}

interface QuestionFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

function QuestionField({ label, value, onChange }: QuestionFieldProps) {
  const base =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`${base} resize-y leading-relaxed`}
      />
    </div>
  );
}

function DiagramCard({
  attached,
  onAttach,
  onRemove,
  error,
}: {
  attached?: DiagramAttachment;
  onAttach: (file: File) => void;
  onRemove: () => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onAttach(file);
    e.target.value = '';
  }

  useEffect(() => {
    if (attached) popIn(imgRef.current);
    // Re-fire on every successful attach/replace, keyed off the image content itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attached?.dataUrl]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
            <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Diagram (optional)</div>
            <div className="text-xs text-gray-500">
              Attach a supporting image — shown in the preview, not included in AI-generated text.
            </div>
          </div>
        </div>
      </div>

      {attached ? (
        <div className="p-4 space-y-3">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img
              ref={imgRef}
              src={attached.dataUrl}
              alt="Attached diagram"
              className="max-h-64 w-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-700">
              <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
              {attached.fileName}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs font-medium text-gray-500 hover:text-brand-600 transition-colors"
              >
                Replace
              </button>
              <button
                onClick={onRemove}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full p-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50/40 transition-colors group"
        >
          <div className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 group-hover:border-brand-400 flex items-center justify-center transition-colors">
            <ImagePlus className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <div className="text-xs font-medium">Drop an image or click to attach</div>
          <div className="text-[11px] text-gray-400">PNG, SVG up to 5MB</div>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {error && <p className="px-4 pb-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function PreviewPane({ draft, sections }: { draft: Draft; sections: SectionNode[] }) {
  const html = useMemo(() => buildDocumentHtml(draft, sections), [draft, sections]);
  return <div className="md-doc" dangerouslySetInnerHTML={{ __html: html }} />;
}
