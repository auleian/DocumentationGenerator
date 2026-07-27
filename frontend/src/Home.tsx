import { BookOpen, FileText, ArrowRight, Sparkles, ListChecks, FileCheck2 } from 'lucide-react';

interface HomeProps {
  onBrowseDrafts: () => void;
  onNewSrs: () => void;
}

export default function Home({ onBrowseDrafts, onNewSrs }: HomeProps) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-50 blur-3xl opacity-70" />
        <div className="absolute top-40 -left-32 h-[360px] w-[360px] rounded-full bg-brand-100/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[15px] font-semibold text-gray-900">The Documentation Generator</span>
          </div>
          <button
            onClick={onBrowseDrafts}
            className="text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium"
          >
            My drafts
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-8 pt-20 pb-24">
        <div className="max-w-2xl">
          <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 mb-6">
            <Sparkles className="h-3 w-3" />
            Guided SRS authoring
          </div>
          <h1
            className="animate-fade-up text-5xl font-bold tracking-tight text-gray-900 leading-[1.05]"
            style={{ animationDelay: '60ms' }}
          >
            Write specifications,
            <br />
            <span className="text-brand-600">section by section.</span>
          </h1>
          <p
            className="animate-fade-up mt-5 text-lg text-gray-500 leading-relaxed max-w-xl"
            style={{ animationDelay: '120ms' }}
          >
            Answer a few guided questions per section and watch a clean, IEEE-structured
            Software Requirements Specification assemble itself in real time.
          </p>
          <div
            className="animate-fade-up mt-8 flex items-center gap-3"
            style={{ animationDelay: '180ms' }}
          >
            <button
              onClick={onNewSrs}
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-all hover:shadow-soft"
            >
              Start a new SRS
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onBrowseDrafts}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Browse drafts
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="stagger mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: ListChecks,
              title: 'Guided questions',
              body: 'Each section prompts you with the right questions — no blank page paralysis.',
              style: { '--i': 0 } as React.CSSProperties,
            },
            {
              icon: FileText,
              title: 'Live preview',
              body: 'A Markdown document assembles itself as you type, with proper IEEE numbering.',
              style: { '--i': 1 } as React.CSSProperties,
            },
            {
              icon: FileCheck2,
              title: 'Export-ready',
              body: 'Ship a clean, readable SRS to Markdown or PDF when you are done.',
              style: { '--i': 2 } as React.CSSProperties,
            },
          ].map((f) => (
            <div
              key={f.title}
              style={f.style}
              className="group rounded-xl border border-gray-200 bg-white/80 backdrop-blur p-5 hover:border-brand-300 hover:shadow-soft transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <f.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
