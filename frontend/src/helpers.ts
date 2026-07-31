import type { Draft, SectionNode, SectionStatus } from './types';
import { leafSectionProgress, leafSectionStatus } from './lib/catalog';

export function sectionStatus(node: SectionNode, draft: Draft): SectionStatus {
  return leafSectionStatus(node, draft.answers);
}

export function sectionProgress(node: SectionNode, draft: Draft): number {
  return leafSectionProgress(node, draft.answers);
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

/** Turns a draft title into a safe filename stem, e.g. "AIBOS EMS SRS" -> "aibos-ems-srs". */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-srs'
  );
}
