import type { Draft, SrsSection, Template } from '../types';

/**
 * The structural/formatting conventions ("house style") the real LLM call
 * should follow when it replaces this mock — lifted from the AIBOS reference
 * SRS. Unused by the mock itself; handed off as-is to whoever wires the real
 * generation endpoint.
 */
export const SRS_HOUSE_STYLE_PROMPT = `
Write in AIBOS house style, adapted from IEEE 830:
- Use "shall" for binding requirements, "should" for strong recommendations, "may" for options.
- Where a section calls for enumerated requirements, use the scheme REQ-[AREA]-[NNN]
  (e.g. REQ-FUNC-010), each with a stated Priority and Acceptance Criteria.
- Write in clear, professional, active-voice prose — no marketing language.
- Never invent facts the author didn't provide; where an answer is missing, say so
  rather than fabricating detail.
`.trim();

export interface GenerateInput {
  template: Template;
  selectedSectionIds: string[];
  answers: Draft['answers'];
  diagrams: Draft['diagrams'];
}

const MOCK_LATENCY_MS = 1400;

function draftSectionProse(section: SrsSection, answers: Draft['answers'], hasDiagram: boolean): string {
  const paragraphs = section.questions
    .map((q) => answers[q.id]?.trim())
    .filter((answer): answer is string => Boolean(answer));

  if (paragraphs.length === 0) {
    return `_No input was provided for ${section.title}. Answer its questions in the wizard, then regenerate this section._`;
  }

  let prose = paragraphs.join('\n\n');
  if (hasDiagram) {
    const kind = section.diagram?.type.toLowerCase() ?? 'diagram';
    prose += `\n\n*(See the attached ${kind} for ${section.title.toLowerCase()}.)*`;
  }
  return prose;
}

/**
 * Stands in for a real LLM call. Same input/output shape a real
 * backend-backed implementation would have — swapping this out later is a
 * drop-in change, no caller updates needed. Also used for single-section
 * regeneration by passing a `selectedSectionIds` array with one entry.
 */
export async function generateDocument(input: GenerateInput): Promise<Record<string, string>> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const result: Record<string, string> = {};
  for (const section of input.template.sections) {
    if (!input.selectedSectionIds.includes(section.id)) continue;
    const hasDiagram = Boolean(section.diagram && input.diagrams[section.id]);
    result[section.id] = draftSectionProse(section, input.answers, hasDiagram);
  }
  return result;
}
