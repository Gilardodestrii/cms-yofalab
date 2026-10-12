/**
 * Self-check sanitasi HTML (tanpa framework).
 * Jalankan: npx tsx lib/sanitize.check.ts  (atau node --experimental-strip-types)
 */
import assert from "node:assert/strict";
import { sanitizeHtml } from "./sanitize";

// 1. Tag diizinkan dipertahankan.
assert.equal(
  sanitizeHtml("<p>Halo <strong>dunia</strong></p>"),
  "<p>Halo <strong>dunia</strong></p>",
);

// 2. <script> dibuang utuh beserta isinya.
const scriptOut = sanitizeHtml("<p>aman</p><script>alert('xss')</script>");
assert.ok(!scriptOut.includes("<script"), "tag script harus hilang");
assert.ok(!scriptOut.includes("alert"), "isi script harus hilang");

// 3. Handler event (onclick) dibuang, tag dipertahankan.
const onclickOut = sanitizeHtml('<p onclick="alert(1)">teks</p>');
assert.equal(onclickOut, "<p>teks</p>");

// 4. javascript: URL pada href ditolak.
const jsUrl = sanitizeHtml('<a href="javascript:alert(1)">klik</a>');
assert.ok(!jsUrl.includes("javascript:"), "javascript: harus ditolak");

// 5. iframe dibuang.
assert.ok(
  !sanitizeHtml('<iframe src="https://evil.test"></iframe>').includes(
    "<iframe",
  ),
);

// 6. Teks mentah tanpa tag di-escape (cegah tag tak tertutup lolos).
assert.equal(sanitizeHtml("a < b & c"), "a &lt; b &amp; c");

// 7. Atribut di luar whitelist dibuang (style/class).
assert.equal(sanitizeHtml('<p class="x" style="color:red">t</p>'), "<p>t</p>");

// 8. Gambar dari /uploads diizinkan, src eksternal non-http ditolak.
assert.ok(
  sanitizeHtml('<img src="/uploads/a.png" alt="a">').includes("/uploads/a.png"),
);
assert.ok(
  !sanitizeHtml('<img src="data:text/html;base64,PHN2Zz4=">').includes("data:"),
);

// 9. Komentar HTML yang menyembunyikan tag dibuang.
assert.ok(!sanitizeHtml("<!--<script>alert(1)</script>-->").includes("script"));

// 10. Regresi URL protocol-relative: `//host` dan `///host` ditafsirkan browser
//     sebagai `https://host`, jadi harus ditolak supaya tautan di artikel tidak
//     bisa mengarahkan pembaca ke situs penyerang.
for (const url of [
  "//evil.test",
  "///evil.test",
  "/\\evil.test",
  "\\/evil.test",
]) {
  const out = sanitizeHtml(`<a href="${url}">k</a>`);
  assert.ok(
    !out.includes("evil.test"),
    `URL protocol-relative harus ditolak: ${url} -> ${out}`,
  );
}

// 11. Backslash dinormalisasi: `/\\evil` tidak boleh lolos sebagai protocol-relative.
assert.ok(
  !sanitizeHtml('<img src="/\\evil.test/a.png">').includes("evil.test"),
);

// 12. Skema berbahaya selain javascript: juga ditolak.
for (const url of [
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "blob:https://x/y",
  "file:///etc/passwd",
]) {
  const out = sanitizeHtml(`<a href="${url}">k</a>`);
  assert.ok(
    !out.includes(url.split(":")[0] + ":"),
    `skema harus ditolak: ${url} -> ${out}`,
  );
}

// 13. Jalur internal tetap diizinkan (sanitasi tidak boleh terlalu ketat).
assert.equal(
  sanitizeHtml('<a href="/product">k</a>'),
  '<a href="/product">k</a>',
);
assert.equal(
  sanitizeHtml('<a href="https://ok.test/a">k</a>'),
  '<a href="https://ok.test/a">k</a>',
);
assert.equal(
  sanitizeHtml('<a href="mailto:a@b.c">k</a>'),
  '<a href="mailto:a@b.c">k</a>',
);
assert.ok(
  sanitizeHtml('<img src="/uploads/2026/10/a.png">').includes(
    "/uploads/2026/10/a.png",
  ),
);

// 14. `img` hanya boleh dari /uploads atau http(s) — bukan halaman internal
//     (mencegah gambar dari jalur dinamis yang bisa membocorkan data).
assert.equal(sanitizeHtml('<img src="/product">'), "<img>");

// 15. Handler event gaya HTML5 dan tag berbahaya lain tetap dibuang.
assert.ok(
  !sanitizeHtml('<details open ontoggle="alert(1)">x</details>').includes(
    "ontoggle",
  ),
);
assert.ok(
  !sanitizeHtml(
    "<math><mtext><script>alert(1)</script></mtext></math>",
  ).includes("script"),
);
assert.ok(!sanitizeHtml('<base href="//evil.test/">').includes("base"));

console.log("✓ sanitizeHtml: 15 pemeriksaan lolos");
