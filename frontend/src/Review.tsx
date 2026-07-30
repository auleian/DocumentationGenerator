import { useMemo, useState } from 'react';
import type { Draft, SectionStatus } from './types';
import { buildGeneratedMarkdown } from './markdown';
import {
  exportGeneratedDocument,
  getGeneratedDocument,
  resolveMediaUrl,
  triggerDocumentGeneration,
  updateGeneratedSectionContent,
} from './lib/api';
import { leafNodes } from './lib/catalog';
import { polishSections } from './lib/polling';
import { useSrsCatalog } from './lib/sections';
import { useScreenEnter } from './lib/animations';
import { sectionStatus, slugify } from './helpers';
import {
  BookOpen,
  ArrowLeft,
  FileDown,
  FileText,
  CheckCircle2,
  CircleDot,
  Circle,
  AlertCircle,
  Pencil,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

interface ReviewProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onBackToDrafts: () => void;
  onBackToWizard: () => void;
}

function domId(sectionId: string) {
  return `section-${sectionId}`;
}

function jumpTo(sectionId: string) {
  document.getElementById(domId(sectionId))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ContentsStatusIcon({ status }: { status: SectionStatus }) {
  if (status === 'complete') return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2} />;
  if (status === 'in_progress') return <CircleDot className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2} />;
  return <Circle className="h-3.5 w-3.5 shrink-0 text-gray-300" strokeWidth={2} />;
}

