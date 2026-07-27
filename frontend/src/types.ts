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

/** Static display card for the template picker; not all of these exist as a backend DocumentType yet. */
export interface TemplateCard {
  id: string;
  name: string;
  description: string;
  comingSoon?: boolean;
}

export type Screen = 'home' | 'drafts' | 'templates' | 'wizard' | 'generate' | 'review';
