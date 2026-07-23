import type { Draft, SrsSection } from './types';
import { TEMPLATES } from './data';
import { BookOpen, Check, ArrowRight } from 'lucide-react';

interface SectionPickerProps {
  draft: Draft;
  onUpdateDraft: (draft: Draft) => void;
  onContinue: () => void;
  onBack: () => void;
}

type GroupRow =
  | { kind: 'section'; section: SrsSection }
  | { kind: 'subgroup'; name: string; sections: SrsSection[] };

interface TopGroupBucket {
  name: string;
  rows: GroupRow[];
}

/** Groups sections by topGroup, preserving document order; subGroup items are nested. */
function groupSections(sections: SrsSection[]): TopGroupBucket[] {
  const buckets: TopGroupBucket[] = [];
  for (const section of sections) {
    let bucket = buckets.find((b) => b.name === section.topGroup);
    if (!bucket) {
      bucket = { name: section.topGroup, rows: [] };
      buckets.push(bucket);
    }
    if (section.subGroup) {
      const existing = bucket.rows.find(
        (r): r is Extract<GroupRow, { kind: 'subgroup' }> => r.kind === 'subgroup' && r.name === section.subGroup,
      );
      if (existing) {
        existing.sections.push(section);
      } else {
        bucket.rows.push({ kind: 'subgroup', name: section.subGroup, sections: [section] });
      }
    } else {
      bucket.rows.push({ kind: 'section', section });
    }
  }
  return buckets;
}

export default function SectionPicker({ draft, onUpdateDraft, onContinue, onBack }: SectionPickerProps) {
  const template = TEMPLATES.find((t) => t.id === draft.templateId);
  const sections = template?.sections ?? [];
  const groups = groupSections(sections);
  const selectedCount = draft.selectedSectionIds.length;

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
    onUpdateDraft({ ...draft, selectedSectionIds: sections.map((s) => s.id), lastEdited: 'just now' });
  }

  function clearAll() {
    onUpdateDraft({ ...draft, selectedSectionIds: [], lastEdited: 'just now' });
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
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

      <main className="mx-auto max-w-3xl px-8 py-10">
        <div className="animate-fade-up mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Which sections do you need?
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Not every project needs every section — pick what applies. You&apos;ll only be asked
              questions for the sections you choose.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} of {sections.length} sections selected
          </span>
          <div className="flex items-center gap-3 text-xs font-medium">
            <button onClick={selectAll} className="text-brand-700 hover:text-brand-800">
              Select all
            </button>
            <span className="text-gray-300">·</span>
            <button onClick={clearAll} className="text-gray-500 hover:text-gray-700">
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {group.name}
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {group.rows.map((row) =>
                  row.kind === 'section' ? (
                    <SectionRow
                      key={row.section.id}
                      section={row.section}
                      checked={isSelected(row.section.id)}
                      onToggle={() => toggle(row.section.id)}
                    />
                  ) : (
                    <div key={row.name}>
                      <div className="bg-gray-50/30 px-4 py-1.5">
                        <span className="text-[11px] font-medium text-gray-400">{row.name}</span>
                      </div>
                      {row.sections.map((section) => (
                        <SectionRow
                          key={section.id}
                          section={section}
                          checked={isSelected(section.id)}
                          onToggle={() => toggle(section.id)}
                          indent
                        />
                      ))}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
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
  indent,
}: {
  section: SrsSection;
  checked: boolean;
  onToggle: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        indent ? 'pl-8' : ''
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
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">{section.id}</span>
          <span className="text-sm font-medium text-gray-900">{section.title}</span>
          {section.optional && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              optional
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-gray-500">{section.description}</span>
      </span>
    </button>
  );
}
