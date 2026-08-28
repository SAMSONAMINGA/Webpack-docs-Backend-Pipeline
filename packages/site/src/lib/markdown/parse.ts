import { marked } from "marked";

export interface ParsedHeading {
  id: string;
  text: string;
  depth: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Renders markdown to HTML, tagging every heading with a stable id so the
 * TableOfContents component's IntersectionObserver-based scroll-spy can
 * target them, and returns the flat heading list used to build the TOC.
 */
export function renderMarkdown(source: string): { html: string; headings: ParsedHeading[] } {
  const headings: ParsedHeading[] = [];

  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }) => {
    const id = slugifyHeading(text);
    headings.push({ id, text, depth });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };

  const html = marked.parse(source, { renderer, gfm: true, breaks: false }) as string;
  return { html, headings };
}
