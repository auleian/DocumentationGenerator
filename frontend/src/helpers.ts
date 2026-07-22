import type { Draft, SectionStatus, SrsSection } from './types';
import { SECTIONS } from './data';

export function sectionStatus(section: SrsSection, draft: Draft): SectionStatus {
  const answered = section.questions.filter((q) => {
    const v = draft.answers[q.id];
    return v && v.trim().length > 0;
  }).length;
  if (answered === 0) return 'not_started';
  if (answered === section.questions.length) return 'complete';
  return 'in_progress';
}

export function sectionProgress(section: SrsSection, draft: Draft): number {
  const total = section.questions.length || 1;
  const answered = section.questions.filter((q) => {
    const v = draft.answers[q.id];
    return v && v.trim().length > 0;
  }).length;
  return answered / total;
}

export function overallProgress(draft: Draft): number {
  if (SECTIONS.length === 0) return 0;
  let sum = 0;
  for (const s of SECTIONS) sum += sectionProgress(s, draft);
  return sum / SECTIONS.length;
}

export function statusLabel(s: SectionStatus): string {
  return s === 'not_started' ? 'Not started' : s === 'in_progress' ? 'In progress' : 'Complete';
}

export function statusDotClass(s: SectionStatus): string {
  return s === 'not_started' ? 'bg-gray-300' : s === 'in_progress' ? 'bg-brand-500' : 'bg-brand-600';
}

export function statusTextClass(s: SectionStatus): string {
  return s === 'not_started'
    ? 'text-gray-400'
    : s === 'in_progress'
      ? 'text-brand-600'
      : 'text-brand-700';
}
