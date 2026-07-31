import type { ApiAnswer, ApiGeneratedSection, DiagramAttachment, DocumentSession, Draft } from '../types';
import { listAnswers, listGeneratedSections, listSessions } from './api';
import { computeSectionSummary, leafNodes } from './catalog';
import { loadSrsCatalog } from './sections';

function draftFromSession(
  session: DocumentSession,
  answers: ApiAnswer[],
  generatedSections: ApiGeneratedSection[],
  leaves: ReturnType<typeof leafNodes>,
): Draft {
  const sessionAnswers = answers.filter((a) => a.session === session.id);
  const draftAnswers: Record<string, string> = {};
  const answerIds: Record<string, string> = {};
  for (const a of sessionAnswers) {
    draftAnswers[a.question] = a.value;
    answerIds[a.question] = a.id;
  }

  const sessionGeneratedSections = generatedSections.filter((gs) => gs.session === session.id);
  const generated: Record<string, string> = {};
  const generatedSectionIds: Record<string, string> = {};
  const diagrams: Record<string, DiagramAttachment> = {};
  for (const gs of sessionGeneratedSections) {
    if (gs.status === 'ready') generated[gs.section] = gs.content;
    generatedSectionIds[gs.section] = gs.id;
    if (gs.diagram_data_url) {
      diagrams[gs.section] = { dataUrl: gs.diagram_data_url, fileName: gs.diagram_file_name };
    }
  }

  const answeredIds = leaves
    .filter((n) => n.questions.some((q) => (draftAnswers[q.id] ?? '').trim().length > 0))
    .map((n) => n.section.id);
  const selectedSectionIds = answeredIds.length > 0 ? answeredIds : leaves.map((n) => n.section.id);

  return {
    id: session.id,
    title: session.title,
    subtitle: session.description,
    lastEdited: new Date(session.created_at).toLocaleString(),
    templateId: session.document_type,
    selectedSectionIds,
    answers: draftAnswers,
    diagrams,
    generated,
    generationStatus: 'idle',
    sessionId: session.id,
    answerIds,
    generatedSectionIds,
    generatedDocumentId: null,
    sectionSummary: computeSectionSummary(leaves, selectedSectionIds, draftAnswers),
  };
}

/**
 * Reconstructs a Draft for every session the backend knows about, regardless
 * of what's already in local state — callers dedupe against their own state
 * when merging (see App.tsx), which keeps this safe to call from a
 * StrictMode-doubled effect. Best-effort: returns [] on any fetch failure.
 */
export async function rehydrateDrafts(): Promise<Draft[]> {
  try {
    const [sessions, answers, generatedSections, catalog] = await Promise.all([
      listSessions(),
      listAnswers(),
      listGeneratedSections(),
      loadSrsCatalog(),
    ]);
    const leaves = leafNodes(catalog.tree);
    return sessions.map((session) => draftFromSession(session, answers, generatedSections, leaves));
  } catch {
    return [];
  }
}
