import { useEffect, useRef } from 'react';
import type { Draft } from './types';
import { TEMPLATES } from './data';
import { useScreenEnter } from './lib/animations';
import { updateSession } from './lib/api';
import { BookOpen, ArrowRight } from 'lucide-react';

const SAVE_DEBOUNCE_MS = 600;

interface ProjectDetailsProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function ProjectDetails({ draft, onUpdateDraft, onContinue, onBack }: ProjectDetailsProps) {
  const screenRef = useScreenEnter();
  const template = TEMPLATES.find((t) => t.id === draft.templateId);

  const nameValid = draft.title.trim().length > 0;
  const sessionId = draft.sessionId;
  const saveTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  function scheduleSave(title: string, description: string) {
    if (!sessionId) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      updateSession(sessionId, { title, description }).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
  }

  function setTitle(title: string) {
    onUpdateDraft({ ...draft, title, lastEdited: 'just now' });
    scheduleSave(title, draft.subtitle);
  }

  function setSubtitle(subtitle: string) {
    onUpdateDraft({ ...draft, subtitle, lastEdited: 'just now' });
    scheduleSave(draft.title, subtitle);
  }

  async function handleContinue() {
    window.clearTimeout(saveTimer.current);
    if (sessionId) {
      try {
        await updateSession(sessionId, { title: draft.title, description: draft.subtitle });
      } catch {
        // best-effort — don't block navigation on a save failure
      }
    }
    onContinue();
  }

  return (
    <div ref={screenRef} className="min-h-screen bg-paper">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-8 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">The Documentation Generator</span>
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">{template?.name ?? 'Document'}</span>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-8 py-16">
        <div className="animate-fade-up mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
            What are we documenting?
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            This names the document itself — it's what shows up on the title page, your
            drafts list, and everywhere else you see this document.
          </p>
        </div>

        <div className="animate-fade-up space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-soft">
          <div>
            <label htmlFor="project-name" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Project name <span className="text-brand-700">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              autoFocus
              value={draft.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fieldwire Inspections App"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Short description
            </label>
            <input
              id="project-description"
              type="text"
              value={draft.subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Offline-first inspections for site operators"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1.5 text-xs text-gray-400">Optional — a one-line summary shown under the title.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">{!nameValid && 'Give the project a name to continue.'}</p>
          <button
            onClick={handleContinue}
            disabled={!nameValid}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
