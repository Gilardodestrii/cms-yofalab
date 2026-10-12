/**
 * Sanitasi HTML konten blog (server-side, tanpa dependensi).
 * Whitelist tag + atribut; skrip/style/iframe/object/embed dihapus total.
 * Dipakai sebelum simpan (server action) dan sebelum tampil (halaman publik).
 */

const ALLOWED_TAGS: Record<string, string[]> = {
  p: [],
  br: [],
  h2: [],
  h3: [],
  strong: [],
  em: [],
  u: [],
  s: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  a: ["href", "title"],
  img: ["src", "alt", "title"],
  code: [],
  pre: [],
};

const DROP_ENTIRELY = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "link",
  "meta",
]);

function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeUrl(tag: string, url: string): boolean {
  const clean = url.trim();
  if (tag === "img") return /^(https?:\/\/|\/uploads\/)/i.test(clean);
  return /^(https?:\/\/|mailto:|\/)/i.test(clean);
}

/**
 * Sanitasi satu tag pembuka/penutup. Kembalikan string aman atau "".
 * Tag tak dikenal → buang tagnya tapi pertahankan isi teksnya.
 */
function sanitizeTag(token: string): string {
  const match = /^<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>?\s*$/.exec(token);
  if (!match) return "";
  const [, rawName, rawAttrs] = match;
  const name = rawName.toLowerCase();

  if (DROP_ENTIRELY.has(name)) return `<!--${name}-->`;
  const allowed = ALLOWED_TAGS[name];
  if (!allowed) return "";

  const isClose = token.startsWith("</");
  if (isClose) return `</${name}>`;

  // Self-closing img/br → normalisasi ke <img ...> / <br>.
  let attrs = "";
  if (allowed.length > 0 && rawAttrs) {
    const attrRe = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(rawAttrs)) !== null) {
      const attrName = m[1].toLowerCase();
      const attrValue = m[3] ?? m[4] ?? m[5] ?? "";
      if (!allowed.includes(attrName)) continue;
      if (attrName === "href" || attrName === "src") {
        if (!isSafeUrl(name, attrValue)) continue;
      }
      attrs += ` ${attrName}="${escapeAttr(attrValue)}"`;
    }
  }
  return `<${name}${attrs}>`;
}

/** Sanitasi HTML: hapus komentar, buang skrip/style utuh, escape teks bebas. */
export function sanitizeHtml(dirty: string): string {
  const input = dirty.slice(0, 200_000);
  // Buang komentar HTML dulu agar tag tersembunyi tak lolos.
  const noComments = input.replace(/<!--[\s\S]*?-->/g, "");
  const parts = noComments.split(/(<[^<>]*>?)/g);

  let out = "";
  let dropDepth = 0;
  let dropTag = "";

  for (const part of parts) {
    if (!part) continue;
    if (!part.startsWith("<")) {
      if (dropDepth === 0) out += escapeText(part);
      continue;
    }
    const nameMatch = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(part);
    const tagName = nameMatch?.[1].toLowerCase() ?? "";

    if (dropDepth > 0) {
      if (tagName === dropTag) {
        if (part.startsWith("</")) dropDepth -= 1;
        else if (!part.endsWith("/>")) dropDepth += 1;
        if (dropDepth === 0) dropTag = "";
      }
      continue;
    }

    if (DROP_ENTIRELY.has(tagName) && !part.startsWith("</")) {
      if (!part.endsWith("/>")) {
        dropDepth = 1;
        dropTag = tagName;
      }
      continue;
    }

    out += sanitizeTag(part);
  }

  return out;
}
