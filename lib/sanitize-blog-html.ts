const allowedTags = new Set([
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "hr",
]);

const allowedAttributes: Record<string, Set<string>> = {
    a: new Set(["href", "target", "rel"]),
    img: new Set(["src", "alt"]),
};

const dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "svg",
    "math",
    "link",
    "meta",
    "base",
    "form",
    "input",
    "button",
    "textarea",
    "select",
];

function escapeAttribute(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function isSafeUrl(value: string) {
    const lower = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();

    return (
        lower.startsWith("https://") ||
        lower.startsWith("http://") ||
        lower.startsWith("mailto:") ||
        lower.startsWith("tel:") ||
        lower.startsWith("/") ||
        lower.startsWith("#") ||
        lower.startsWith("./") ||
        lower.startsWith("../")
    );
}

function sanitizeAttributes(tag: string, attrs = "") {
    const allowedForTag = allowedAttributes[tag];

    if (!allowedForTag) {
        return "";
    }

    const output: string[] = [];
    const attrPattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = attrPattern.exec(attrs))) {
        const name = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? "";

        if (!allowedForTag.has(name) || name.startsWith("on")) {
            continue;
        }

        if ((name === "href" || name === "src") && !isSafeUrl(value)) {
            continue;
        }

        output.push(`${name}="${escapeAttribute(value)}"`);
    }

    if (tag === "a" && output.some((attr) => attr.startsWith("target="))) {
        const hasRel = output.some((attr) => attr.startsWith("rel="));

        if (!hasRel) {
            output.push('rel="noopener noreferrer"');
        }
    }

    return output.length ? ` ${output.join(" ")}` : "";
}

export function sanitizeBlogHtml(html: string) {
    const dangerousTagsPattern = dangerousTags.join("|");

    return html
        .replace(/\0/g, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(
            new RegExp(`<\\s*(${dangerousTagsPattern})\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>`, "gi"),
            ""
        )
        .replace(new RegExp(`<\\s*\\/?\\s*(${dangerousTagsPattern})\\b[^>]*\\/?>`, "gi"), "")
        .replace(/<\/?([a-zA-Z0-9-]+)(\s[^>]*)?>/g, (match, rawTag, attrs = "") => {
            const tag = String(rawTag).toLowerCase();

            if (!allowedTags.has(tag)) {
                return "";
            }

            if (match.startsWith("</")) {
                return `</${tag}>`;
            }

            if (tag === "br" || tag === "hr") {
                return `<${tag}>`;
            }

            return `<${tag}${sanitizeAttributes(tag, attrs)}>`;
        });
}
