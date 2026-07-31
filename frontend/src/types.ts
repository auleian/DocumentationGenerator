/** An author-supplied diagram image attached to a section's diagram slot. */
export interface DiagramAttachment {
  dataUrl: string;
  fileName: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  /** Shown disabled with a "Coming soon" badge in the template picker. */
  comingSoon?: boolean;
}

export type SectionStatus = 'not_started' | 'in_progress' | 'complete';

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export interface Draft {
  id: string;
  title: string;
  subtitle: string;
  lastEdited: string;
  templateId: string;
  /** IDs of the sections the author chose to include, from the template's tree. */
  selectedSectionIds: string[];
  answers: Record<string, string>;
  diagrams: Record<string, DiagramAttachment>;
  /** AI-generated (and possibly author-edited) prose per section, keyed by real Section id. */
  generated: Record<string, string>;
  generationStatus: GenerationStatus;
  /** Real backend DocumentSession id backing this draft; null for legacy/local-only drafts. */
  sessionId: string | null;
  /** Question id -> Answer id, so the Wizard knows whether to POST or PATCH a given answer. */
  answerIds: Record<string, string>;
  /** Section id -> GeneratedSection id, so Review knows which row to PATCH when saving an edit. */
  generatedSectionIds: Record<string, string>;
  /** Real GeneratedDocument id, set once /generate/ has succeeded at least once. */
  generatedDocumentId: string | null;
  /** Cached section-completion counts so Dashboard can render without its own fetch. */
  sectionSummary: { total: number; complete: number; inProgress: number };
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

// --- Backend API types (see lib/api.ts, lib/catalog.ts, lib/sections.ts) ---

export interface ApiDocumentType {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
}

export interface ApiSection {
  id: string;
  number: string;
  name: string;
  order: number;
  parent: string | null;
  document_type: string;
  created_at: string;
  updated_at: string;
}

export interface ApiQuestion {
  id: string;
  text: string;
  section: string;
  order: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiAnswer {
  id: string;
  session: string;
  question: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export type GeneratedSectionStatus = 'pending' | 'polishing' | 'ready' | 'failed';

export interface ApiGeneratedSection {
  id: string;
  session: string;
  section: string;
  content: string;
  diagram_data_url: string;
  diagram_file_name: string;
  status: GeneratedSectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ApiGeneratedDocument {
  id: string;
  session: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type DocumentSessionStatus =
  | 'in_progress'
  | 'answers_complete'
  | 'generating'
  | 'generated'
  | 'exported';

export interface DocumentSession {
  id: string;
  document_type: string;
  title: string;
  description: string;
  status: DocumentSessionStatus;
  created_at: string;
  expires_at: string | null;
}

/** GET .../next_section/ — discriminated union, callers must branch on shape. */
export type NextSectionResponse =
  | { section: { number: string; name: string }; questions: ApiQuestionStub[] }
  | { message: string; status: DocumentSessionStatus };

export interface ApiQuestionStub {
  id: string;
  text: string;
  is_required: boolean;
}

export type ExportFormat = 'html' | 'pdf' | 'docx';

/** A Section node with its own questions and its children, built from the flat ApiSection[]/ApiQuestion[] lists. */
export interface SectionNode {
  section: ApiSection;
  questions: ApiQuestion[];
  children: SectionNode[];
}
