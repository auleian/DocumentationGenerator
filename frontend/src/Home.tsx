import {
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
  ListChecks,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { TEMPLATES } from './data';
import { useScreenEnter } from './lib/animations';

interface HomeProps {
  onBrowseDrafts: () => void;
  onStartNew: () => void;
}

const HOW_IT_WORKS = [
  {
    icon: ListChecks,
    title: 'Pick sections, answer questions',
    body: 'Choose only the sections that apply to your project — no forced boilerplate.',
  },
  {
    icon: Sparkles,
    title: 'AI drafts it in house style',
    body: 'Your answers become properly structured, numbered, shall/should/may prose.',
  },
  {
    icon: FileCheck2,
    title: 'Review, edit, export',
    body: 'Tweak or regenerate any section, then ship it as Word, PDF, or Markdown.',
  },
];

export default function Home({ onBrowseDrafts, onStartNew }: HomeProps) {
  const screenRef = useScreenEnter();

  return (
    <div ref={screenRef} className="min-h-screen bg-paper relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-100/60 blur-3xl opacity-70" />
        <div className="absolute top-40 -left-32 h-[360px] w-[360px] rounded-full bg-brand-100/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e7e2d8 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-200/70">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-700 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">The Documentation Generator</span>
          </div>
          <button
            onClick={onBrowseDrafts}
            className="text-sm text-gray-500 hover:text-brand-700 transition-colors font-medium"
          >
            My drafts
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-8 pt-20 pb-24">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-start">
          <div className="max-w-xl">
            <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 mb-6">
              <Layers className="h-3 w-3" />
              AIBOS documentation platform
            </div>
            <h1
              className="animate-fade-up font-serif text-5xl font-semibold tracking-tight text-gray-900 leading-[1.08]"
              style={{ animationDelay: '60ms' }}
            >
              The documents your project needs,
              <br />
              <span className="text-brand-700">written together.</span>
            </h1>
            <p
              className="animate-fade-up mt-5 text-lg text-gray-500 leading-relaxed"
              style={{ animationDelay: '120ms' }}
            >
              Pick a document type, answer a few guided questions, and let AIBOS draft it in
              house style. Software Requirements Specifications are live today — design docs
              and runbooks are on the way.
            </p>
            <div
              className="animate-fade-up mt-8 flex items-center gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <button
                onClick={onStartNew}
                className="group inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-all hover:shadow-soft"
              >
                Start a new document
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onBrowseDrafts}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Browse drafts
              </button>
            </div>
          </div>

          {/* Live document preview */}
          <div
            className="animate-fade-up rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden"
            style={{ animationDelay: '220ms' }}
          >
            <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-2 text-[11px] text-gray-400">
              <FileText className="h-3.5 w-3.5" />
              <span className="font-mono">fieldwire-inspections-srs.md</span>
            </div>
            <div className="px-7 py-6 md-doc">
              <div className="doc-eyebrow">Software Requirements Specification</div>
              <h2 className="doc-title !text-2xl">Fieldwire Inspections App</h2>
              <p className="doc-subtitle">Offline-first inspections for site operators</p>
              <div className="doc-section !mt-5">
                <h3 className="doc-h2 !mt-0 !text-base !border-0 !pb-0">
                  <span className="doc-num">2.1</span> Product Perspective
                </h3>
                <div className="doc-question">
                  <p>
                    Fieldwire sits between the on-site inspection team and the central
                    asset-management platform, syncing inspection records once connectivity is
                    restored.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-7 pb-5 -mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
                <Sparkles className="h-3 w-3" /> Drafted in AIBOS house style
              </span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="stagger mt-24 grid grid-cols-1 md:grid-cols-3 gap-5">
          {HOW_IT_WORKS.map((f, i) => (
            <div
              key={f.title}
              style={{ '--i': i } as React.CSSProperties}
              className="group rounded-xl border border-gray-200 bg-white/80 backdrop-blur p-5 hover:border-brand-300 hover:shadow-soft transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <f.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Document types */}
        <div className="mt-24">
          <h2 className="font-serif text-2xl font-semibold text-gray-900">One platform, every document.</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Start with what's live today; more document types ship on the same foundation.
          </p>
          <div className="stagger mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map((template, i) => {
              const disabled = Boolean(template.comingSoon);
              return (
                <div
                  key={template.id}
                  style={{ '--i': i } as React.CSSProperties}
                  onClick={disabled ? undefined : onStartNew}
                  className={`rounded-xl border p-5 transition-all ${
                    disabled
                      ? 'border-gray-200 bg-white/60 cursor-default'
                      : 'cursor-pointer border-gray-200 bg-white hover:border-brand-300 hover:shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <FileText className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </div>
                    {disabled && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3.5 text-[15px] font-semibold text-gray-900">{template.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{template.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
