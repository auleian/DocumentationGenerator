export type QuestionType = 'text' | 'textarea' | 'select';

export interface Question {
  id: string;
  label: string;
  /** Title used in the assembled IEEE document (e.g. "Purpose") */
  docTitle: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
  help?: string;
}

export interface DiagramSpec {
  type: string;
  reason: string;
}

/** An author-supplied diagram image attached to a section's diagram slot. */
export interface DiagramAttachment {
  dataUrl: string;
  fileName: string;
}

export interface SrsSection {
  /** IEEE number, e.g. "1.1", "3.1.2" */
  id: string;
  title: string;
  description: string;
  questions: Question[];
  diagram?: DiagramSpec;
  /** True only for sections that don't apply to every project (e.g. AI/ML). */
  optional?: boolean;
  /** Top-level grouping for the section picker, e.g. "3. Requirements". */
  topGroup: string;
  /** Mid-level grouping within a topGroup, e.g. "3.1 External Interfaces". Omit for direct children. */
  subGroup?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  sections: SrsSection[];
  /** Shown disabled with a "Coming soon" badge in the template picker. */
  comingSoon?: boolean;
}

export type SectionStatus = 'not_started' | 'in_progress' | 'complete';

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export interface Draft {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  lastEdited: string;
  templateId: string;
  /** IDs of the sections the author chose to include, from the template's tree. */
  selectedSectionIds: string[];
  answers: Record<string, string>;
  diagrams: Record<string, DiagramAttachment>;
  /** AI-generated (and possibly author-edited) prose per section, keyed by section id. */
  generated: Record<string, string>;
  generationStatus: GenerationStatus;
}

export type Screen =
  | 'home'
  | 'drafts'
  | 'templates'
  | 'details'
  | 'sections'
  | 'wizard'
  | 'generate'
  | 'review';
