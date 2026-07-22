import type { Draft, SrsSection } from './types';
import { SECTIONS } from './data';

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function paragraphs(text: string): string {
  return text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => `<p>${esc(l)}</p>`)
    .join('');
}

function answerHtml(draft: Draft, qId: string, placeholder: string): string {
  const v = draft.answers[qId];
  if (v && v.trim()) return paragraphs(v);
  return `<p class="md-placeholder">${esc(placeholder)}</p>`;
}

function sectionNumber(s: SrsSection, idx: number): string {
  // IEEE numbering: top-level sections are 1, 2, 3...
  // subsections under "3" are 3.1, 3.2, 3.3...
  return s.id;
}

function questionNumber(sectionId: string, qIdx: number): string {
  return `${sectionId}.${qIdx + 1}`;
}

export function buildDocumentHtml(draft: Draft, opts?: { onlySectionId?: string }): string {
  const sections = opts?.onlySectionId
    ? SECTIONS.filter((s) => s.id === opts.onlySectionId)
    : SECTIONS;

  let html = '';
  html += `<div class="doc-cover">`;
  html += `<div class="doc-eyebrow">Software Requirements Specification</div>`;
  html += `<h1 class="doc-title">${esc(draft.title)}</h1>`;
  if (draft.subtitle) html += `<p class="doc-subtitle">${esc(draft.subtitle)}</p>`;
  html += `</div>`;

  for (let i = 0; i < sections.length; i++) {
    html += renderSection(sections[i], draft, i);
  }
  return html;
}

function renderSection(s: SrsSection, draft: Draft, _idx: number): string {
  let html = `<section class="doc-section">`;
  html += `<h2 class="doc-h2"><span class="doc-num">${esc(s.id)}</span> ${esc(s.title)}</h2>`;
  html += `<p class="doc-desc">${esc(s.description)}</p>`;

  for (let q = 0; q < s.questions.length; q++) {
    const question = s.questions[q];
    const qnum = questionNumber(s.id, q);
    html += `<div class="doc-question">`;
    html += `<h3 class="doc-h3"><span class="doc-num">${esc(qnum)}</span> ${esc(question.docTitle)}</h3>`;
    html += answerHtml(draft, question.id, 'Not yet answered.');
    html += `</div>`;
  }

  if (s.diagram) {
    const attached = draft.diagrams[s.id];
    const dnum = questionNumber(s.id, s.questions.length);
    html += `<div class="doc-question">`;
    html += `<h3 class="doc-h3"><span class="doc-num">${esc(dnum)}</span> Diagram</h3>`;
    html += `<p><span class="doc-tag">${esc(s.diagram.type)}</span> — ${esc(s.diagram.reason)}</p>`;
    if (attached) {
      html += `<p class="doc-attached">Attached: <code>${esc(attached)}</code></p>`;
    } else {
      html += `<p class="md-placeholder">No diagram attached yet.</p>`;
    }
    html += `</div>`;
  }

  html += `</section>`;
  return html;
}
