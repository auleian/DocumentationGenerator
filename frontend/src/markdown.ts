import type { Draft, SrsSection } from './types';

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

function questionNumber(sectionId: string, qIdx: number): string {
  return `${sectionId}.${qIdx + 1}`;
}

/**
 * Raw-answer preview (what the author has typed so far, before generation).
 * Used by the Wizard's live preview panel while answering questions.
 */
export function buildDocumentHtml(draft: Draft, sections: SrsSection[]): string {
  let html = '';
  html += `<div class="doc-cover">`;
  html += `<div class="doc-eyebrow">Software Requirements Specification</div>`;
  html += `<h1 class="doc-title">${esc(draft.title)}</h1>`;
  if (draft.subtitle) html += `<p class="doc-subtitle">${esc(draft.subtitle)}</p>`;
  html += `</div>`;

  for (const section of sections) {
    html += renderSection(section, draft);
  }
  return html;
}

function renderSection(s: SrsSection, draft: Draft): string {
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
      html += `<img class="doc-diagram" src="${attached.dataUrl}" alt="${esc(attached.fileName)}" />`;
      html += `<p class="doc-attached">Attached: <code>${esc(attached.fileName)}</code></p>`;
    } else {
      html += `<p class="md-placeholder">No diagram attached yet.</p>`;
    }
    html += `</div>`;
  }

  html += `</section>`;
  return html;
}

/** Real Markdown text of the generated document, for export. */
export function buildGeneratedMarkdown(draft: Draft, sections: SrsSection[]): string {
  let md = `# ${draft.title}\n\n`;
  if (draft.subtitle) md += `*${draft.subtitle}*\n\n`;
  md += `---\n\n`;

  for (const section of sections) {
    md += renderGeneratedSectionMarkdown(section, draft);
  }
  return md;
}

function renderGeneratedSectionMarkdown(s: SrsSection, draft: Draft): string {
  let md = `## ${s.id} ${s.title}\n\n`;

  const content = draft.generated[s.id];
  md += content ? `${content}\n\n` : `_Not generated yet._\n\n`;

  const attached = s.diagram ? draft.diagrams[s.id] : undefined;
  if (attached) {
    md += `![${attached.fileName}](${attached.dataUrl})\n\n`;
  }

  return md;
}
