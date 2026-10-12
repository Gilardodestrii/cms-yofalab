// Ambient declarations for plain (non-module) CSS side-effect imports.
//
// TypeScript 5.6+ enables `noUncheckedSideEffectImports` by default, which makes
// the compiler resolve side-effect imports such as `import "./globals.css"`.
// Next.js's bundled `next/types/global.d.ts` only declares `*.module.css`
// (CSS Modules), so plain `*.css` imports need an explicit declaration here.
declare module "*.css";
