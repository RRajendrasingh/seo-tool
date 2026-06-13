"use client";

import { useEffect, useRef } from "react";

/**
 * CKEditor 5 Classic wrapper loaded via CDN.
 * This avoids npm dependencies and works with static Next.js exports.
 *
 * Props:
 *  - ckeditorRef: a React ref that will hold the editor instance
 *  - onChange: callback receiving the HTML string on each change
 */
export default function CKEditorBlock({ ckeditorRef, onChange }) {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initEditor = () => {
      if (!containerRef.current || !window.ClassicEditor) return;

      // Destroy previous instance if exists
      if (ckeditorRef.current) {
        ckeditorRef.current.destroy().catch(() => {});
        ckeditorRef.current = null;
      }

      window.ClassicEditor.create(containerRef.current, {
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "blockQuote",
            "insertTable",
            "mediaEmbed",
            "|",
            "undo",
            "redo",
          ],
          shouldNotGroupWhenFull: true,
        },
        heading: {
          options: [
            { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
            { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
            { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
            { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
          ],
        },
        placeholder: "Write your full article body here... Use the toolbar to format text, add lists, links, and more.",
      })
        .then((editor) => {
          ckeditorRef.current = editor;

          // Sync changes back to parent
          editor.model.document.on("change:data", () => {
            const html = editor.getData();
            if (onChange) onChange(html);
          });
        })
        .catch((err) => {
          console.error("CKEditor init error:", err);
        });
    };

    // Load the CKEditor 5 CDN script if not already loaded
    if (window.ClassicEditor) {
      initEditor();
      return;
    }

    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;

      const script = document.createElement("script");
      script.src = "https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js";
      script.async = true;
      script.onload = () => {
        initEditor();
      };
      document.head.appendChild(script);
    }

    return () => {
      if (ckeditorRef.current) {
        ckeditorRef.current.destroy().catch(() => {});
        ckeditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Dark theme overrides for CKEditor chrome */}
      <style jsx global>{`
        .ck.ck-editor__main > .ck-editor__editable {
          background: #0a0a0a !important;
          color: #e4e4e7 !important;
          border: none !important;
          min-height: 220px;
          font-size: 13px;
          line-height: 1.7;
          font-family: inherit;
          padding: 16px 20px !important;
        }
        .ck.ck-editor__main > .ck-editor__editable:focus {
          border: none !important;
          box-shadow: none !important;
        }
        .ck.ck-editor__editable h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 1em 0 0.4em;
        }
        .ck.ck-editor__editable h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #d4d4d8;
          margin: 0.8em 0 0.3em;
        }
        .ck.ck-editor__editable h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #a1a1aa;
          margin: 0.6em 0 0.25em;
        }
        .ck.ck-editor__editable ul,
        .ck.ck-editor__editable ol {
          padding-left: 1.4em;
        }
        .ck.ck-editor__editable li {
          margin-bottom: 0.2em;
        }
        .ck.ck-editor__editable a {
          color: #a78bfa;
        }
        .ck.ck-editor__editable blockquote {
          border-left: 3px solid #7c3aed;
          padding-left: 1em;
          margin: 1em 0;
          color: #a1a1aa;
          font-style: italic;
        }
        .ck.ck-editor__editable .table table {
          border-collapse: collapse;
          width: 100%;
        }
        .ck.ck-editor__editable .table td,
        .ck.ck-editor__editable .table th {
          border: 1px solid #27272a;
          padding: 6px 10px;
          font-size: 12px;
        }
        /* Toolbar styling */
        .ck.ck-toolbar {
          background: #18181b !important;
          border: none !important;
          border-bottom: 1px solid #27272a !important;
          padding: 4px 8px !important;
        }
        .ck.ck-toolbar .ck-button {
          color: #a1a1aa !important;
          border-radius: 6px !important;
        }
        .ck.ck-toolbar .ck-button:hover {
          background: #27272a !important;
          color: #fff !important;
        }
        .ck.ck-toolbar .ck-button.ck-on {
          background: #7c3aed !important;
          color: #fff !important;
        }
        .ck.ck-toolbar .ck-dropdown__button .ck-button__label {
          color: #a1a1aa !important;
        }
        .ck.ck-editor__editable.ck-focused {
          border: none !important;
          box-shadow: none !important;
        }
        .ck.ck-reset_all,
        .ck.ck-editor {
          --ck-color-base-background: #18181b;
          --ck-color-base-border: #27272a;
          --ck-color-toolbar-background: #18181b;
          --ck-color-toolbar-border: #27272a;
          --ck-color-base-foreground: #f4f4f5 !important;
          --ck-color-text: #e4e4e7 !important;
        }
        /* Dropdown panels */
        .ck.ck-dropdown__panel {
          background: #18181b !important;
          border: 1px solid #27272a !important;
        }
        .ck.ck-list__item .ck-button {
          color: #d4d4d8 !important;
        }
        .ck.ck-list__item .ck-button:hover {
          background: #27272a !important;
        }
        .ck.ck-list__item .ck-button.ck-on {
          background: #7c3aed !important;
          color: #fff !important;
        }
        .ck.ck-placeholder::before {
          color: #3f3f46 !important;
        }

        /* ── Day Mode Overrides ── */
        .light .ck.ck-reset_all,
        .light .ck.ck-editor {
          --ck-color-base-background: #ffffff;
          --ck-color-base-border: #cbd5e1;
          --ck-color-toolbar-background: #f8fafc;
          --ck-color-toolbar-border: #cbd5e1;
          --ck-color-base-foreground: #0f172a !important;
          --ck-color-text: #0f172a !important;
        }
        .light .ck.ck-editor__main > .ck-editor__editable {
          background: #ffffff !important;
          color: #0f172a !important;
        }
        .light .ck.ck-editor__editable h2 {
          color: #0f172a !important;
        }
        .light .ck.ck-editor__editable h3 {
          color: #1e293b !important;
        }
        .light .ck.ck-editor__editable h4 {
          color: #334155 !important;
        }
        .light .ck.ck-editor__editable a {
          color: #6366f1 !important;
        }
        .light .ck.ck-editor__editable blockquote {
          border-left: 3px solid #6366f1 !important;
          color: #475569 !important;
        }
        .light .ck.ck-editor__editable .table td,
        .light .ck.ck-editor__editable .table th {
          border: 1px solid #cbd5e1 !important;
        }
        .light .ck.ck-toolbar {
          background: #f8fafc !important;
          border-bottom: 1px solid #cbd5e1 !important;
        }
        .light .ck.ck-toolbar .ck-button {
          color: #475569 !important;
        }
        .light .ck.ck-toolbar .ck-button:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        .light .ck.ck-toolbar .ck-button.ck-on {
          background: #6366f1 !important;
          color: #fff !important;
        }
        .light .ck.ck-toolbar .ck-dropdown__button .ck-button__label {
          color: #475569 !important;
        }
        .light .ck.ck-dropdown__panel {
          background: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
        }
        .light .ck.ck-list__item .ck-button {
          color: #1e293b !important;
        }
        .light .ck.ck-list__item .ck-button:hover {
          background: #f1f5f9 !important;
        }
        .light .ck.ck-placeholder::before {
          color: #94a3b8 !important;
        }
      `}</style>
      <div ref={containerRef} />
    </>
  );
}
