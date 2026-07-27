import type {
  ApiAnswer,
  ApiDocumentType,
  ApiGeneratedDocument,
  ApiGeneratedSection,
  ApiQuestion,
  ApiSection,
  DocumentSession,
  NextSectionResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/';

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

export function getNextSection(sessionId: string): Promise<NextSectionResponse> {
  return request(`document-sessions/${sessionId}/next_section/`);
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

export function generateDocument(
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