export default function Review({ draft, onUpdateDraft, onBackToDrafts, onBackToWizard }: ReviewProps) {
  const screenRef = useScreenEnter();
  const { catalog } = useSrsCatalog();
  const sections = useMemo(() => {
    if (!catalog) return [];
    return leafNodes(catalog.tree).filter((n) => draft.selectedSectionIds.includes(n.section.id));
  }, [catalog, draft.selectedSectionIds]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [exportingWord, setExportingWord] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const statuses = new Map(sections.map((s) => [s.section.id, sectionStatus(s, draft)]));
  const completeCount = sections.filter((s) => statuses.get(s.section.id) === 'complete').length;
  const needsInputCount = sections.length - completeCount;
  const pct = sections.length === 0 ? 0 : Math.round((completeCount / sections.length) * 100);

  function startEdit(sectionId: string) {
    setEditingId(sectionId);
    setEditText(draft.generated[sectionId] ?? '');
  }

  async function saveEdit() {
    if (!editingId) return;
    const sectionId = editingId;
    onUpdateDraft({
      ...draft,
      generated: { ...draft.generated, [sectionId]: editText },
      lastEdited: 'just now',
    });
    setEditingId(null);

    const generatedSectionId = draft.generatedSectionIds[sectionId];
    if (generatedSectionId && draft.sessionId) {
      await updateGeneratedSectionContent(generatedSectionId, editText);
      await triggerDocumentGeneration(draft.sessionId);
    }
  }

  async function regenerateSection(sectionId: string) {
    if (!draft.sessionId) return;
    setRegeneratingId(sectionId);
    try {
      const rows = await polishSections(draft.sessionId, [sectionId], { force: true });
      const row = rows.find((r) => r.section === sectionId);
      if (row?.status === 'ready') {
        onUpdateDraft({
          ...draft,
          generated: { ...draft.generated, [sectionId]: row.content },
          generatedSectionIds: { ...draft.generatedSectionIds, [sectionId]: row.id },
          lastEdited: 'just now',
        });
        await triggerDocumentGeneration(draft.sessionId);
      }
    } finally {
      setRegeneratingId(null);
    }
  }

  async function downloadMarkdown() {
    if (draft.generatedDocumentId) {
      const doc = await getGeneratedDocument(draft.generatedDocumentId);
      downloadText(doc.content, `${slugify(draft.title)}.md`);
    } else {
      downloadText(buildGeneratedMarkdown(draft, sections), `${slugify(draft.title)}.md`);
    }
  }

  async function exportAs(format: 'docx' | 'pdf') {
    if (!draft.generatedDocumentId) return;
    setExportError(null);
    const setBusy = format === 'docx' ? setExportingWord : setExportingPdf;
    setBusy(true);
    try {
      const artifact = await exportGeneratedDocument(draft.generatedDocumentId, format);
      window.open(resolveMediaUrl(artifact.file), '_blank', 'noopener');
    } catch {
      setExportError(`Couldn't export as ${format === 'docx' ? 'Word' : 'PDF'}. Please try again.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={screenRef} className="min-h-screen bg-paper print:bg-white">
      <header className="border-b border-gray-200 bg-white print:hidden">
        <div className="mx-auto max-w-6xl px-8 h-14 flex items-center justify-between">
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
              <Pencil className="h-3.5 w-3.5" /> Edit answers
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Export Markdown
            </button>
            <button
              onClick={() => exportAs('docx')}
              disabled={exportingWord || !draft.generatedDocumentId}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" /> {exportingWord ? 'Exporting…' : 'Export Word'}
            </button>
            <button
              onClick={() => exportAs('pdf')}
              disabled={exportingPdf || !draft.generatedDocumentId}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" /> {exportingPdf ? 'Exporting…' : 'Export PDF'}
            </button>
          </div>
        </div>
        {exportError && (
          <div className="mx-auto max-w-6xl px-8 pb-2 text-xs text-red-600">{exportError}</div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-8 py-8 print:max-w-none print:p-0">
        {/* Summary strip */}
        <div className="animate-fade-up mb-6 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{draft.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {draft.subtitle} · Assembled from {sections.length} section{sections.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-semibold text-brand-600">{pct}%</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">complete</div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-right">
              <div className={`text-2xl font-semibold ${needsInputCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                {needsInputCount}
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">need input</div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="animate-fade-up mb-6 print:hidden">
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="bar-grow h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Document preview */}
          <div className="animate-scale-in rounded-xl border border-gray-200 bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
            <div className="px-8 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 print:hidden">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-mono">{slugify(draft.title)}.md</span>
            </div>
            <div className="px-10 py-8 max-w-[72ch] mx-auto print:max-w-none print:p-0 md-doc">
              <div className="doc-cover">
                <div className="doc-eyebrow">Software Requirements Specification</div>
                <h1 className="doc-title">{draft.title}</h1>
                {draft.subtitle && <p className="doc-subtitle">{draft.subtitle}</p>}
              </div>

              {sections.map((node) => {
                const section = node.section;
                const status = statuses.get(section.id) ?? 'not_started';
                const content = draft.generated[section.id];
                const attached = draft.diagrams[section.id];
                const editing = editingId === section.id;
                const regenerating = regeneratingId === section.id;
                const showCallout = !editing && status === 'not_started';

                return (
                  <section key={section.id} id={domId(section.id)} className="doc-section group/section scroll-mt-8">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="doc-h2 !mt-0 !border-0 !pb-0 flex items-center gap-2">
                        <span className="doc-num">{section.number}</span> {section.name}
                        {status !== 'complete' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            <AlertCircle className="h-3 w-3" /> Needs input
                          </span>
                        )}
                      </h2>
                      {!editing && (
                        <div className="flex shrink-0 items-center gap-3 opacity-0 transition-opacity group-hover/section:opacity-100 print:hidden">
                          <button
                            onClick={() => startEdit(section.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => regenerateSection(section.id)}
                            disabled={regenerating}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600 disabled:opacity-50"
                          >
                            <RotateCcw className={`h-3 w-3 ${regenerating ? 'animate-spin' : ''}`} />
                            {regenerating ? 'Regenerating…' : 'Regenerate'}
                          </button>
                        </div>
                      )}
                    </div>

                    {editing ? (
                      <div className="doc-question">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={8}
                          className="w-full rounded-lg border border-brand-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        />
                        <div className="mt-2 flex items-center gap-3 print:hidden">
                          <button
                            onClick={saveEdit}
                            className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`doc-question ${
                          showCallout ? 'rounded-r-md border-l-2 border-amber-300 bg-amber-50/40 py-2 pl-4' : ''
                        }`}
                      >
                        {content ? (
                          content
                            .split('\n')
                            .filter((line) => line.trim().length > 0)
                            .map((line, i) => <p key={i}>{line}</p>)
                        ) : (
                          <p className="md-placeholder">Not generated yet.</p>
                        )}
                      </div>
                    )}

                    {attached && (
                      <img className="doc-diagram" src={attached.dataUrl} alt={attached.fileName} />
                    )}
                  </section>
                );
              })}
            </div>
          </div>

          {/* Contents — jump to any section */}
          <aside className="rounded-xl border border-gray-200 bg-white shadow-soft overflow-hidden lg:sticky lg:top-8 lg:self-start print:hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contents</span>
            </div>
            <nav className="max-h-[75vh] space-y-0.5 overflow-y-auto px-2 py-2">
              {sections.map((node) => (
                <button
                  key={node.section.id}
                  onClick={() => jumpTo(node.section.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
                >
                  <ContentsStatusIcon status={statuses.get(node.section.id) ?? 'not_started'} />
                  <span className="truncate text-xs">
                    <span className="mr-1.5 font-mono text-gray-400">{node.section.number}</span>
                    <span className="font-serif text-gray-800">{node.section.name}</span>
                  </span>
                </button>
              ))}
            </nav>
          </aside>
        </div>

        <div className="mt-6 print:hidden">
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
