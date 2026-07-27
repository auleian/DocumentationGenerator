import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { getGeneratedDocument, listGeneratedDocuments } from './lib/api';
import { slugify } from './helpers';
import { BookOpen, ArrowLeft, FileDown, FileText, Loader2 } from 'lucide-react';

interface ReviewProps {
  sessionId: string;
  sessionTitle: string;
  generatedDocumentId?: string;
  onBackToDrafts: () => void;
}

export default function Review({ sessionId, sessionTitle, generatedDocumentId, onBackToDrafts }: ReviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (generatedDocumentId) {
          const doc = await getGeneratedDocument(generatedDocumentId);
          if (!cancelled) setContent(doc.content);
          return;
        }
        // Fallback for a session opened without a locally-cached document id (e.g. after a hard refresh).
        const all = await listGeneratedDocuments();
        const doc = all.find((d) => d.session === sessionId);
        if (!cancelled) {
          if (doc) setContent(doc.content);
          else setError('This document hasn’t been generated yet.');
        }
      } catch {
        if (!cancelled) setError('Could not load this document.');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, generatedDocumentId]);

  const html = useMemo(() => {
    if (!content) return '';
    return DOMPurify.sanitize(marked.parse(content, { async: false }));
  }, [content]);

  function downloadMarkdown() {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(sessionTitle)}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
              onClick={downloadMarkdown}
              disabled={!content}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Export Markdown
            </button>
            <button
              onClick={() => window.print()}
              disabled={!content}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-8 py-8 print:p-0 print:max-w-none">
        <div className="animate-fade-up mb-6 print:hidden">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{sessionTitle}</h1>
        </div>

        <div className="animate-scale-in rounded-xl border border-gray-200 bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
          <div className="px-8 py-3 border-b border-gray-100 flex items-center gap-2 text-xs text-gray-400 print:hidden">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-mono">{slugify(sessionTitle)}.md</span>
          </div>
          <div className="px-10 py-8 max-h-[calc(100vh-360px)] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : content ? (
              <div className="md-doc" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
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
