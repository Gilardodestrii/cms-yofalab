/**
 * Self-check sanitasi HTML (tanpa framework).
 * Jalankan: npx tsx lib/sanitize.check.ts  (atau node --experimental-strip-types)
 */
import assert from "node:assert/strict";
import { sanitizeHtml } from "./sanitize";

// 1. Tag diizinkan dipertahankan.
assert.equal(sanitizeHtml("<p>Halo <strong>dunia</strong></p>"), "<p>Halo <strong>dunia</strong></p>");

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
assert.ok(!sanitizeHtml('<iframe src="https://evil.test"></iframe>').includes("<iframe"));

// 6. Teks mentah tanpa tag di-escape (cegah tag tak tertutup lolos).
assert.equal(sanitizeHtml("a < b & c"), "a &lt; b &amp; c");

// 7. Atribut di luar whitelist dibuang (style/class).
assert.equal(sanitizeHtml('<p class="x" style="color:red">t</p>'), "<p>t</p>");

// 8. Gambar dari /uploads diizinkan, src eksternal non-http ditolak.
assert.ok(sanitizeHtml('<img src="/uploads/a.png" alt="a">').includes("/uploads/a.png"));
assert.ok(!sanitizeHtml('<img src="data:text/html;base64,PHN2Zz4=">').includes("data:"));

// 9. Komentar HTML yang menyembunyikan tag dibuang.
assert.ok(!sanitizeHtml("<!--<script>alert(1)</script>-->").includes("script"));

console.log("✓ sanitizeHtml: 9 pemeriksaan lolos");
