import type {
  ApiAnswer,
  ApiDocumentType,
  ApiGeneratedDocument,
  ApiGeneratedSection,
  ApiQuestion,
  ApiSection,
  DocumentSession,
  ExportFormat,
  GeneratedSectionStatus,
  NextSectionResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/';

/** Turns a relative path returned by the backend (e.g. a FileField url like "/media/exports/x.pdf") into a fetchable absolute URL. */
export function resolveMediaUrl(path: string): string {
  const origin = BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${init?.method ?? 'GET'} ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listDocumentTypes(): Promise<ApiDocumentType[]> {
  return request('document-types/');
}

export function listSections(): Promise<ApiSection[]> {
  return request('sections/');
}

export function listQuestions(): Promise<ApiQuestion[]> {
  return request('question/');
}

export function createSession(documentType: string): Promise<DocumentSession> {
  return request('document-sessions/', {
    method: 'POST',
    body: JSON.stringify({ document_type: documentType }),
  });
}

export function getSession(id: string): Promise<DocumentSession> {
  return request(`document-sessions/${id}/`);
}

export function listSessions(): Promise<DocumentSession[]> {
  return request('document-sessions/');
}

export function updateSession(
  id: string,
  patch: Partial<Pick<DocumentSession, 'title' | 'description'>>,
): Promise<DocumentSession> {
  return request(`document-sessions/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export function deleteSession(id: string): Promise<void> {
  return request(`document-sessions/${id}/`, { method: 'DELETE' });
}

export function getNextSection(sessionId: string): Promise<NextSectionResponse> {
  return request(`document-sessions/${sessionId}/next_section/`);
}

/** Repolishes exactly one section on demand (used by Review's "Regenerate section"), unlike next_section which walks the whole tree. */
export function repolishSection(
  sessionId: string,
  sectionId: string,
): Promise<{ id: string; section: string; status: GeneratedSectionStatus }> {
  return request(`document-sessions/${sessionId}/repolish_section/?section=${sectionId}`, {
    method: 'POST',
  });
}

export function createAnswer(session: string, question: string, value: string): Promise<ApiAnswer> {
  return request('answers/', {
    method: 'POST',
    body: JSON.stringify({ session, question, value }),
  });
}

export function updateAnswer(id: string, value: string): Promise<ApiAnswer> {
  return request(`answers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  });
}

export function listGeneratedSections(): Promise<ApiGeneratedSection[]> {
  return request('generated-sections/');
}

/** Persists a manual edit to a section's polished content (Review's "Edit" flow). */
export function updateGeneratedSectionContent(id: string, content: string): Promise<ApiGeneratedSection> {
  return request(`generated-sections/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
}

export function triggerDocumentGeneration(
  sessionId: string,
): Promise<{ id: string; status: string; content: string }> {
  return request(`document-sessions/${sessionId}/generate/`, { method: 'POST' });
}

export function getGeneratedDocument(id: string): Promise<ApiGeneratedDocument> {
  return request(`generated-documents/${id}/`);
}

export function listGeneratedDocuments(): Promise<ApiGeneratedDocument[]> {
  return request('generated-documents/');
}

export function exportGeneratedDocument(
  documentId: string,
  format: ExportFormat,
): Promise<{ id: string; file: string; status: string; reused: boolean }> {
  return request(`generated-documents/${documentId}/export/?format=${format}`, { method: 'POST' });
}
