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
  /** IEEE number, e.g. "1", "2", "3.1" */
  id: string;
  title: string;
  description: string;
  questions: Question[];
  diagram?: DiagramSpec;
}

export type SectionStatus = 'not_started' | 'in_progress' | 'complete';

export interface Draft {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  lastEdited: string;
  answers: Record<string, string>;
  diagrams: Record<string, DiagramAttachment>;
}

export type Screen = 'home' | 'drafts' | 'wizard' | 'review';
