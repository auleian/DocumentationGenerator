import type { Template } from './types';
import { TEMPLATES } from './data';
import { useScreenEnter } from './lib/animations';
import { BookOpen, FileText, Sparkles } from 'lucide-react';

interface TemplatePickerProps {
  onSelect: (templateId: string) => void;
  onBackHome: () => void;
}

export default function TemplatePicker({ onSelect, onBackHome }: TemplatePickerProps) {
  const screenRef = useScreenEnter();

  return (
    <div ref={screenRef} className="min-h-screen bg-gray-50/60">
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
          <p className="mt-1 text-sm text-gray-500">
            Pick a document type. You&apos;ll choose which sections apply next.
          </p>
        </div>

        <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEMPLATES.map((template, i) => (
            <div key={template.id} style={{ '--i': i } as React.CSSProperties}>
              <TemplateCard template={template} onSelect={() => onSelect(template.id)} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function TemplateCard({ template, onSelect }: { template: Template; onSelect: () => void }) {
  const disabled = Boolean(template.comingSoon);

  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      className={`group h-full w-full text-left rounded-xl border p-5 transition-all ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <FileText className="h-4.5 w-4.5" strokeWidth={1.8} />
        </div>
        {disabled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            <Sparkles className="h-3 w-3" /> Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-3.5 text-[15px] font-semibold leading-snug text-gray-900">{template.name}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{template.description}</p>
      {!disabled && (
        <p className="mt-4 text-xs font-medium text-brand-700 group-hover:text-brand-800">
          {template.sections.length} sections available →
        </p>
      )}
    </button>
  );
}
