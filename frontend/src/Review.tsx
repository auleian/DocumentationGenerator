import { useState } from 'react';
import type { Draft, SrsSection } from './types';
import { buildGeneratedMarkdown } from './markdown';
import { TEMPLATES } from './data';
import { generateDocument } from './lib/generate';
import { exportWord } from './lib/exportWord';
import { slugify } from './helpers';
import {
  BookOpen,
  ArrowLeft,
  FileDown,
  FileText,
  CheckCircle2,
  Circle,
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

export default function Review({ draft, onUpdateDraft, onBackToDrafts, onBackToWizard }: ReviewProps) {
  const template = TEMPLATES.find((t) => t.id === draft.templateId);
  const sections = (template?.sections ?? []).filter((s) => draft.selectedSectionIds.includes(s.id));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  function hasGenerated(s: SrsSection) {
    return Boolean(draft.generated[s.id]?.trim());
  }

  const generatedCount = sections.filter(hasGenerated).length;
  const pct = sections.length === 0 ? 0 : Math.round((generatedCount / sections.length) * 100);

  function startEdit(sectionId: string) {
    setEditingId(sectionId);
    setEditText(draft.generated[sectionId] ?? '');
  }

  function saveEdit() {
    if (!editingId) return;
    onUpdateDraft({
      ...draft,
      generated: { ...draft.generated, [editingId]: editText },
      lastEdited: 'just now',
    });
    setEditingId(null);
  }

  async function regenerateSection(sectionId: string) {
    if (!template) return;
    setRegeneratingId(sectionId);
    try {
      const result = await generateDocument({
        template,
        selectedSectionIds: [sectionId],
        answers: draft.answers,
        diagrams: draft.diagrams,
      });
      onUpdateDraft({ ...draft, generated: { ...draft.generated, ...result }, lastEdited: 'just now' });
    } finally {
      setRegeneratingId(null);
    }
  }

  function downloadMarkdown() {
    const md = buildGeneratedMarkdown(draft, sections);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(draft.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [exportingWord, setExportingWord] = useState(false);

  async function downloadWord() {
    setExportingWord(true);
    try {
      await exportWord(draft, sections, slugify(draft.title));
    } finally {
      setExportingWord(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col print:bg-white">
      <header className="shrink-0 border-b border-gray-200 bg-white print:hidden">
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
              <Pencil className="h-3.5 w-3.5" /> Edit answers
            </button>
            <button
              onClick={downloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Export Markdown
            </button>
            <button
              onClick={downloadWord}
              disabled={exportingWord}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" /> {exportingWord ? 'Exporting…' : 'Export Word'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-8 py-8 print:p-0 print:max-w-none">
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
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">generated</div>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-800">
                {generatedCount}/{sections.length}
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide">sections done</div>
            </div>
          </div>
        </div>

        {/* Section status chips */}
        <div className="stagger mb-6 flex flex-wrap gap-2 print:hidden">
          {sections.map((s, i) => (
            <span
              key={s.id}
              style={{ '--i': i } as React.CSSProperties}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-600"
            >
              {hasGenerated(s) ? (
                <CheckCircle2 className="h-3 w-3 text-brand-600" />
              ) : (
                <Circle className="h-3 w-3 text-gray-300" />
              )}
              <span className="font-mono text-gray-400">{s.id}</span>
              {s.title}
            </span>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="animate-fade-up mb-6 print:hidden">
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div className="bar-grow h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Document preview */}
        <div className="animate-scale-in rounded-xl border border-gray-200 bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
          <div className="px-8 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 print:hidden">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-mono">{slugify(draft.title)}.md</span>
          </div>
          <div className="px-10 py-8 max-h-[calc(100vh-360px)] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 md-doc">
            <div className="doc-cover">
              <div className="doc-eyebrow">Software Requirements Specification</div>
              <h1 className="doc-title">{draft.title}</h1>
              {draft.subtitle && <p className="doc-subtitle">{draft.subtitle}</p>}
            </div>

            {sections.map((section) => {
              const content = draft.generated[section.id];
              const attached = section.diagram ? draft.diagrams[section.id] : undefined;
              const editing = editingId === section.id;
              const regenerating = regeneratingId === section.id;

              return (
                <section key={section.id} className="doc-section group/section">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="doc-h2 !mt-0 !border-0 !pb-0">
                      <span className="doc-num">{section.id}</span> {section.title}
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
                    <div className="doc-question">
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
