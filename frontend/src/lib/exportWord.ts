import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx';
import type { Draft, SrsSection } from '../types';

const MIME_TO_DOCX_TYPE: Record<string, 'jpg' | 'png' | 'gif' | 'bmp'> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
};

const MAX_IMAGE_WIDTH = 500;

function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  return match ? { mime: match[1], base64: match[2] } : null;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => reject(new Error('Could not read image dimensions'));
    img.src = dataUrl;
  });
}

function scaleToMaxWidth(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (width <= maxWidth) return { width, height };
  const ratio = maxWidth / width;
  return { width: maxWidth, height: Math.round(height * ratio) };
}

/** Returns null (skip embedding) for formats Word's OOXML image part doesn't take directly, e.g. SVG. */
async function buildImageParagraph(dataUrl: string): Promise<Paragraph | null> {
  const parsed = parseDataUrl(dataUrl);
  const docxType = parsed ? MIME_TO_DOCX_TYPE[parsed.mime] : undefined;
  if (!parsed || !docxType) return null;

  const dimensions = await loadImageDimensions(dataUrl);
  const { width, height } = scaleToMaxWidth(dimensions.width, dimensions.height, MAX_IMAGE_WIDTH);

  return new Paragraph({
    children: [
      new ImageRun({
        type: docxType,
        data: base64ToUint8Array(parsed.base64),
        transformation: { width, height },
      }),
    ],
  });
}

async function buildSectionParagraphs(section: SrsSection, draft: Draft): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun(`${section.id}  ${section.title}`)],
    }),
  ];

  const content = draft.generated[section.id];
  if (content) {
    for (const line of content.split('\n').filter((l) => l.trim().length > 0)) {
      paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
    }
  } else {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: 'Not generated yet.', italics: true })] }));
  }

  const attached = section.diagram ? draft.diagrams[section.id] : undefined;
  if (attached) {
    const imageParagraph = await buildImageParagraph(attached.dataUrl);
    if (imageParagraph) paragraphs.push(imageParagraph);
  }

  return paragraphs;
}

/** Builds and downloads a .docx from the generated (and possibly author-edited) content. */
export async function exportWord(draft: Draft, sections: SrsSection[], fileNameStem: string): Promise<void> {
  const titleParagraphs = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(draft.title)] }),
    ...(draft.subtitle
      ? [new Paragraph({ children: [new TextRun({ text: draft.subtitle, italics: true })] })]
      : []),
  ];

  const sectionParagraphLists = await Promise.all(sections.map((s) => buildSectionParagraphs(s, draft)));

  const doc = new Document({
    title: draft.title,
    sections: [
      {
        children: [...titleParagraphs, ...sectionParagraphLists.flat()],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileNameStem}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
