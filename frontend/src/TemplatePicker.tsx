import { useState } from 'react';
import type { ApiDocumentType, TemplateCard } from './types';
import { TEMPLATE_CARDS } from './data';
import { createSession } from './lib/api';
import { BookOpen, FileText, Sparkles } from 'lucide-react';

interface TemplatePickerProps {
  documentTypes: ApiDocumentType[];
  onCreated: (sessionId: string, nickname: string) => void;
  onBackHome: () => void;
}

export default function TemplatePicker({ documentTypes, onCreated, onBackHome }: TemplatePickerProps) {
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(card: TemplateCard) {
    setError(null);
    setCreatingId(card.id);
    try {
      const session = await createSession(card.id);
      onCreated(session.id, `Untitled ${card.name}`);
    } catch {
      setError('Could not start a new document. Please try again.');
      setCreatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-8 py-4 flex items-center gap-3">
          <button
            onClick={onBackHome}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">The Documentation Generator</span>
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">New document</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-10">
        <div className="animate-fade-up mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">What are you documenting?</h1>
          <p className="mt-1 text-sm text-gray-500">Pick a document type to get started.</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEMPLATE_CARDS.map((card, i) => {
            const available = card.comingSoon
              ? false
              : documentTypes.some((dt) => dt.name === card.id);
            return (
              <div key={card.id} style={{ '--i': i } as React.CSSProperties}>
                <TemplateCardButton
                  card={card}
                  available={available}
                  busy={creatingId === card.id}
                  onSelect={() => handleSelect(card)}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function TemplateCardButton({
  card,
  available,
  busy,
  onSelect,
}: {
  card: TemplateCard;
  available: boolean;
  busy: boolean;
  onSelect: () => void;
}) {
  const disabled = card.comingSoon || !available || busy;

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      className={`group h-full w-full text-left rounded-xl border p-5 transition-all ${
        card.comingSoon || !available
          ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <FileText className="h-4.5 w-4.5" strokeWidth={1.8} />
        </div>
        {card.comingSoon && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            <Sparkles className="h-3 w-3" /> Coming soon
          </span>
        )}
        {!card.comingSoon && !available && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            Unavailable
          </span>
        )}
      </div>
      <h3 className="mt-3.5 text-[15px] font-semibold leading-snug text-gray-900">{card.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{card.description}</p>
      {!disabled && (
        <p className="mt-4 text-xs font-medium text-brand-700 group-hover:text-brand-800">
          {busy ? 'Starting…' : 'Start →'}
        </p>
      )}
    </button>
  );
}
