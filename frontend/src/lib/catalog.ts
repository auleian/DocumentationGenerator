import type { ApiDocumentType, ApiQuestion, ApiSection, SectionNode } from '../types';

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

/**
 * Reconstructs the section tree from the flat, parent-linked ApiSection[] the backend returns.
 * A node with no children is a leaf (has its own questions, selectable/answerable); a node with
 * children is a container (grouping only — never itself selectable, never has its own questions
 * in the seeded data).
 */
export function buildSectionTree(sections: ApiSection[], questions: ApiQuestion[]): SectionNode[] {
  const questionsBySection = new Map<string, ApiQuestion[]>();
  for (const q of questions) {
    const list = questionsBySection.get(q.section);
    if (list) list.push(q);
    else questionsBySection.set(q.section, [q]);
  }
  for (const list of questionsBySection.values()) list.sort((a, b) => a.order - b.order);

  const childrenByParent = new Map<string | null, ApiSection[]>();
  for (const s of sections) {
    const list = childrenByParent.get(s.parent);
    if (list) list.push(s);
    else childrenByParent.set(s.parent, [s]);
  }
  for (const list of childrenByParent.values()) list.sort((a, b) => a.order - b.order);

  function buildNode(section: ApiSection): SectionNode {
    const children = (childrenByParent.get(section.id) ?? []).map(buildNode);
    return { section, questions: questionsBySection.get(section.id) ?? [], children };
  }

  return (childrenByParent.get(null) ?? []).map(buildNode);
}

/** Flattens a section tree to just its leaf nodes (no children), depth-first — the answerable/selectable sections. */
export function leafNodes(tree: SectionNode[]): SectionNode[] {
  const result: SectionNode[] = [];
  function walk(nodes: SectionNode[]) {
    for (const node of nodes) {
      if (node.children.length === 0) result.push(node);
      else walk(node.children);
    }
  }
  walk(tree);
  return result;
}
