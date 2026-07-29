import type { ApiDocumentType, ApiQuestion, ApiSection } from '../types';

export function documentTypeIdByName(documentTypes: ApiDocumentType[], name: string): string | undefined {
  return documentTypes.find((d) => d.name === name)?.id;
}

/** The top-level (parent=null) sections for a document type, in order — exactly what next_section walks. */
export function topLevelSections(
  sections: ApiSection[],
  documentTypes: ApiDocumentType[],
  documentTypeName: string,
): ApiSection[] {
  const typeId = documentTypeIdByName(documentTypes, documentTypeName);
  if (!typeId) return [];
  return sections
    .filter((s) => s.document_type === typeId && s.parent === null)
    .sort((a, b) => a.order - b.order);
}

/** Maps a question id to the (sub)section it belongs to — used to group next_section's flat question list for display. */
export function sectionByQuestionId(sections: ApiSection[], questions: ApiQuestion[]): Map<string, ApiSection> {
  const sectionsById = new Map(sections.map((s) => [s.id, s]));
  const map = new Map<string, ApiSection>();
  for (const q of questions) {
    const section = sectionsById.get(q.section);
    if (section) map.set(q.id, section);
  }
  return map;
}
