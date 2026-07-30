import { useEffect, useRef } from 'react';
import type { ApiSection, Draft, SectionNode } from './types';
import { useSrsCatalog } from './lib/sections';
import { leafNodes } from './lib/catalog';
import { useScreenEnter, staggerRowsIn } from './lib/animations';
import { BookOpen, Check, ArrowRight } from 'lucide-react';

interface SectionPickerProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onContinue: () => void;
  onBack: () => void;
}

type GroupRow =
  | { kind: 'section'; section: ApiSection }
  | { kind: 'subgroup'; name: string; sections: ApiSection[] };

interface TopGroupBucket {
  name: string;
  rows: GroupRow[];
}

/** A curated minimal SRS — the essentials, without the more specialized sections. Real Section.number values. */
const CORE_SECTION_NUMBERS = ['1.1', '1.2', '2.1', '2.2', '2.4', '3.2', '4'];

/**
 * Groups the real section tree for display: a top-level node with no children of its own renders
 * as a single ungrouped section; otherwise its children become either a subgroup header (if that
 * child itself has children) or a direct section row (if it's a leaf) — a fixed 3-level unroll
 * that matches the seeded tree depth exactly.
 */
function groupTree(tree: SectionNode[]): TopGroupBucket[] {
  return tree.map((top) => {
    if (top.children.length === 0) {
      return { name: top.section.name, rows: [{ kind: 'section', section: top.section }] };
    }
    const rows: GroupRow[] = top.children.map((child) =>
      child.children.length > 0
        ? { kind: 'subgroup', name: child.section.name, sections: child.children.map((c) => c.section) }
        : { kind: 'section', section: child.section },
    );
    return { name: top.section.name, rows };
  });
}

export default function SectionPicker({ draft, onUpdateDraft, onContinue, onBack }: SectionPickerProps) {
  const screenRef = useScreenEnter();
  const listRef = useRef<HTMLDivElement>(null);
  const { catalog, loading, error } = useSrsCatalog();

  const tree = catalog?.tree ?? [];
  const leaves = leafNodes(tree);
  const groups = groupTree(tree);
  const selectedCount = draft.selectedSectionIds.length;
  const selectedSections = leaves.filter((n) => draft.selectedSectionIds.includes(n.section.id)).map((n) => n.section);

  useEffect(() => {
    staggerRowsIn(listRef.current, 'button');
    // Only stagger in once, when the section tree first renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  function isSelected(id: string) {
    return draft.selectedSectionIds.includes(id);
  }

  function toggle(id: string) {
    const next = isSelected(id)
      ? draft.selectedSectionIds.filter((sid) => sid !== id)
      : [...draft.selectedSectionIds, id];
    onUpdateDraft({ ...draft, selectedSectionIds: next, lastEdited: 'just now' });
  }

  function selectAll() {
    onUpdateDraft({ ...draft, selectedSectionIds: leaves.map((n) => n.section.id), lastEdited: 'just now' });
  }

  function selectCore() {
    const ids = leaves.filter((n) => CORE_SECTION_NUMBERS.includes(n.section.number)).map((n) => n.section.id);
    onUpdateDraft({ ...draft, selectedSectionIds: ids, lastEdited: 'just now' });
  }

  function clearAll() {
    onUpdateDraft({ ...draft, selectedSectionIds: [], lastEdited: 'just now' });
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
          <button onClick={onBack} className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={screenRef} className="min-h-screen bg-paper">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-8 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">The Documentation Generator</span>
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800">Software Requirements Specification</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8 py-10">
        <div className="animate-fade-up mb-6">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
            Which sections do you need?
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Not every project needs every section — pick what applies, or start from a preset.
            You&apos;ll only be asked questions for the sections you choose.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} of {leaves.length} sections selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              Everything
            </button>
            <button
              onClick={selectCore}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              Core only
            </button>
            <button
              onClick={clearAll}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div ref={listRef} className="space-y-6">
            {groups.map((group) => (
              <div key={group.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {group.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                  {group.rows.map((row) =>
                    row.kind === 'section' ? (
                      <SectionRow
                        key={row.section.id}
                        section={row.section}
                        checked={isSelected(row.section.id)}
                        onToggle={() => toggle(row.section.id)}
                      />
                    ) : (
                      <div key={row.name} className="sm:col-span-2">
                        <div className="mb-2 mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          {row.name}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {row.sections.map((section) => (
                            <SectionRow
                              key={section.id}
                              section={section}
                              checked={isSelected(section.id)}
                              onToggle={() => toggle(section.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Live outline — the payoff: see the document take shape as you choose. */}
          <aside className="rounded-xl border border-gray-200 bg-white shadow-soft overflow-hidden lg:sticky lg:top-8 lg:self-start">
            <div className="border-b border-gray-100 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Your document outline
              </span>
            </div>
            <div className="max-h-[65vh] space-y-1.5 overflow-y-auto px-4 py-3">
              {selectedSections.length === 0 ? (
                <p className="text-xs italic text-gray-400">Nothing selected yet.</p>
              ) : (
                selectedSections.map((s) => (
                  <div key={s.id} className="flex items-baseline gap-2">
                    <span className="shrink-0 font-mono text-[11px] text-brand-600">{s.number}</span>
                    <span className="truncate font-serif text-sm text-gray-800">{s.name}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {selectedCount === 0 && 'Pick at least one section to continue.'}
          </p>
          <button
            onClick={onContinue}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

function SectionRow({
  section,
  checked,
  onToggle,
}: {
  section: ApiSection;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
        checked ? 'border-brand-200 bg-brand-50/30' : 'border-gray-200 bg-white hover:border-brand-300'
      }`}
    >
      <span
        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? 'border-brand-600 bg-brand-600' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs text-gray-400">{section.number}</span>
          <span className="text-sm font-medium text-gray-900">{section.name}</span>
        </span>
      </span>
    </button>
  );
}
