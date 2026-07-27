import { useEffect, useState } from 'react';
import type { DocumentSession, DocumentSessionStatus } from './types';
import { listSessions } from './lib/api';
import type { SessionNicknames } from './lib/sessionNicknames';
import { FileText, Plus, Clock, ArrowRight, BookOpen, Loader2 } from 'lucide-react';

interface DraftsProps {
  nicknames: SessionNicknames;
  onOpenDraft: (sessionId: string) => void;
  onNewSrs: () => void;
  onBackHome: () => void;
}

export default function Drafts({ nicknames, onOpenDraft, onNewSrs, onBackHome }: DraftsProps) {
  const [sessions, setSessions] = useState<DocumentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSessions()
      .then((s) => setSessions([...s].sort((a, b) => b.created_at.localeCompare(a.created_at))))
      .catch(() => setError('Could not load your drafts.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/60">
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
            onClick={onNewSrs}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New SRS
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-10">
        <div className="animate-fade-up mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Your drafts</h1>
          <p className="mt-1 text-sm text-gray-500">Documents you&apos;ve started, in progress or complete.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s, i) => (
              <div key={s.id} style={{ '--i': i } as React.CSSProperties}>
                <DraftCard session={s} nickname={nicknames[s.id]} onOpen={() => onOpenDraft(s.id)} />
              </div>
            ))}

            <button
              onClick={onNewSrs}
              style={{ '--i': sessions.length } as React.CSSProperties}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50/40 hover:bg-brand-50 hover:border-brand-500 transition-all p-6 min-h-[180px] text-left"
            >
              <div className="h-11 w-11 rounded-full bg-brand-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-brand-700">New SRS</div>
                <div className="text-xs text-brand-600/70 mt-0.5">Start a fresh specification</div>
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function statusLabel(status: DocumentSessionStatus): string {
  switch (status) {
    case 'in_progress':
      return 'In progress';
    case 'answers_complete':
      return 'Answers complete';
    case 'generating':
      return 'Generating';
    case 'generated':
      return 'Generated';
    case 'exported':
      return 'Exported';
    default:
      return status;
  }
}

function statusClass(status: DocumentSessionStatus): string {
  return status === 'generated' || status === 'exported'
    ? 'text-brand-700 bg-brand-50'
    : status === 'generating' || status === 'answers_complete'
      ? 'text-brand-600 bg-brand-50'
      : 'text-gray-500 bg-gray-100';
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function DraftCard({
  session,
  nickname,
  onOpen,
}: {
  session: DocumentSession;
  nickname?: string;
  onOpen: () => void;
}) {
  const title = nickname ?? `Untitled ${session.document_type.toUpperCase()}`;

  return (
    <div className="group h-full rounded-xl border border-gray-200 bg-white hover:border-brand-300 hover:shadow-card transition-all overflow-hidden flex flex-col">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="h-4.5 w-4.5" strokeWidth={1.8} />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono">
            <Clock className="h-3 w-3" /> {relativeTime(session.created_at)}
          </span>
        </div>
        <h3 className="mt-3.5 text-[15px] font-semibold text-gray-900 leading-snug">{title}</h3>

        <div className="mt-4">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${statusClass(session.status)}`}>
            {statusLabel(session.status)}
          </span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onOpen}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 group/btn"
        >
          Continue
          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
