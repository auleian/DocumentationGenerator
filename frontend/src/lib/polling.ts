import type { ApiGeneratedSection, GeneratedSectionStatus } from '../types';
import { listGeneratedSections, repolishSection } from './api';

const DEFAULT_INTERVAL_MS = 1500;
const DEFAULT_TIMEOUT_MS = 60_000;

const SETTLED: GeneratedSectionStatus[] = ['ready', 'failed'];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTargeted(sessionId: string, sectionIds: string[]): Promise<ApiGeneratedSection[]> {
  const all = await listGeneratedSections();
  return all.filter((gs) => gs.session === sessionId && sectionIds.includes(gs.section));
}

/** Polls generated-sections for `sectionIds` until every one is ready/failed, or `timeoutMs` elapses. */
export async function pollUntilSettled(
  sessionId: string,
  sectionIds: string[],
  options: { intervalMs?: number; timeoutMs?: number; onUpdate?: (rows: ApiGeneratedSection[]) => void } = {},
): Promise<ApiGeneratedSection[]> {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

  if (sectionIds.length === 0) return [];

  while (true) {
    const rows = await fetchTargeted(sessionId, sectionIds);
    options.onUpdate?.(rows);

    const allSettled =
      sectionIds.length === rows.length && rows.every((gs) => SETTLED.includes(gs.status));
    if (allSettled || Date.now() >= deadline) return rows;

    await sleep(intervalMs);
  }
}

/**
 * Triggers backend polishing for `sectionIds` and waits for them to settle.
 * Sections already `ready` are skipped unless `force` is set (used by Review's
 * explicit "Regenerate" action, where the author wants a fresh pass regardless).
 */
export async function polishSections(
  sessionId: string,
  sectionIds: string[],
  options: { force?: boolean; onUpdate?: (rows: ApiGeneratedSection[]) => void } = {},
): Promise<ApiGeneratedSection[]> {
  if (sectionIds.length === 0) return [];

  let toPolish = sectionIds;
  if (!options.force) {
    const existing = await fetchTargeted(sessionId, sectionIds);
    const readyIds = new Set(existing.filter((gs) => gs.status === 'ready').map((gs) => gs.section));
    toPolish = sectionIds.filter((id) => !readyIds.has(id));
  }

  if (toPolish.length > 0) {
    await Promise.allSettled(toPolish.map((id) => repolishSection(sessionId, id)));
  }

  return pollUntilSettled(sessionId, sectionIds, { onUpdate: options.onUpdate });
}
