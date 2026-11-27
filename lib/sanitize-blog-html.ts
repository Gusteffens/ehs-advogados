import sanitizeHtml from "sanitize-html";
import slugify from "slugify";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const ALLOWED_FIGURE_LAYOUTS = new Set(["normal", "wide", "full"]);
const ALLOWED_CALLOUT_TYPES = new Set(["attention", "legal", "summary"]);

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "mark",
    "sup",
    "sub",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
    "img",
    "figure",
    "figcaption",
    "div",
    "aside",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    h2: ["id"],
    h3: ["id"],
    figure: ["data-editorial-image", "data-layout"],
    div: ["data-callout"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["https", "http"],
  },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName: string, attribs: Record<string, string>) => {
      const nextAttribs: Record<string, string> = { ...attribs };

      if (nextAttribs.target === "_blank") {
        nextAttribs.rel = "noopener noreferrer";
      } else {
        delete nextAttribs.target;
      }

      return {
        tagName,
        attribs: nextAttribs,
      };
    },
    img: (tagName: string, attribs: Record<string, string>) => {
      const nextAttribs: Record<string, string> = {
        ...attribs,
        loading: "lazy",
      };

      return {
        tagName,
        attribs: nextAttribs,
      };
    },
    figure: (tagName: string, attribs: Record<string, string>) => {
      const nextAttribs: Record<string, string> = {};

      if (attribs["data-editorial-image"] === "true") {
        nextAttribs["data-editorial-image"] = "true";
        const layout = attribs["data-layout"];
        nextAttribs["data-layout"] =
          layout && ALLOWED_FIGURE_LAYOUTS.has(layout) ? layout : "normal";
      } else if (
        attribs["data-layout"] &&
        ALLOWED_FIGURE_LAYOUTS.has(attribs["data-layout"])
      ) {
        nextAttribs["data-layout"] = attribs["data-layout"];
      }

      return {
        tagName,
        attribs: nextAttribs,
      };
    },
    div: (tagName: string, attribs: Record<string, string>) => {
      const nextAttribs: Record<string, string> = {};
      const callout = attribs["data-callout"];

      if (callout && ALLOWED_CALLOUT_TYPES.has(callout)) {
        nextAttribs["data-callout"] = callout;
      }

      return {
        tagName,
        attribs: nextAttribs,
      };
    },
  },
};

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function sanitizeBlogHtml(html: string): string {
  if (typeof html !== "string" || !html) {
    return "";
  }

  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function processBlogHtmlWithToc(rawHtml: string): {
  html: string;
  headings: TocHeading[];
} {
  const sanitized = sanitizeBlogHtml(rawHtml);
  const headings: TocHeading[] = [];
  const usedIds = new Map<string, number>();

  const html = sanitized.replace(
    /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (_match, rawLevel: string, innerHtml: string) => {
      const level = rawLevel === "3" ? 3 : 2;
      const plainText = decodeBasicEntities(innerHtml.replace(/<[^>]*>/g, " "))
        .replace(/\s+/g, " ")
        .trim();

      if (!plainText) {
        return `<h${level}>${innerHtml}</h${level}>`;
      }

      const baseId =
        slugify(plainText, { lower: true, strict: true, locale: "pt" }) ||
        `secao-${headings.length + 1}`;
      const count = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, count + 1);
      const uniqueId = count === 0 ? baseId : `${baseId}-${count + 1}`;

      headings.push({
        id: uniqueId,
        text: plainText,
        level,
      });

      return `<h${level} id="${uniqueId}">${innerHtml}</h${level}>`;
    }
  );

  return { html, headings };
}
