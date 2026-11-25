import sanitizeHtml from "sanitize-html";

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
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
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
  },
};

export function sanitizeBlogHtml(html: string): string {
  if (typeof html !== "string" || !html) {
    return "";
  }

  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
