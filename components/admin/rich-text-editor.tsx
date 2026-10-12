"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";

/**
 * Editor rich text Tiptap: heading, bold, italic, daftar, tautan, gambar,
 * kutipan. Menyimpan HTML via hidden input `content`.
 */
export function RichTextEditor({
  name = "content",
  initial = "",
}: {
  name?: string;
  initial?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [html, setHtml] = useState(initial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ allowBase64: false }),
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-64 border border-line rounded-sm bg-surface p-4 font-body text-base text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 prose-yofa",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && initial && editor.isEmpty) {
      editor.commands.setContent(initial);
      setHtml(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-64 rounded-sm border border-line bg-surface-muted p-4 font-body text-sm text-ink-400">
        Memuat editor…
      </div>
    );
  }

  const btn = (active: boolean) =>
    `h-8 min-w-8 px-2 font-body text-sm rounded-sm ${active ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-surface-muted"}`;

  const addLink = () => {
    const url = window.prompt("URL tautan (https://…):");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const onSelectImage = (media: MediaItem) => {
    editor.chain().focus().setImage({ src: media.path, alt: media.altText ?? media.fileName }).run();
  };

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="mb-2 flex flex-wrap gap-1 rounded-sm border border-line bg-surface p-1" role="toolbar" aria-label="Toolbar editor">
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Tebal"><strong>B</strong></button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Miring"><em>I</em></button>
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Daftar poin">•≡</button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Daftar nomor">1≡</button>
        <button type="button" className={btn(editor.isActive("link"))} onClick={addLink} title="Tautan">🔗</button>
        <button type="button" className={btn(false)} onClick={() => setPickerOpen(true)} title="Gambar dari media">🖼</button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Kutipan">❝</button>
      </div>
      <EditorContent editor={editor} />
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onSelectImage} />
    </div>
  );
}
